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
            const memberships = await UserGroupRelation.find({
                groupId: message.groupId,
                userId: { $ne: message.userProfileId }
            });

            console.log(`Notifying ${memberships.length} members of the group with a new message`);

            if (message.photoUri) {
                message.photoUri = await s3Service.getPhotoUrl(message.photoUri);
            }

            for (const membership of memberships) {
                const roomId = `messages.${membership.userId}`;
                io.to(roomId).emit('new-message', message);
            }
        } catch (error) {
            console.error('Error notifying group users:', error);
        }
    }
}

module.exports = new WebSocketService();