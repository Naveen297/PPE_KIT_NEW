import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { rateLimiter } from './middlewares/rateLimiter';
import { db } from './database/connection';
import routes from './routes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  },
});

// Store io instance globally
app.set('io', io);

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
}));
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Rate limiting
app.use('/api/', rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use(notFoundHandler);

// Error Handler (must be last)
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('join-plant', (plantId: string) => {
    socket.join(`plant-${plantId}`);
    logger.info(`Client ${socket.id} joined plant ${plantId}`);
  });

  socket.on('leave-plant', (plantId: string) => {
    socket.leave(`plant-${plantId}`);
    logger.info(`Client ${socket.id} left plant ${plantId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing server gracefully...');

  httpServer.close(() => {
    logger.info('HTTP server closed');
  });

  try {
    await db.end();
    logger.info('Database connections closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await db.query('SELECT NOW()');
    logger.info('Database connection established');

    const PORT = config.port;
    httpServer.listen(PORT, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   PPE Detection System - Backend API                     ║
║   Environment: ${config.nodeEnv.padEnd(42)}║
║   Port: ${PORT.toString().padEnd(48)}║
║   API Version: ${config.apiVersion.padEnd(42)}║
║                                                           ║
║   📚 Documentation: http://localhost:${PORT}/api/docs    ║
║   ❤️  Health Check: http://localhost:${PORT}/health      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, io };
