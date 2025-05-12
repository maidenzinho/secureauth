const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configuração do rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: 'Too many requests from this IP, please try again later'
});

// Configuração do CSP
const cspOptions = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", 'trusted.cdn.com'],
    styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
    imgSrc: ["'self'", 'data:', 'storage.googleapis.com'],
    fontSrc: ["'self'", 'fonts.gstatic.com'],
    connectSrc: ["'self'", 'api.example.com'],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: []
  }
};

module.exports = (app) => {
  app.use(helmet());
  app.use(helmet.contentSecurityPolicy(cspOptions));
  app.use(limiter);
  app.use(helmet.hsts({
    maxAge: 63072000, // 2 anos em segundos
    includeSubDomains: true,
    preload: true
  }));
  app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
};