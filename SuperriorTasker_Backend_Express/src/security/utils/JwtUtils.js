const jwt = require('jsonwebtoken');
require('dotenv').config();

class JwtUtils {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET;
        this.jwtExpirationMs = parseInt(process.env.JWT_EXPIRATION_MS);
        this.jwtCookieName = process.env.JWT_COOKIE_NAME;
    }

    generateJwtToken(userDetails) {
        return jwt.sign(
            {
                sub: userDetails.email,
                id: userDetails.id
            },
            this.jwtSecret,
            {
                expiresIn: this.jwtExpirationMs
            }
        );
    }

    getEmailFromJwtToken(token) {
        return jwt.verify(token, this.jwtSecret);
    }

    createJwtCookie(token) {
        return {
            name: this.jwtCookieName,
            value: token,
            options: {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                path: '/',
                maxAge: this.jwtExpirationMs
            }
        };
    }

    getJwtFromRequest(req) {
        const token = req.cookies[this.jwtCookieName] || 
                     (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));
        return token || null;
    }

    validateToken(token) {
        try {
            jwt.verify(token, this.jwtSecret);
            return true;
        } catch (error) {
            console.error('JWT validation error:', error.message);
            return false;
        }
    }
}

module.exports = new JwtUtils();