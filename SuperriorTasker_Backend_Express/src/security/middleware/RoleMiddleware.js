const authService = require('../services/authService');

const checkRole = (groupId, ...requiredRoles) => {
    return async (req, res, next) => {
        try {
            const hasRequiredRole = await authService.hasRole(groupId, ...requiredRoles);
            if (hasRequiredRole) {
                next();
            } else {
                res.status(403).json({ message: 'Forbidden: Insufficient role permissions' });
            }
        } catch (error) {
            res.status(403).json({ message: error.message });
        }
    };
};

module.exports = {
    checkRole
};