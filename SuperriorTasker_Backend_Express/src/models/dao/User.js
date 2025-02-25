const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'], 
        trim: true,
        maxLength: 50,
        unique: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        maxLength: 120
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxLength: 50
    },
    description: {
        type: String,
        maxLength: 120
    },
    photoUri: String,
    fcmToken: String
}, {
    timestamps: { 
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

userSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', userSchema, 'users');