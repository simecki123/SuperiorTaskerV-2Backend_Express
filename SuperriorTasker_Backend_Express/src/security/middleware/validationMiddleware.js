const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validateLoginRequest = [
    body('email')
        .isEmail()
        .withMessage('Email must be valid')
        .notEmpty()
        .withMessage('Email is required')
        .isLength({ max: 50 })
        .withMessage('Email must not exceed 50 characters'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 1, max: 40 })
        .withMessage('Password must be between 1 and 40 characters'),
    handleValidationErrors
];

const validateRegisterRequest = [
    ...validateLoginRequest,
    body('firstName')
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ max: 40 })
        .withMessage('First name must not exceed 40 characters'),
    body('lastName')
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ max: 40 })
        .withMessage('Last name must not exceed 40 characters'),
    body('description')
        .optional(),
    handleValidationErrors
];

module.exports = {
    validateLoginRequest,
    validateRegisterRequest
};