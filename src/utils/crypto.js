const crypto = require('crypto');
const { promisify } = require('util');
const scrypt = promisify(crypto.scrypt);

class CryptoUtil {
  static async encrypt(text, key) {
    const iv = crypto.randomBytes(16);
    const derivedKey = await scrypt(key, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return {
      iv: iv.toString('hex'),
      content: encrypted.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex')
    };
  }

  static async decrypt(encrypted, key) {
    const derivedKey = await scrypt(key, 'salt', 32);
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm', 
      derivedKey, 
      Buffer.from(encrypted.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted.content, 'hex')), 
      decipher.final()
    ]);
    return decrypted.toString('utf8');
  }

  static hash(text) {
    return crypto.createHash('sha512').update(text).digest('hex');
  }
}

module.exports = CryptoUtil;