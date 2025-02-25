const User = require('../models/dao/User');
const UserGroupRelation = require('../models/dao/UserGroupRelation');
const Group = require('../models/dao/Group');
const s3Service = require('./s3Service');  // You'll need to create this
const { getLoggedInUserId } = require('../security/utils/helper/helper');
const UserProfileEditResponse = require('../models/dto/UserProfileEditResponse');
const UserToAddInGroupResponse = require('../models/dto/UserToAddInGroupResponse');

class UserService {
    async editUserProfile(firstName, lastName, description, photoFile, req) {
        console.log("Get loged in user id ", getLoggedInUserId(req) )
        const userProfile = await User.findById(getLoggedInUserId(req));
        console.log("User is fetched ", userProfile);
        
        if (!userProfile) {
            throw new Error('UserProfile is null');
        }

        if (photoFile) {
            try {
                const fileName = userProfile.id;
                const path = 'profilePhotos';
                
                const photoUri = await s3Service.updateFileInS3(path, fileName, photoFile.buffer);
                userProfile.photoUri = photoUri;
            } catch (error) {
                console.error('Error updating the profile photo', error);
                throw new Error('Failed to update the UserProfile photo');
            }
        }

        if (firstName?.trim()) {
            userProfile.firstName = firstName;
        }

        if (lastName?.trim()) {
            userProfile.lastName = lastName;
        }

        if (description?.trim()) {
            userProfile.description = description;
        }

        await userProfile.save();

        console.log('UserProfile successfully updated');

        const profileUrl = await s3Service.getPhotoUrl(userProfile.photoUri);

        return new UserProfileEditResponse({
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            description: userProfile.description,
            profileUri: profileUrl
        })
    }

    async validateGroup(groupId) {
        const group = await Group.findById(groupId);
        if (!group) {
            throw new Error(`No group found with ID: ${groupId}`);
        }
    }

    buildNameSearchCriteria(search) {
        if (!search?.trim()) {
            return {};
        }

        const searchTerms = search.trim().split(/\s+/);
        if (searchTerms.length === 1) {
            return {
                $or: [
                    { firstName: { $regex: searchTerms[0], $options: 'i' } },
                    { lastName: { $regex: searchTerms[0], $options: 'i' } }
                ]
            };
        }

        return {
            $or: [
                {
                    $and: [
                        { firstName: { $regex: searchTerms[0], $options: 'i' } },
                        { lastName: { $regex: searchTerms[searchTerms.length - 1], $options: 'i' } }
                    ]
                },
                {
                    $and: [
                        { lastName: { $regex: searchTerms[0], $options: 'i' } },
                        { firstName: { $regex: searchTerms[searchTerms.length - 1], $options: 'i' } }
                    ]
                },
                ...searchTerms.map(term => ({
                    $or: [
                        { firstName: { $regex: term, $options: 'i' } },
                        { lastName: { $regex: term, $options: 'i' } }
                    ]
                }))
            ]
        };
    }

    async fetchUserByNameAndNotHisGroup(groupId, search, pageable) {
        await this.validateGroup(groupId);

        const existingUserIds = await UserGroupRelation.find({ groupId })
            .distinct('userId');

        const searchCriteria = this.buildNameSearchCriteria(search);
        const query = {
            ...searchCriteria,
            _id: { $nin: existingUserIds }
        };

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(pageable.page * pageable.size)
            .limit(pageable.size)
            .select('firstName lastName email photoUri description');

        const usersWithPhotoUrls = await Promise.all(users.map(async (user) => {
            const photoUrl = await s3Service.getPhotoUrl(user.photoUri);
            
            return new UserToAddInGroupResponse({
                userId: user._id,
                firstName: user.firstName,
                lastName: user.lastName, 
                description: user.description,
                photoUrl: photoUrl, 
            });
        }));

        return usersWithPhotoUrls;
    }

    async fetchUsersOfTheGroupWithText(groupId, search, pageable) {
        await this.validateGroup(groupId);

        const groupUserIds = await UserGroupRelation.find({ groupId })
            .distinct('userId');

        const searchCriteria = this.buildNameSearchCriteria(search);
        const query = {
            ...searchCriteria,
            _id: { $in: groupUserIds }
        };

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(pageable.page * pageable.size)
            .limit(pageable.size)
            .select('firstName lastName email photoUri description');

        const usersWithPhotoUrls = await Promise.all(users.map(async (user) => {
            const photoUrl = await s3Service.getPhotoUrl(user.photoUri);
            
            return new UserToAddInGroupResponse({
                userId: user._id,
                firstName: user.firstName,
                lastName: user.lastName, 
                description: user.description,
                photoUrl: photoUrl, 
            });
        }));
        
        return usersWithPhotoUrls;
    }
}

module.exports = new UserService();