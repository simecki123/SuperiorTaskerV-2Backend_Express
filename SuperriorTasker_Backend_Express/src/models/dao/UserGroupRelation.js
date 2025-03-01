const mongoose = require('mongoose');
const Role = require('../enums/Role');

const userGroupRelationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        maxLength: 50
    },
    groupId: {
        type: String,
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

module.exports = mongoose.model('UserGroupRelation', userGroupRelationSchema, 'user-group-relation');