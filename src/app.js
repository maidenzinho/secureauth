require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { logRequests, logErrors } = require('./middlewares/log.middleware');
const { initializePassport } = require('./config/auth');
const { connectDB } = require('./config/db');
const { apiLimiter, authLimiter } = require('./middlewares/rateLimit.middleware');
const setupSwagger = require('./docs/swagger');
const HealthChecker = require('./healthcheck');
const { client: promClient } = require('./config/monitoring');

// Inicialização do aplicativo Express
const app = express();

// ==================================================
// 1. Configurações Básicas
// ==================================================
app.set('trust proxy', process.env.TRUSTED_PROXIES || 'loopback');

// ==================================================
// 2. Middlewares Essenciais
// ==================================================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logRequests);

// ==================================================
// 3. Segurança
// ==================================================
require('./config/security')(app); // Configurações do Helmet e CSP

app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate Limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/recover', authLimiter);

// ==================================================
// 4. Autenticação
// ==================================================
app.use(passport.initialize());
initializePassport();

// ==================================================
// 5. Banco de Dados
// ==================================================
connectDB();

// ==================================================
// 6. Monitoramento
// ==================================================
promClient.collectDefaultMetrics();
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// ==================================================
// 7. Documentação
// ==================================================
if (process.env.NODE_ENV !== 'production') {
  setupSwagger(app);
}

// ==================================================
// 8. Rotas
// ==================================================
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));

// Health Check Avançado
app.get('/health', async (req, res) => {
  const health = await HealthChecker.fullCheck();
  res.status(health.database.status === 'healthy' ? 200 : 503).json(health);
});

// ==================================================
// 9. Manipulação de Erros
// ==================================================
app.use(logErrors);
app.use(require('./middlewares/error.middleware'));

// ==================================================
// 10. Inicialização do Servidor
// ==================================================
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Documentação: http://localhost:${PORT}/api-docs`);
});

// ==================================================
// 11. Tratamento de Shutdown Graceful
// ==================================================
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

module.exports = app; // Para testes