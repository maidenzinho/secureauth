const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('./email.service');
const { generateOTP } = require('./otp.service');

class AuthService {
  async register(email, password) {
    // Verifica se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // Cria novo usuário
    const user = new User({ email, password });
    await user.save();

    // Gera token de verificação
    const verificationToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_VERIFICATION_SECRET,
      { expiresIn: '1d' }
    );

    // Envia email de verificação
    await sendEmail({
      to: email,
      subject: 'Verifique sua conta',
      text: `Por favor, verifique sua conta clicando no link: ${process.env.BASE_URL}/verify-email?token=${verificationToken}`
    });

    return user;
  }

  async verifyEmail(token) {
    const decoded = jwt.verify(token, process.env.JWT_VERIFICATION_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new Error('Link de verificação inválido');
    }
    
    user.isVerified = true;
    await user.save();
    return user;
  }

  async login(email, password, ip, userAgent, location) {
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Credenciais inválidas');
    }
    
    if (!user.isVerified) {
      throw new Error('Por favor, verifique seu email primeiro');
    }
    
    // Registra tentativa de login
    user.loginHistory.push({
      ip,
      userAgent,
      location,
      timestamp: new Date(),
      status: 'success'
    });
    
    user.lastLogin = new Date();
    await user.save();
    
    // Gera token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled,
        biometricEnabled: user.biometricEnabled
      }
    };
  }

  async enableTwoFactor(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('Usuário não encontrado');
    
    const { secret, uri } = generateOTP(user.email);
    user.twoFactorEnabled = true;
    user.otpSecret = secret;
    await user.save();
    
    return { secret, uri };
  }

  async verifyTwoFactor(userId, token) {
    const user = await User.findById(userId).select('+otpSecret');
    if (!user || !user.twoFactorEnabled) {
      throw new Error('Autenticação de dois fatores não habilitada');
    }
    
    const isValid = verifyOTP(token, user.otpSecret);
    if (!isValid) {
      throw new Error('Token de autenticação inválido');
    }
    
    // Gera token JWT com escopo completo
    return jwt.sign(
      { userId: user._id, twoFactorVerified: true },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }
}

// Biometria
module.exports = new AuthService();

// Recuperação de senha
router.post('/recover/initiate', validators.emailValidator, authController.initiateRecovery);
router.post('/recover/complete', validators.recoveryValidator, authController.completeRecovery);