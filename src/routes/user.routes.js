const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Perfil do usuário
router.get('/profile', authenticate, userController.getProfile);
router.patch('/profile', authenticate, userController.updateProfile);

// Biometria
router.post('/enable-biometric', authenticate, userController.enableBiometric);

// Geolocalização
router.post('/trusted-locations', authenticate, userController.addTrustedLocation);

// Histórico de login
router.get('/login-history', authenticate, userController.getLoginHistory);

module.exports = router;