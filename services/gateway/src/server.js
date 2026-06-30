require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { globalLimiter } = require('./middleware/rateLimiter');
const gatewayAuth = require('./middleware/gatewayAuth');
const { mountProxyRoutes } = require('./routes/proxy');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());

// Global rate limiter
app.use(globalLimiter);

// Gateway auth: verifies JWTs and attaches forwarded headers before proxying
app.use(gatewayAuth);

// Health check (before proxies)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'gateway',
    services: ['auth', 'hospital'],
    timestamp: new Date().toISOString(),
  });
});

// Proxy routes
mountProxyRoutes(app);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', code: 'NOT_FOUND' });
});

app.listen(PORT, () => {
  console.info(`[INFO] Gateway running on port ${PORT}`);
});

module.exports = app;
