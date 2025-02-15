const mongoose = require('mongoose');
const TaskStatus = require('../enums/TaskStatus');

const taskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Group'
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
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
    taskStatus: {
        type: String,
        enum: Object.values(TaskStatus),
        default: TaskStatus.TODO
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

module.exports = mongoose.model('Task', taskSchema);