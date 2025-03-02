const express = require('express');
const router = express.Router();
const MessageService = require('../services/messageService');

router.post('/create-message', async (req, res) => {
    try {
        console.log('Creating message for some user');
        const message = req.body;
        
        const response = await MessageService.createMessage(message);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error creating message:', error);
        if (error.message.includes('No group associated') || 
            error.message.includes('No user associated')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

router.patch('/update-message-status', async (req, res) => {
    try {
        console.log('Updating message status');
        const { messageId, messageStatus } = req.query;
        
        const response = await MessageService.editMessage(messageId, messageStatus);
        res.status(200).json({ message: response });
    } catch (error) {
        console.error('Error updating message status:', error);
        if (error.message.includes('There is no message')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

router.get('/get-messages', async (req, res) => {
    try {
        const { userProfileId, groupId, page = 0, size = 4 } = req.query;
        console.log('Fetching messages with userProfileId:', userProfileId, 'and groupId:', groupId);
        
        const pageable = {
            page: parseInt(page),
            size: parseInt(size)
        };
        
        const messages = await MessageService.getAllMessages(userProfileId, groupId, pageable);
        
        if (messages.length === 0) {
            console.log('No messages found for the provided filters.');
            return res.status(200).json([]);
        }
        
        console.log('Found', messages.length, 'messages.');
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        if (error.message.includes('No group associated')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
});

module.exports = router;