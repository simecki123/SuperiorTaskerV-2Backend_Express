const UserGroupRelation = require('../models/dao/UserGroupRelation');
const s3Service = require('./s3Service');
let io;

class WebSocketService {
    initialize(server) {
        io = require('socket.io')(server, {
            cors: {
                origin: process.env.FRONTEND_URL,
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        io.on('connection', (socket) => {
            console.log('User connected:', socket.id);
            
            socket.on('join', (userId) => {
                if (userId) {
                    console.log(`User ${userId} joined room: messages.${userId}`);
                    socket.join(`messages.${userId}`);
                }
            });

            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
            });
        });

        console.log('WebSocket service initialized');
    }

    async notifyGroupUsersOfNewMessage(message) {
        try {
            // Ensure IDs are strings for querying
            const groupId = message.groupId.toString();
            const userProfileId = message.userProfileId.toString();
            
            console.log(`Finding members of group ${groupId} excluding sender ${userProfileId}`);
            
            // Query for all members of the group except the sender
            const memberships = await UserGroupRelation.find({
                groupId: groupId,
                userId: { $ne: userProfileId }
            });

            console.log(`Notifying ${memberships.length} members of the group with a new message`);

            // Process message for sending
            const messageToSend = { ...message };
            
            // Ensure all IDs are strings
            if (messageToSend._id) messageToSend.id = messageToSend._id.toString();
            if (messageToSend.groupId) messageToSend.groupId = messageToSend.groupId.toString();
            if (messageToSend.userProfileId) messageToSend.userProfileId = messageToSend.userProfileId.toString();
            
            // Get photo URL if needed
            if (messageToSend.photoUri) {
                messageToSend.photoUri = await s3Service.getPhotoUrl(messageToSend.photoUri);
            }

            // Notify each member
            for (const membership of memberships) {
                const userId = membership.userId.toString();
                const roomId = `messages.${userId}`;
                console.log(`Emitting message to user ${userId} in room ${roomId}`);
                io.to(roomId).emit('new-message', messageToSend);
            }
        } catch (error) {
            console.error('Error notifying group users:', error);
        }
    }
}

module.exports = new WebSocketService();