import { PrismaClient } from '@prisma/client';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { express as expressAsyncErrors } from 'express-async-errors';
import { app } from '../src/app';
import { env } from '../src/config/env';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Make prisma available globally
(global as any).prisma = prisma;

const server = express();

// Middleware
server.use(helmet());
server.use(cors({
  origin: env.CORS_ORIGIN || 'https://anything-ai-task-front.vercel.app',
  credentials: true
}));
server.use(express.json());
server.use(pinoHttp());
server.use(expressAsyncErrors());

// Health check
server.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Use the main app
server.use(app);

// Error handler
server.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR'
    }
  });
});

// 404 handler
server.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Not Found',
      code: 'NOT_FOUND'
    }
  });
});

export default server;
