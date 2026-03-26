import { PrismaClient } from '@prisma/client';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { express as expressAsyncErrors } from 'express-async-errors';
import 'dotenv/config';

// Initialize Express app
const server = express();

// Middleware
server.use(helmet());
server.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://anything-ai-task-front.vercel.app',
  credentials: true
}));
server.use(express.json());
server.use(pinoHttp());
server.use(expressAsyncErrors());

// Initialize Prisma
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

// Make prisma available globally
(global as any).prisma = prisma;

// Health check
server.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic test endpoint
server.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes - simplified
server.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: { message: 'Email and password required', code: 'VALIDATION_ERROR' } 
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: { message: 'User already exists', code: 'USER_EXISTS' } 
      });
    }

    // Hash password
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || email.split('@')[0],
        role: 'USER'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({ user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } 
    });
  }
});

server.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: { message: 'Email and password required', code: 'VALIDATION_ERROR' } 
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ 
        error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' } 
      });
    }

    // Check password
    const bcrypt = require('bcrypt');
    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({ 
        error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' } 
      });
    }

    // Generate JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } 
    });
  }
});

// Error handler
server.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR'
    }
  });
});

// 404 handler
server.use('*', (req: any, res: any) => {
  res.status(404).json({
    error: {
      message: 'Not Found',
      code: 'NOT_FOUND'
    }
  });
});

export default server;
