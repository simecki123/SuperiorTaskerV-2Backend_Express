// src/security/services/authService.js
const bcrypt = require('bcryptjs');
const User = require('../../models/dao/User');
const UserGroupRelation = require('../../models/dao/UserGroupRelation');
const userDetailsService = require('./UserDetailsService');
const jwtUtils = require('../utils/JwtUtils');
const LoginResponse = require('../api/dto/LoginResponse');
const RegisterUserResponse = require('../api/dto/RegisterUserResponse');

class AuthService {
    async fetchMe(token) {
        try {
            const decoded = jwtUtils.getEmailFromJwtToken(token);
            if (!decoded || !decoded.sub) {
                throw new Error('Invalid token');
            }

            const user = await User.findOne({ email: decoded.sub });
            if (!user) {
                throw new Error('User not found');
            }

            const userGroupRelations = await UserGroupRelation.find({ userId: user.id });

            return {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                description: user.description,
                profileUri: user.photoUri,
                groupMembershipData: userGroupRelations
            };
        } catch (error) {
            console.error('FetchMe error in service:', error);
            throw new Error('User not found in security context');
        }
    }

    async login(loginRequest) {
        const user = await User.findOne({ email: loginRequest.email });
        if (!user) {
            throw new Error('Unauthorized: User not found');
        }

        const isPasswordValid = await bcrypt.compare(loginRequest.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Unauthorized: Invalid password');
        }

        const userDetails = await userDetailsService.loadUserByEmail(loginRequest.email);
        const token = jwtUtils.generateJwtToken(userDetails);

        return new LoginResponse(token);
    }

    async register(registerRequest) {
        const existingUser = await User.findOne({ email: registerRequest.email });
        if (existingUser) {
            throw new Error('Email is already taken or it is not entered in correct format!');
        }

        const hashedPassword = await bcrypt.hash(registerRequest.password, 10);
        
        const user = new User({
            email: registerRequest.email,
            password: hashedPassword,
            firstName: registerRequest.firstName,
            lastName: registerRequest.lastName,
            description: registerRequest.description 
        });

        const savedUser = await user.save();
        return new RegisterUserResponse(savedUser._id);
    }

    async hasRole(groupId, ...requiredRoles) {
        if (!req.user) {
            return false;
        }

        const groupMembership = await UserGroupRelation.findOne({
            userId: req.user.id,
            groupId: groupId
        });

        if (!groupMembership) {
            throw new Error('No membership for this group associated with the user profile');
        }

        return requiredRoles.includes(groupMembership.role);
    }
}

module.exports = new AuthService();