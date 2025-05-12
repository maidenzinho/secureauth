const { getAsync, setAsync, delAsync } = require('../config/redis');

class TokenBlacklist {
  static async add(token, expiresIn) {
    await setAsync(`blacklist:${token}`, '1');
    await this.#setExpiration(token, expiresIn);
  }

  static async isBlacklisted(token) {
    return await getAsync(`blacklist:${token}`) === '1';
  }

  static async #setExpiration(token, expiresIn) {
    // Converte expiresIn (segundos) para milissegundos
    const ttl = Math.ceil(expiresIn * 1000);
    setTimeout(async () => {
      await delAsync(`blacklist:${token}`);
    }, ttl);
  }
}

module.exports = TokenBlacklist;