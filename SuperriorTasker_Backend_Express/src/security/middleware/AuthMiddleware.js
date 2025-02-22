// src/security/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const userDetailsService = require('../services/UserDetailsService');
const jwtUtils = require('../utils/JwtUtils');

const authMiddleware = async (req, res, next) => {
    try {
        const token = jwtUtils.getJwtFromRequest(req);

        if (token && jwtUtils.validateToken(token)) {
            const decoded = jwtUtils.getEmailFromJwtToken(token);
            const user = await userDetailsService.loadUserByEmail(decoded.sub);
            
            if (user) {
                req.user = user;
                next();
                return;
            }
        }
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        next();
    }
};

module.exports = authMiddleware;