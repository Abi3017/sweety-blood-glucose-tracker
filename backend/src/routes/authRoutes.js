const express = require('express');
const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { registerSchema, loginSchema } = require('../validations/authValidation');

const router = express.Router();

// Slows down brute-force and credential-stuffing attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => env.isTest,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many attempts. Please wait a few minutes and try again.' },
  },
});

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

module.exports = router;
