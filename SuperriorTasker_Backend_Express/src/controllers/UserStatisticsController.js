const express = require('express');
const router = express.Router();
const UserStatisticsService = require('../services/UserStatisticsService');

router.get('/get-user-stats', async (req, res) => {
    try {
        console.log('Fetching user statistics...');
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        
        const userStats = await UserStatisticsService.getUserStats(userId);
        res.status(200).json(userStats);
    } catch (error) {
        console.error('Error fetching user statistics:', error);
        if (error.message.includes('User with ID') && error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

module.exports = router;