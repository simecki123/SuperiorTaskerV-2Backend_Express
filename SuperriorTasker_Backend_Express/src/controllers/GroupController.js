const express = require("express");
const router = express.Router();
const GroupService = require("../services/groupService");
const UserGroupRelationService = require("../services/userGroupRelationService");
const ChangeGroupAdminDto = require("../models/dto/ChangeGroupAdminDto");
const { hasRole } = require("../security/utils/helper/helper");
const multer = require("multer");
const upload = multer();

router.post("/createGroup", upload.single("photoUri"), async (req, res) => {
  try {
    console.log("Creating new group...");
    const { name, description } = req.body;
    const photoFile = req.file;

    const response = await GroupService.createGroup(
      name,
      description,
      photoFile,
      req
    );
    res.status(200).json(response);
  } catch (error) {
    console.error("Error creating group:", error);
    if (error.message.includes("Group name already exists")) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

router.get("/get-all-user-groups", async (req, res) => {
  try {
    console.log("Getting all groups for user...");
    const { userId, page = 0, size = 4 } = req.query;

    const pageable = {
      page: parseInt(page),
      size: parseInt(size),
    };

    const groups = await GroupService.getAllUserGroups(userId, pageable);
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error getting user groups:", error);
    if (error.message.includes("No group associated")) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

router.get("/get-group-by-id", async (req, res) => {
  try {
    console.log("Getting group by its id");
    const { groupId } = req.query;

    const group = await GroupService.getGroupById(groupId);
    res.status(200).json(group);
  } catch (error) {
    console.error("Error getting group:", error);
    if (error.message.includes("No group associated")) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

router.get("/get-all-group-members", async (req, res) => {
  try {
    console.log("Fetching all users that belong to this group...");
    const { groupId, page = 0, size = 4 } = req.query;

    const pageable = {
      page: parseInt(page),
      size: parseInt(size),
    };

    const users = await GroupService.getGroupMembers(groupId, pageable, req);

    if (users.length === 0) {
      console.log(`No members found for groupId: ${groupId}`);
      return res.status(200).json([]);
    }

    console.log(`Found ${users.length} members`);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error getting group members:", error);
    if (error.message.includes("No group associated")) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

router.patch("/change-role-for-group-user", async (req, res) => {
  try {
    console.log("Changing admin of the group...");
    const changeGroupAdminDto = new ChangeGroupAdminDto(req.body);
    await GroupService.promoteUser(changeGroupAdminDto);
    res
      .status(200)
      .json({
        message: "Successfully changed role of the user for this group...",
      });
  } catch (error) {
    console.error("Error changing role:", error);
    res.status(400).json({ message: error.message });
  }
});

router.patch("/editGroup", upload.single("file"), async (req, res) => {
  try {
    console.log("Editing group info");
    const { groupId, name, description } = req.body;
    const file = req.file;

    const isAdmin = await hasRole(req, groupId, "ADMIN");
    if (!isAdmin) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User is not an admin of this group" });
    }

    const response = await GroupService.editGroupInfo(
      groupId,
      name,
      description,
      file
    );
    res.status(200).json(response);
  } catch (error) {
    console.error("Error editing group:", error);
    if (error.message.includes("No group associated")) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

router.post("/add-new-user-to-group", async (req, res) => {
  try {
    console.log("Create new user group Relation...");
    const { userId, groupId } = req.query;

    const isAdmin = await hasRole(req, groupId, "ADMIN");
    if (!isAdmin) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User is not an admin of this group" });
    }

    const response = await UserGroupRelationService.createNewUserGroupRelation(
      userId,
      groupId
    );
    console.log("User added to the group...");
    res.status(200).json(response);
  } catch (error) {
    console.error("Error adding user to group:", error);
    if (
      error.message.includes("No group associated") ||
      error.message.includes("User doesn't exist")
    ) {
      res.status(404).json({ message: error.message });
    } else if (error.message.includes("already a member")) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

router.post("/add-users-to-group", async (req, res) => {
  try {
    console.log("Creating multiple user group relations...");
    const { groupId } = req.query;
    const users = req.body;

    const isAdmin = await hasRole(req, groupId, "ADMIN");
    if (!isAdmin) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User is not an admin of this group" });
    }

    const response =
      await UserGroupRelationService.createMultipleUserGroupRelations(
        users,
        groupId
      );
    res.status(200).json(response);
  } catch (error) {
    console.error("Error adding users to group:", error);
    if (
      error.message.includes("No group associated") ||
      error.message.includes("User doesn't exist")
    ) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

router.delete("/leave-group", async (req, res) => {
  try {
    console.log("User leaving group...");
    const { userId, groupId } = req.query;

    const response = await UserGroupRelationService.removeUserFromGroup(
      userId,
      groupId,
      false,
      req
    );
    res.status(200).json({ message: response });
  } catch (error) {
    console.error("Error leaving group:", error);
    if (
      error.message.includes("No group associated") ||
      error.message.includes("User doesn't exist") ||
      error.message.includes("User is not a member")
    ) {
      res.status(404).json({ message: error.message });
    } else if (
      error.message.includes("Admin users cannot") ||
      error.message.includes("Only admins can")
    ) {
      res.status(401).json({ message: error.message });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

router.delete("/kick-from-group", async (req, res) => {
  try {
    console.log("Kicking user from group...");
    const { userId, groupId } = req.query;

    const response = await UserGroupRelationService.removeUserFromGroup(
      userId,
      groupId,
      true,
      req
    );
    res.status(200).json({ message: response });
  } catch (error) {
    console.error("Error kicking user from group:", error);
    if (
      error.message.includes("No group associated") ||
      error.message.includes("User doesn't exist") ||
      error.message.includes("User is not a member")
    ) {
      res.status(404).json({ message: error.message });
    } else if (
      error.message.includes("Admin users cannot") ||
      error.message.includes("Only admins can")
    ) {
      res.status(401).json({ message: error.message });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

module.exports = router;
