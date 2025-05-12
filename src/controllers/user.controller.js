const User = require('../models/User');
const BiometricService = require('../services/biometric.service');
const GeoService = require('../services/geo.service');
const { success, error } = require('../utils/response');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otpSecret -biometricData');
    success(res, user);
  } catch (err) {
    error(res, 'Failed to get profile', 500, err);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['email', 'password'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return error(res, 'Invalid updates!', 400);
    }

    const user = await User.findById(req.user._id);
    updates.forEach(update => user[update] = req.body[update]);
    await user.save();

    success(res, { message: 'Profile updated successfully' });
  } catch (err) {
    error(res, 'Failed to update profile', 500, err);
  }
};

exports.enableBiometric = async (req, res) => {
  try {
    const { biometricData } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!biometricData) {
      return error(res, 'Biometric data is required', 400);
    }

    user.biometricData = BiometricService.storeBiometricData(biometricData);
    user.biometricEnabled = true;
    await user.save();

    success(res, { message: 'Biometric authentication enabled' });
  } catch (err) {
    error(res, 'Failed to enable biometric', 500, err);
  }
};

exports.addTrustedLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius, label } = req.body;
    
    if (!latitude || !longitude) {
      return error(res, 'Latitude and longitude are required', 400);
    }

    const locationData = { latitude, longitude, radius: radius || 5000, label: label || 'New Location' };
    const user = await GeoService.addTrustedLocation(req.user._id, locationData);
    
    success(res, { trustedLocations: user.trustedLocations });
  } catch (err) {
    error(res, 'Failed to add trusted location', 500, err);
  }
};

exports.getLoginHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('loginHistory');
    success(res, user.loginHistory);
  } catch (err) {
    error(res, 'Failed to get login history', 500, err);
  }
};