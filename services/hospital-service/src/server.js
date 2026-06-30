require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const { connectDB } = require('./config/database');
const trustedGateway = require('./middleware/trustedGateway');
const errorHandler = require('./middleware/errorHandler');
const hospitalRoutes = require('./routes/hospitals');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3002;

connectDB().catch(err => {
  logger.error('MongoDB connection failed:', err.message);
  process.exit(1);
});

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://gateway:3000',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — before gateway auth so Docker healthcheck works without secret
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'hospital-service', timestamp: new Date().toISOString() });
});

// All API routes require valid gateway secret
app.use(trustedGateway);

app.use('/api/hospitals', hospitalRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', code: 'NOT_FOUND' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Hospital service running on port ${PORT}`);
});

module.exports = app;
