// src/security/services/userDetailsService.js
const User = require('../../models/dao/User');

class UserDetailsService {
    async loadUserByEmail(email) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('User not found with email: ' + email);
            }
            return this.buildUserDetails(user);
        } catch (error) {
            throw new Error('Error loading user: ' + error.message);
        }
    }

    buildUserDetails(user) {
        return {
            id: user._id,
            email: user.email,
            password: user.password,
            firstName: user.firstName,
            lastName: user.lastName,
            description: user.description,
            photoUri: user.photoUri,
            isEnabled: true,
            isAccountNonExpired: true,
            isCredentialsNonExpired: true,
            isAccountNonLocked: true
        };
    }
}

module.exports = new UserDetailsService();