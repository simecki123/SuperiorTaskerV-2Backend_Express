const mongoose = require('mongoose');
const MessageStatus = require('../enums/MessageStatus');

const messageSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: [true, 'Group ID is required'],
        maxLength: 50
    },
    message: {
        type: String,
        required: [true, 'Message content is required'],
        maxLength: 200
    },
    messageStatus: {
        type: String,
        enum: Object.values(MessageStatus),
        required: true
    },
    userProfileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    firstName: String,
    lastName: String,
    photoUri: String
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

module.exports = mongoose.model('Message', messageSchema);