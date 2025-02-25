const jwtUtils = require('../JwtUtils');

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

module.exports = {
    getLoggedInUserId
};