// server.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./src/security/middleware/authMiddleware');
const authController = require('./src/security/api/controllers/authController');
const userController = require('./src/controllers/UserController'); 
const groupController = require('./src/controllers/groupController');
const projectController = require('./src/controllers/projectController');
const taskController = require('./src/controllers/taskController');
require('dotenv').config();
const connectDB = require('./src/config/database');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes (no auth middleware needed for these)
app.use('/api/auth', authController);

app.use('/api/users', authMiddleware, userController);

app.use('/api/groups', authMiddleware, groupController);

app.use('/api/projects', authMiddleware, projectController);

app.use('/api/tasks', authMiddleware, taskController);

// Protected routes (everything else under /api)
app.use('/api/*', authMiddleware, (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});