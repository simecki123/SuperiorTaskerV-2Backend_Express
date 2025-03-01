const jwtUtils = require('../JwtUtils');
const UserGroupRelation = require('../../../models/dao/UserGroupRelation');
const jsonwebtoken = require('jsonwebtoken');

const getLoggedInUserId = (req) => {
    console.log("Getting token to fetch user ", req)
    const token = jwtUtils.getJwtFromRequest(req);
    if (!token) return null;

    try {
        const decoded = jwtUtils.getEmailFromJwtToken(token);
        return decoded.id;
    } catch (error) {
        return null;
    }
};

async function hasRole(req, groupId, ...roles) {
    try {
        const token = req.cookies.jwt || 
                    (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));

        console.log("Token", token);
        
        if (!token) return false;
        
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET); 

        console.log("Decoded ", decoded)
        if (!decoded || !decoded.id) return false;
        
        const userGroupRelation = await UserGroupRelation.findOne({
            userId: decoded.id,
            groupId: groupId
        });

        console.log("user group relation ", userGroupRelation);
        
        if (!userGroupRelation) return false;
        
        return roles.includes(userGroupRelation.role);
    } catch (error) {
        console.error('Error checking role:', error);
        return false;
    }
}

module.exports = {
    getLoggedInUserId,
    hasRole
};