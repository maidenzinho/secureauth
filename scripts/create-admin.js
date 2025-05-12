require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { connectDB } = require('../src/config/db');

async function createAdmin() {
  try {
    await connectDB();
    
    const admin = new User({
      email: process.env.ADMIN_EMAIL || 'admin@secureauth.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@1234',
      isVerified: true,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
}

createAdmin();