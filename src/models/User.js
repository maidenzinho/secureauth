const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  biometricEnabled: {
    type: Boolean,
    default: false
  },
  biometricData: {
    type: String,
    select: false
  },
  trustedLocations: [{
    latitude: Number,
    longitude: Number,
    radius: Number, // em metros
    label: String
  }],
  otpSecret: {
    type: String,
    select: false
  },
  lastLogin: {
    type: Date
  },
  loginHistory: [{
    ip: String,
    userAgent: String,
    location: {
      latitude: Number,
      longitude: Number
    },
    timestamp: Date,
    status: String // 'success' ou 'failed'
  }]
}, { timestamps: true });

// Hash da senha antes de salvar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método para comparar senhas
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);