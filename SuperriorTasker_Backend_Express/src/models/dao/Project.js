const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: [true, 'Group ID is required'],
        maxLength: 50
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        maxLength: 50
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxLength: 50
    },
    description: {
        type: String,
        maxLength: 120
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    completion: {
        type: Number,
        required: [true, 'Completion percentage is required'],
        min: 0,
        max: 100
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

module.exports = mongoose.model('Project', projectSchema);