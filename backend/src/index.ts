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
import './services/meetingNotification'; // Import meeting notification service to initialize background scheduler

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
  : [
      'http://localhost:3000', 
      'http://localhost:3001', 
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or same-origin)
    if (!origin) return callback(null, true);
    
    // In development, be more permissive
    if (NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request from origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 200
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

// Handle preflight OPTIONS requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin,Cache-Control,X-File-Name');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

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
  },
  transports: ['websocket', 'polling']
});

const onlineUsers = new Map<string, string>();

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId as string;
  
  if (userId) {
    onlineUsers.set(userId, socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    logger.info('User connected to socket', { userId, socketId: socket.id });
  }

  // Join conversation room
  socket.on('joinConversation', (connectedId: string) => {
    socket.join(connectedId);
    logger.debug('User joined conversation', { userId, connectedId });
  });

  // Leave conversation room
  socket.on('leaveConversation', (connectedId: string) => {
    socket.leave(connectedId);
    logger.debug('User left conversation', { userId, connectedId });
  });

  socket.on('disconnect', () => {
    if (userId) {
      onlineUsers.delete(userId);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      logger.info('User disconnected from socket', { userId, socketId: socket.id });
    }
  });

  socket.on('sendMessage', async (message, callback) => {
    try {
      const newMessage = await prisma.chat.create({
        data: {
          senderId: message.senderId,
          receiverId: message.receiverId,
          message: message.message,
          connectedId: message.connectedId
        }
      });

      // Emit to all users in the conversation
      io.to(message.connectedId).emit('newMessage', newMessage);

      // Send delivery status to sender
      const receiverSocketId = onlineUsers.get(message.receiverId);
      if (receiverSocketId) {
        // No status update, just emit delivery event
        io.to(receiverSocketId).emit('messageStatus', {
          messageId: newMessage.id,
          status: 'delivered'
        });
      }

      // Send success callback to sender
      if (callback) {
        callback({ success: true, message: newMessage });
      }

      logger.debug('Message sent', {
        messageId: newMessage.id,
        senderId: message.senderId,
        receiverId: message.receiverId
      });
    } catch (error) {
      logger.error('Error saving message:', error);
      if (callback) {
        callback({ success: false, error: 'Failed to send message' });
      }
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  socket.on('deleteMessage', async ({ messageId, connectedId }) => {
    try {
      await prisma.chat.delete({ where: { id: messageId } });
      io.to(connectedId).emit('messageDeleted', messageId);
      logger.debug('Message deleted', { messageId, userId });
    } catch (error) {
      logger.error('Error deleting message:', error);
      socket.emit('messageError', { error: 'Failed to delete message' });
    }
  });

  socket.on('markAsRead', async ({ messageIds, connectedId }) => {
    try {
      // No status update, just notify sender about read status
      for (const messageId of messageIds) {
        const message = await prisma.chat.findUnique({
          where: { id: messageId }
        });

        if (message) {
          const senderSocketId = onlineUsers.get(message.senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit('messageStatus', {
              messageId,
              status: 'read'
            });
          }
        }
      }

      logger.debug('Messages marked as read', { messageIds, userId });
    } catch (error) {
      logger.error('Error marking messages as read:', error);
    }
  });

  socket.on('typing', ({ connectedId, isTyping }) => {
    socket.to(connectedId).emit('userTyping', { connectedId: userId, isTyping });
    logger.debug('Typing status', { userId, connectedId, isTyping });
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
    logger.info(`🔔 Meeting notification service initialized`);
  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1);
  }
});
