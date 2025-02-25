const express = require('express');
const router = express.Router();
const AuthService = require('../../services/authService');
const { validateLoginRequest, validateRegisterRequest } = require('../../middleware/validationMiddleware');
const jwtUtils = require('../../utils/JwtUtils');
const authMiddleware = require('../../middleware/authMiddleware');

router.post('/register', validateRegisterRequest, async (req, res) => {
    try {
        const response = await AuthService.register(req.body);
        res.status(200).json(response);
    } catch (error) {
        if (error.message.includes('Email is already taken')) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
});

router.post('/login', validateLoginRequest, async (req, res) => {
    try {
        const response = await AuthService.login(req.body);
        const cookie = jwtUtils.createJwtCookie(response.accessToken);
        
        res.cookie(cookie.name, cookie.value, cookie.options)
           .status(200)
           .json(response);
    } catch (error) {
        if (error.message.includes('Unauthorized')) {
            res.status(401).json({ message: error.message });
        } else if (error.message.includes('Forbidden')) {
            res.status(403).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
});

router.get('/fetchMe', authMiddleware, async (req, res) => {
    try {
        console.log(req.cookies.jwt);
        const token = jwtUtils.getJwtFromRequest(req);
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const user = await AuthService.fetchMe(token);
        res.status(200).json(user);
    } catch (error) { 
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;