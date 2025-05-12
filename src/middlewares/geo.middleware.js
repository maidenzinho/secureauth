const GeoService = require('../services/geo.service');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const location = req.body.location;
    
    if (!location) {
      return res.status(400).json({ error: 'Localização não fornecida' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    const isTrusted = GeoService.isTrustedLocation(user, location);
    
    if (!isTrusted) {
      return res.status(403).json({ 
        error: 'Acesso não permitido desta localização',
        requiresLocationVerification: true
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};