const { body } = require('express-validator');
const User = require('../models/User');

module.exports = {
  registerValidator: [
    body('email')
      .isEmail().withMessage('Email inválido')
      .normalizeEmail()
      .custom(async email => {
        const user = await User.findOne({ email });
        if (user) throw new Error('Email já está em uso');
        return true;
      }),
    body('password')
      .isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres')
      .matches(/[A-Z]/).withMessage('Senha deve conter pelo menos uma letra maiúscula')
      .matches(/[0-9]/).withMessage('Senha deve conter pelo menos um número')
  ],

  loginValidator: [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').notEmpty().withMessage('Senha é obrigatória'),
    body('location.latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude inválida'),
    body('location.longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude inválida')
  ],

  twoFactorValidator: [
    body('token')
      .isLength({ min: 6, max: 6 }).withMessage('Token deve ter 6 dígitos')
      .isNumeric().withMessage('Token deve conter apenas números')
  ],

  biometricValidator: [
    body('biometricData')
      .notEmpty().withMessage('Dados biométricos são obrigatórios')
      .isLength({ min: 64 }).withMessage('Dados biométricos inválidos')
  ],
  emailValidator: [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail()
  ],

  recoveryValidator: [
    body('token').notEmpty().withMessage('Token é obrigatório'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres')
      .matches(/[A-Z]/).withMessage('Senha deve conter pelo menos uma letra maiúscula')
  ],

};