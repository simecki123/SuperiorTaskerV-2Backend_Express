const Message = require("../models/dao/Message");
const User = require("../models/dao/User");
const Group = require("../models/dao/Group");
const UserGroupRelation = require("../models/dao/UserGroupRelation");
const s3Service = require("./s3Service");
const websocketService = require("./websocketService");
const MessageResponse = require("../models/dto/MessageResponse");

class MessageService {
  async createMessage(messageRequest) {
    // For string ID fields, we need to check them differently
    const group = await Group.findById(messageRequest.groupId).catch(
      () => null
    );
    if (!group) {
      // Try to find by string field if ObjectId lookup fails
      const groupByString = await Group.findOne({
        _id: messageRequest.groupId,
      }).catch(() => null);
      if (!groupByString) {
        throw new Error("No group associated with the groupId");
      }
    }

    const user = await User.findById(messageRequest.userId).catch(() => null);
    if (!user) {
      // Try to find by string field if ObjectId lookup fails
      const userByString = await User.findOne({
        _id: messageRequest.userId,
      }).catch(() => null);
      if (!userByString) {
        throw new Error("No user associated with user Id");
      }
    }

    // Create message with string IDs
    const message = new Message({
      groupId: messageRequest.groupId,
      userProfileId: messageRequest.userId,
      message: messageRequest.message,
      messageStatus: "UNREAD",
      firstName: user
        ? user.firstName
        : userByString
        ? userByString.firstName
        : messageRequest.firstName,
      lastName: user
        ? user.lastName
        : userByString
        ? userByString.lastName
        : messageRequest.lastName,
      photoUri: user
        ? user.photoUri
        : userByString
        ? userByString.photoUri
        : messageRequest.photoUri,
    });

    const savedMessage = await message.save();
    console.log("Message created...", savedMessage);

    // Make sure the websocket notification sends correct IDs
    await websocketService.notifyGroupUsersOfNewMessage({
      ...savedMessage.toObject(),
      groupId: savedMessage.groupId.toString(),
      userProfileId: savedMessage.userProfileId.toString(),
      _id: savedMessage._id.toString(),
    });

    return new MessageResponse({
      id: savedMessage._id.toString(),
      message: savedMessage.message,
      messageStatus: savedMessage.messageStatus,
      firstName: savedMessage.firstName,
      lastName: savedMessage.lastName,
      photoUri: savedMessage.photoUri,
      groupId: savedMessage.groupId.toString(),
      userProfileId: savedMessage.userProfileId.toString(),
    });
  }

  async editMessage(messageId, messageStatus) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error("There is no message with associated id");
    }

    message.messageStatus = messageStatus;
    await message.save();

    return "Message updated";
  }

  async getAllMessages(userProfileId, groupId, pageable) {
    console.log(
      "Getting messages for userProfileId:",
      userProfileId,
      "and groupId:",
      groupId
    );

    // SECURITY FIX: First verify the user belongs to the specified groups
    if (!userProfileId) {
      throw new Error("User profile ID is required");
    }

    // Get all groups this user belongs to
    const userGroups = await UserGroupRelation.find({ userId: userProfileId });
    console.log(`Found ${userGroups.length} groups for user ${userProfileId}`);

    const userGroupIds = userGroups.map((ug) => ug.groupId.toString());

    if (userGroupIds.length === 0) {
      // User doesn't belong to any groups
      return [];
    }

    let query = {};

    if (groupId) {
      // Check if user is member of the specified group
      if (!userGroupIds.includes(groupId.toString())) {
        throw new Error("User does not have access to this group");
      }

      // User is verified as a member of this group
      query.groupId = groupId;

      // Double-check group exists
      const groupExists = await Group.findOne({ _id: groupId }).catch(
        () => null
      );
      if (!groupExists) {
        throw new Error("No group associated with the groupId");
      }
    } else {
      // No specific group requested, return messages from all groups the user belongs to
      query.groupId = { $in: userGroupIds };
    }

    console.log("Query:", JSON.stringify(query));

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(pageable.page * pageable.size)
      .limit(pageable.size);

    console.log(`Found ${messages.length} messages`);

    // Process and convert ObjectIds to strings for consistency
    const processedMessages = await Promise.all(
      messages.map(async (message) => {
        const messageObj = message.toObject();

        // Convert ObjectId to string for consistent API
        if (messageObj._id) messageObj.id = messageObj._id.toString();
        if (messageObj.groupId)
          messageObj.groupId = messageObj.groupId.toString();
        if (messageObj.userProfileId)
          messageObj.userProfileId = messageObj.userProfileId.toString();

        // Get photo URL if needed
        if (messageObj.photoUri) {
          messageObj.photoUri = await s3Service.getPhotoUrl(
            messageObj.photoUri
          );
        }

        return messageObj;
      })
    );

    return processedMessages;
  }
}

module.exports = new MessageService();
