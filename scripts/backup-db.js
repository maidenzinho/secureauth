const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');

async function backupDatabase() {
  try {
    await connectDB();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const users = await User.find({});
    const backupData = {
      timestamp: new Date(),
      users
    };

    const backupPath = path.join(backupDir, `backup-${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    console.log(`Backup created at ${backupPath}`);
    process.exit(0);
  } catch (err) {
    console.error('Backup failed:', err);
    process.exit(1);
  }
}

backupDatabase();