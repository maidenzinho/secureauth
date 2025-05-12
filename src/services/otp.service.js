const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

module.exports = {
  generateOTP: (email) => {
    const secret = speakeasy.generateSecret({ length: 20 });
    const uri = speakeasy.otpauthURL({
      secret: secret.base32,
      label: `SecureAuth:${email}`,
      issuer: 'SecureAuth'
    });
    
    return { secret: secret.base32, uri };
  },
  
  verifyOTP: (token, secret) => {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1
    });
  },
  
  generateQRCode: async (uri) => {
    try {
      return await QRCode.toDataURL(uri);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      return null;
    }
  }
};