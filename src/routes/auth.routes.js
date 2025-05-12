const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validators = require('../validators/auth.validator');

// Autenticação básica
router.post('/register', validators.registerValidator, authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', validators.loginValidator, authController.login);

// Autenticação de dois fatores
router.post('/enable-2fa', authenticate, authController.enableTwoFactor);
router.post('/verify-2fa', validators.twoFactorValidator, authController.verifyTwoFactor);

// Biometria
router.post('/verify-biometric', validators.biometricValidator, authController.verifyBiometric);

// OAuth
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleAuthCallback);

// Logout
router.post('/logout', authenticate, authController.logout);

module.exports = router;