const mongoose = require('mongoose');
const TaskStatus = require('../enums/TaskStatus');

const taskSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    groupId: {
        type: String,
        required: true,
        ref: 'Group'
    },
    projectId: {
        type: String,
        required: true,
        ref: 'Project'
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(TaskStatus),
        default: TaskStatus.IN_PROGRESS
    } 
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

module.exports = mongoose.model('Task', taskSchema);