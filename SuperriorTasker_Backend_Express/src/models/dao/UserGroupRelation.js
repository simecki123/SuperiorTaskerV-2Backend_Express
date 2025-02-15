// src/models/dao/UserGroupRelation.js
const mongoose = require('mongoose');
const Role = require('../enums/Role');

const userGroupRelationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        maxLength: 50
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: [true, 'Group ID is required'],
        maxLength: 50
    },
    role: {
        type: String,
        enum: Object.values(Role),
        required: true
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

module.exports = mongoose.model('UserGroupRelation', userGroupRelationSchema);