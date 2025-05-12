const logger = require('../utils/logger');

module.exports = {
  logRequests: (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info({
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
    });

    next();
  },

  logErrors: (err, req, res, next) => {
    logger.error({
      error: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });
    next(err);
  }
};