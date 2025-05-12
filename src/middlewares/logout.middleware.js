const jwt = require('jsonwebtoken');
const TokenBlacklist = require('../services/tokenBlacklist.service');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    await TokenBlacklist.add(token, decoded.exp - Math.floor(Date.now() / 1000));
    next();
  } catch (error) {
    next(error);
  }
};