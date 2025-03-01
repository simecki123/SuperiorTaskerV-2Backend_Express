const UserGroupRelation = require('../models/dao/UserGroupRelation');
const User = require('../models/dao/User');
const Group = require('../models/dao/Group');
const Task = require('../models/dao/Task');
const { getLoggedInUserId } = require('../security/utils/helper/helper');
const mongoose = require('mongoose');
const UserGroupRelationDto = require('../models/dto/UserGroupRelationDto');
const UserGroupRelationResponse = require('../models/dto/UserGroupRelationResponse');

class UserGroupRelationService {
    async getMembershipsByUserId(userId, pageable) {
        console.log('Fetching all user group relations for this user...');
        
        const memberships = await UserGroupRelation.find({ userId })
            .skip(pageable.page * pageable.size)
            .limit(pageable.size);
        
        console.log(`Found ${memberships.length} results`);
        
        return memberships.map(membership => 
            new UserGroupRelationDto({
                groupId: membership.groupId,
                userId: membership.userId,
                userRole: membership.role
        }));
    }
    
    async getMembershipsByGroupId(groupId, pageable) {
        console.log('Fetching all user group relations for this group...');
        
        const memberships = await UserGroupRelation.find({ groupId })
            .skip(pageable.page * pageable.size)
            .limit(pageable.size);
        
        console.log(`Found ${memberships.length} results`);
        
        return memberships.map(membership => 
            new UserGroupRelationDto({
                groupId: membership.groupId,
                userId: membership.userId,
                userRole: membership.role
        }));
    }
    
    async createNewUserGroupRelation(userId, groupId) {
        const group = await Group.findById(groupId);
        if (!group) {
            throw new Error('No group associated with the groupId');
        }
        
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User doesn\'t exist...');
        }
        
        const existingRelation = await UserGroupRelation.findOne({ userId, groupId });
        if (existingRelation) {
            throw new Error('This user is already a member of this group');
        }
        
        console.log('User group relation is under creation process...');
        
        const newRelation = new UserGroupRelation({
            groupId,
            userId,
            role: 'USER'
        });
        
        await newRelation.save();

        return new UserGroupRelationResponse({
            id: newRelation._id,
            userId: newRelation.userId,
            groupId: newRelation.groupId,
            role: newRelation.role
        });
    }
    
    async createMultipleUserGroupRelations(users, groupId) {
        console.log('Searching for a valid group using id that was given');
        
        const group = await Group.findById(groupId);
        if (!group) {
            throw new Error('No group associated with the groupId');
        }
        
        console.log('Group found...');
        const responses = [];
        
        for (const user of users) {
            console.log('Verifying that user we want to add exists');
            
            const existingUser = await User.findById(user.userId);
            if (!existingUser) {
                throw new Error('User doesn\'t exist...');
            }
            
            console.log('Checking if user is already part of this group');
            
            const existingRelation = await UserGroupRelation.findOne({ 
                userId: user.userId, 
                groupId 
            });
            
            if (existingRelation) {
                console.error('User is already part of that group');
                continue; 
            }
            
            console.log('User is not a part of this group lets make him...');
            
            const newRelation = new UserGroupRelation({
                groupId,
                userId: user.userId,
                role: 'USER'
            });
            
            await newRelation.save();
            
            responses.push(
                new UserGroupRelationResponse({
                    id: newRelation._id,
                    userId: newRelation.userId,
                    groupId: newRelation.groupId,
                    role: newRelation.role
                })
            );
        }
        
        return responses;
    }
    
    async removeUserFromGroup(userId, groupId, isKick, req) {
        const group = await Group.findById(groupId);
        if (!group) {
            throw new Error('No group associated with the groupId');
        }
        
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User doesn\'t exist');
        }
        
        const loggedInUserId = getLoggedInUserId(req);
        if (!loggedInUserId) {
            throw new Error('User not authenticated');
        }
        
        const targetUserRelation = await UserGroupRelation.findOne({ userId, groupId });
        if (!targetUserRelation) {
            throw new Error('User is not a member of this group');
        }
        
        const loggedInUserRelation = await UserGroupRelation.findOne({ 
            userId: loggedInUserId, 
            groupId 
        });
        
        if (targetUserRelation.role === 'ADMIN') {
            throw new Error('Admin users cannot be removed from the group');
        }
        
        if (isKick && (!loggedInUserRelation || loggedInUserRelation.role !== 'ADMIN')) {
            throw new Error('Only admins can kick users');
        }
        
        const userTasks = await Task.find({ userId, groupId });
        const newUserId = isKick ? loggedInUserId : 
                         (loggedInUserRelation && loggedInUserRelation.role === 'ADMIN') ? 
                         loggedInUserId : null;
        
        if (newUserId) {
            for (const task of userTasks) {
                task.userId = newUserId;
                await task.save();
            }
        }
        
        await UserGroupRelation.deleteOne({ _id: targetUserRelation._id });
        
        return isKick ? 'User kicked from group successfully' : 'User left group successfully';
    }
}

module.exports = new UserGroupRelationService();