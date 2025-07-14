import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rootRouter from './routes';
import { PrismaClient } from '@prisma/client';
import { PORT, SESSION_SECRET, NODE_ENV, CLIENT_URL, FRONTEND_URL } from './secrets';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middlewares/errors';
import { createLogger } from './services/logger';
import { healthCheck } from './controllers/health';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { globalLimiter, authLimiter } from './config/rateLimiters';
import { securityHeaders, requestLogger, sanitizeInput, detectSuspiciousActivity } from './middlewares/security';
import { sessionMiddleware } from './middlewares/sessionManager';
import './config/passport';

const app = express();
const server = createServer(app);
export const prisma = new PrismaClient();
const logger = createLogger('server');

// Apply security middleware early
app.use(securityHeaders);
app.use(globalLimiter);
app.use(requestLogger);

// Configure CORS origins based on environment
const allowedOrigins = NODE_ENV === 'production' 
  ? [
      CLIENT_URL, 
      FRONTEND_URL,
      'https://mytutor-mx8r.onrender.com',
      'https://mytutor-frontend.onrender.com'
    ].filter((url): url is string => Boolean(url))
  : ['http://localhost:3000', 'http://localhost:3001'];

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request from origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
}));

// Session configuration
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax'
  },
  name: 'mytutor.session'
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security middleware
app.use(sanitizeInput);
app.use(detectSuspiciousActivity);
app.use(sessionMiddleware);

// Static files
app.use(express.static('uploads'));

// Health check endpoint
app.get('/health', healthCheck);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'MyTutor Backend API',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: NODE_ENV,
    security: {
      cors: allowedOrigins.length > 0 ? 'configured' : 'open',
      rateLimit: 'enabled',
      authentication: 'jwt-based',
      sessionManagement: 'enabled'
    }
  });
});

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  }
});

const onlineUsers = new Map<string, string>();

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId as string;
  
  if (userId) {
    onlineUsers.set(userId, socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    logger.info('User connected to socket', { userId, socketId: socket.id });
  }

  socket.on('disconnect', () => {
    if (userId) {
      onlineUsers.delete(userId);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      logger.info('User disconnected from socket', { userId, socketId: socket.id });
    }
  });

  socket.on('sendMessage', async (message) => {
    try {
      const newMessage = await prisma.chat.create({
        data: {
          senderId: message.senderId,
          receiverId: message.receiverId,
          message: message.message,
          connectedId: message.connectedId
        }
      });

      const receiverSocketId = onlineUsers.get(message.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', newMessage);
      }
      
      logger.debug('Message sent', { 
        senderId: message.senderId, 
        receiverId: message.receiverId 
      });
    } catch (error) {
      logger.error('Error saving message:', error);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  socket.on('typing', ({ receiverId, isTyping }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userTyping', { connectedId: userId, isTyping });
    }
  });
});

// API routes
app.use('/api', rootRouter);

// Error handling middleware (must be last)
app.use(errorMiddleware);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    prisma.$disconnect();
    process.exit(0);
  });
});

server.listen(PORT, async () => {
  try {
    await prisma.$connect();
    logger.info(`🚀 MyTutor Backend Server running on port ${PORT}`);
    logger.info(`📊 Environment: ${NODE_ENV}`);
    logger.info(`🔒 Security features enabled`);
    logger.info(`🌐 CORS origins: ${allowedOrigins.join(', ')}`);
  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1);
  }
});
