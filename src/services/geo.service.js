const geolib = require('geolib');

module.exports = {
  isTrustedLocation: (user, currentLocation) => {
    if (!user.trustedLocations || user.trustedLocations.length === 0) {
      return true; // Se não há locais confiáveis definidos, permite o acesso
    }
    
    return user.trustedLocations.some(location => {
      return geolib.isPointWithinRadius(
        { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
        { latitude: location.latitude, longitude: location.longitude },
        location.radius || 5000 // Raio padrão de 5km
      );
    });
  },
  
  addTrustedLocation: async (userId, locationData) => {
    const User = require('../models/User');
    return await User.findByIdAndUpdate(
      userId,
      { $push: { trustedLocations: locationData } },
      { new: true }
    );
  }
};