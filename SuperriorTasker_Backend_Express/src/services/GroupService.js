const Group = require('../models/dao/Group');
const User = require('../models/dao/User');
const UserGroupRelation = require('../models/dao/UserGroupRelation');
const s3Service = require('./s3Service');
const userGroupRelationService = require('./userGroupRelationService');
const { getLoggedInUserId } = require('../security/utils/helper/helper');
const mongoose = require('mongoose');
const GroupResponse = require('../models/dto/GroupResponse');
const GroupDto = require('../models/dto/GroupDto');
const GroupEditResponse = require('../models/dto/GroupEditResponse');
const GroupMemberResponse = require('../models/dto/GroupMemberResponse');

class GroupService {
    async createGroup(name, description, photoFile, req) {
        const existingGroup = await Group.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingGroup) {
            throw new Error(`Group name already exists: ${name}`);
        }

        const group = new Group({
            name,
            description
        });

        await group.save();

        if (photoFile) {
            try {
                const path = 'groupPhotos';
                const fileName = group._id.toString();
                
                await s3Service.updateFileInS3(path, fileName, photoFile.buffer);
                
                group.photoUri = `${path}/${fileName}`;
                await group.save(); 
            } catch (error) {
                console.error('Error updating the group photo', error);
                throw new Error('Failed to update the group photo');
            }
        }

        const userId = getLoggedInUserId(req);
        const userGroupRelation = new UserGroupRelation({
            groupId: group._id,
            userId: userId,
            role: 'ADMIN'
        });

        await userGroupRelation.save();

        return new GroupResponse({
            groupId: group._id,
            name: group.name,
            description: group.description
        })

    }

    async getGroupById(groupId) {
        const group = await Group.findById(groupId);
        if (!group) {
            throw new Error('No group associated with that id');
        }

        const photoUrl = await s3Service.getPhotoUrl(group.photoUri);

        return new GroupDto({
            id: group._id,
            name: group.name,
            description: group.description,
            photoUri: photoUrl
        })

    }

    async editGroupInfo(groupId, name, description, photoFile) {
        const group = await Group.findById(groupId);
        if (!group) {
            throw new Error('No group associated with the groupId');
        }

        if (photoFile) {
            try {
                const path = 'groupPhotos';
                const fileName = groupId;
                
                await s3Service.updateFileInS3(path, fileName, photoFile.buffer);
                group.photoUri = `${path}/${fileName}`;
            } catch (error) {
                console.error('Error updating the group photo', error);
                throw new Error('Failed to update the group photo');
            }
        }

        if (name?.trim()) {
            group.name = name;
        }

        if (description?.trim()) {
            group.description = description;
        }

        await group.save();

        const photoUrl = await s3Service.getPhotoUrl(group.photoUri);

        return new GroupEditResponse({
            name: group.name,
            description: group.description,
            photoUri: photoUrl
        })

    }

    async getAllUserGroups(userId, pageable) {
        const memberships = await userGroupRelationService.getMembershipsByUserId(userId, pageable);
        
        const groupPromises = memberships.map(async (membership) => {
            const group = await Group.findById(membership.groupId);
            if (!group) {
                throw new Error('There is a relation between user and a group that doesn\'t exist');
            }

            const photoUrl = await s3Service.getPhotoUrl(group.photoUri);
            
            return new GroupDto({
                id: group._id,
                name: group.name,
                description: group.description,
                photoUri: photoUrl
            })
        });

        return Promise.all(groupPromises);
    }

    async getGroupMembers(groupId, pageable, req) {
        const group = await Group.findById(groupId);
        if (!group) {
            throw new Error('No group associated with the groupId');
        }
    
        const loggedInUserId = getLoggedInUserId(req);
        if (!loggedInUserId) {
            throw new Error('User not authenticated');
        }
    
        const memberships = await userGroupRelationService.getMembershipsByGroupId(groupId, pageable);
        
        const memberPromises = memberships.map(async (membership) => {
            if (membership.userId === loggedInUserId) {
                return null;
            }
    
            const user = await User.findById(membership.userId);
            if (!user) {
                throw new Error('Trying to fetch a user that doesn\'t exist');
            }
    
            const photoUrl = await s3Service.getPhotoUrl(user.photoUri);
    
            return new GroupMemberResponse({
                userId: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                description: user.description,
                role: membership.role,
                photoUri: photoUrl
            })
            
        });
    
        const members = await Promise.all(memberPromises);
        return members.filter(member => member !== null); 
    }

    async promoteUser(changeGroupAdminDto) {
        const group = await Group.findById(changeGroupAdminDto.groupId);
        if (!group) {
            throw new Error('No group associated with the groupId');
        }
    
        const membership = await UserGroupRelation.findOne({
            userId: changeGroupAdminDto.userId,
            groupId: changeGroupAdminDto.groupId
        });
    
        if (!membership) {
            throw new Error('User is not a member of this group');
        }
    
        if (membership.role !== changeGroupAdminDto.role) {
            membership.role = changeGroupAdminDto.role;
            await membership.save();
            console.log(`Role ${changeGroupAdminDto.role} assigned to user ${changeGroupAdminDto.userId} in group ${changeGroupAdminDto.groupId}`);
        } else {
            console.log(`User ${changeGroupAdminDto.userId} already has role ${changeGroupAdminDto.role} in group ${changeGroupAdminDto.groupId}`);
        }
    }
}

module.exports = new GroupService();