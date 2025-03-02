const Message = require('../models/dao/Message');
const User = require('../models/dao/User');
const Group = require('../models/dao/Group');
const UserGroupRelation = require('../models/dao/UserGroupRelation');
const s3Service = require('./s3Service');
const websocketService = require('./websocketService');
const MessageResponse = require('../models/dto/MessageResponse');

class MessageService {
    async createMessage(messageRequest) {
        const group = await Group.findById(messageRequest.groupId);
        if (!group) {
            throw new Error('No group associated with the groupId');
        }

        const user = await User.findById(messageRequest.userId);
        if (!user) {
            throw new Error('No user associated with user Id');
        }

        const message = new Message({
            groupId: messageRequest.groupId,
            userProfileId: messageRequest.userId,
            message: messageRequest.message,
            messageStatus: 'UNREAD',
            firstName: user.firstName,
            lastName: user.lastName,
            photoUri: user.photoUri
        });

        const savedMessage = await message.save();
        console.log('Message created...');

        await websocketService.notifyGroupUsersOfNewMessage(savedMessage);

        return new MessageResponse({
            id: savedMessage._id,
            message: savedMessage.message,
            messageStatus: savedMessage.messageStatus,
            firstName: savedMessage.firstName,
            lastName: savedMessage.lastName,
            photoUri: savedMessage.photoUri,
        });
    }

    async editMessage(messageId, messageStatus) {
        const message = await Message.findById(messageId);
        if (!message) {
            throw new Error('There is no message with associated id');
        }

        message.messageStatus = messageStatus;
        await message.save();

        return 'Message updated';
    }

    async getAllMessages(userProfileId, groupId, pageable) {
        let query = {};

        if (groupId) {
            const group = await Group.findById(groupId);
            if (!group) {
                throw new Error('No group associated with the groupId');
            }
            query.groupId = groupId;
        } else if (userProfileId) {
            const userGroups = await UserGroupRelation.find({ userId: userProfileId });
            const groupIds = userGroups.map(ug => ug.groupId);

            if (groupIds.length > 0) {
                query.groupId = { $in: groupIds };
            }
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .skip(pageable.page * pageable.size)
            .limit(pageable.size);

        const processedMessages = await Promise.all(messages.map(async (message) => {
            const messageObj = message.toObject();
            if (messageObj.photoUri) {
                messageObj.photoUri = await s3Service.getPhotoUrl(messageObj.photoUri);
            }
            return messageObj;
        }));

        return processedMessages;
    }
}

module.exports = new MessageService();