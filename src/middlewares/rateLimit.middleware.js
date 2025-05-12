const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redisClient = require('../config/redis');

const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    expiry: 15 * 60 // 15 minutos
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
  message: {
    error: "Too many requests",
    details: "Por favor, tente novamente mais tarde"
  }
});

const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    expiry: 60 * 60 // 1 hora
  }),
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // Apenas 5 tentativas de login por hora
  message: {
    error: "Too many login attempts",
    details: "Conta temporariamente bloqueada por segurança"
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};