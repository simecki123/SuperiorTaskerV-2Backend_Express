const express = require('express');
const router = express.Router();
const authMiddleware = require('../security/middleware/authMiddleware');
const UserService = require('../services/UserService');
const multer = require('multer');
const upload = multer();

router.use(authMiddleware);

router.patch('/update-user', upload.single('file'), async (req, res) => {
    try {
        console.log('Editing user info');
        const { firstName, lastName, description } = req.body;
        const file = req.file;
        console.log("userr updatee")
        const response = await UserService.editUserProfile(firstName, lastName, description, file, req);
        console.log("user is updated....")
        res.status(200).json(response);
    } catch (error) {
        if (error.message === 'UserProfile is null') {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

router.get('/add-new-member-to-group', async (req, res) => {
    try {
        console.log('Fetching users not in group:', req.query.groupId);
        const { groupId, search, page = 0, size = 4 } = req.query;
        
        const pageable = {
            page: parseInt(page),
            size: parseInt(size)
        };

        const users = await UserService.fetchUserByNameAndNotHisGroup(groupId, search, pageable);
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(400).json({ message: error.message });
    }
});

router.get('/get-users-for-task-creation', async (req, res) => {
    try {
        console.log('Searching for users...');
        const { groupId, search, page = 0, size = 4 } = req.query;
        
        const pageable = {
            page: parseInt(page),
            size: parseInt(size)
        };

        const users = await UserService.fetchUsersOfTheGroupWithText(groupId, search, pageable);
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
