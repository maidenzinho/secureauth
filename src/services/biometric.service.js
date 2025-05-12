const crypto = require('crypto');

module.exports = {
  // Simula o armazenamento de dados biométricos
  storeBiometricData: (biometricData) => {
    // Na prática, isso seria feito no dispositivo do usuário
    const hash = crypto.createHash('sha256').update(biometricData).digest('hex');
    return hash;
  },
  
  // Simula a verificação biométrica
  verifyBiometric: (storedData, currentData) => {
    const currentHash = crypto.createHash('sha256').update(currentData).digest('hex');
    return storedData === currentHash;
  }
};