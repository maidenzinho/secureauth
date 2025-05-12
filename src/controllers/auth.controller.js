const AuthService = require('../services/auth.service');
const BiometricService = require('../services/biometric.service');
const GeoService = require('../services/geo.service');
const { generateOTP, verifyOTP, generateQRCode } = require('../services/otp.service');
const TokenBlacklist = require('../services/tokenBlacklist.service');

exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await AuthService.register(email, password);
    res.status(201).json({ message: 'Usuário registrado. Verifique seu email.' });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    await AuthService.verifyEmail(token);
    res.status(200).json({ message: 'Email verificado com sucesso' });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const location = req.body.location; // { latitude, longitude }
    
    const result = await AuthService.login(email, password, ip, userAgent, location);
    
    // Verificação de geolocalização
    const isTrustedLocation = GeoService.isTrustedLocation(result.user, location);
    if (!isTrustedLocation) {
      return res.status(403).json({ 
        message: 'Login a partir de localização não confiável',
        requiresLocationVerification: true,
        token: result.token
      });
    }
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.enableTwoFactor = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { secret, uri } = await AuthService.enableTwoFactor(userId);
    
    // Gerar QR Code
    const qrCode = await generateQRCode(uri);
    
    res.status(200).json({ secret, uri, qrCode });
  } catch (error) {
    next(error);
  }
};

exports.verifyTwoFactor = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { token } = req.body;
    
    const fullToken = await AuthService.verifyTwoFactor(userId, token);
    res.status(200).json({ token: fullToken });
  } catch (error) {
    next(error);
  }
};

exports.verifyBiometric = async (req, res, next) => {
  try {
    const { biometricData } = req.body;
    const user = req.user;
    
    if (!user.biometricEnabled) {
      return res.status(400).json({ message: 'Biometria não habilitada para este usuário' });
    }
    
    const isValid = BiometricService.verifyBiometric(user.biometricData, biometricData);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Verificação biométrica falhou' });
    }
    
    // Gera token com verificação biométrica
    const token = jwt.sign(
      { userId: user._id, biometricVerified: true },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
};

exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

exports.googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', (err, user) => {
    if (err) return next(err);
    
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Redireciona para o frontend com o token
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  })(req, res, next);
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
      await TokenBlacklist.add(token, decoded.exp - Math.floor(Date.now() / 1000));
    }

    res.clearCookie('token');
    res.status(200).json({ message: "Logout realizado com sucesso" });
  } catch (error) {
    next(error);
  }
};