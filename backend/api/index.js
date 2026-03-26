const { PrismaClient } = require('@prisma/client');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { pinoHttp } = require('pino-http');
const { express: expressAsyncErrors } = require('express-async-errors');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp());
app.use(expressAsyncErrors());

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import routes (will be created by build process)
let api;
try {
  api = require('./dist/index.js');
} catch (err) {
  console.error('API routes not found. Make sure to build the project first.');
  process.exit(1);
}

// Use API routes
app.use('/api', api.default || api);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Not Found',
      code: 'NOT_FOUND'
    }
  });
});

module.exports = app;
