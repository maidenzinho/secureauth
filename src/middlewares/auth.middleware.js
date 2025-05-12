const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = {
  // Middleware de autenticação básica
  authenticate: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido' });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Falha na autenticação' });
    }
  },

  // Middleware para verificar autenticação de dois fatores
  checkTwoFactor: (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded.twoFactorVerified) {
        return res.status(403).json({ 
          error: 'Autenticação de dois fatores necessária',
          twoFactorRequired: true
        });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  }
};