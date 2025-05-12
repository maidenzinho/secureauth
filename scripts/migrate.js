const mongoose = require('mongoose');
const User = require('../src/models/User');
const { connectDB } = require('../src/config/db');

async function migrate() {
  try {
    await connectDB();
    
    // Adicione aqui quaisquer migrações necessárias
    console.log('Running migrations...');
    
    // Exemplo: Atualizar todos os usuários para terem isVerified=true
    await User.updateMany({}, { $set: { isVerified: true } });
    
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();