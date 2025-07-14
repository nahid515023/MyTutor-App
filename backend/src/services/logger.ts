import winston from 'winston';
import path from 'path';

const { format, createLogger: winstonCreateLogger, transports } = winston;

// Define custom levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
} as const;

type LogLevel = keyof typeof levels;

// Custom colors configuration
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

// Add colors to Winston
winston.addColors(colors);

const logDir = 'logs';

// Custom format
const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.colorize(),
  format.printf(({ timestamp, level, message, module, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${module || 'default'}] ${level}: ${message}${metaStr}`;
  })
);

// Flag to ensure global handlers are only registered once
let globalHandlersRegistered = false;

export function createLogger(module: string) {
  const logger = winstonCreateLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format: customFormat,
    defaultMeta: { module },
    transports: [
      // Console transport
      new transports.Console({
        handleExceptions: true,
      }),
      // Error log file
      new transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      // Combined log file
      new transports.File({
        filename: path.join(logDir, 'combined.log'),
        maxsize: 5242880,
        maxFiles: 5,
      }),
    ],
    exitOnError: false,
  });

  // Register global error handlers only once
  if (!globalHandlersRegistered) {
    setupGlobalErrorHandlers(logger);
    globalHandlersRegistered = true;
  }

  return logger;
}

// Setup global error handlers (only called once)
function setupGlobalErrorHandlers(logger: winston.Logger) {
  // Increase max listeners to prevent warnings
  process.setMaxListeners(15);

  // Handle uncaught exceptions
  const uncaughtExceptionHandler = (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  };

  // Handle unhandled promise rejections
  const unhandledRejectionHandler = (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  };

  // Remove any existing listeners before adding new ones
  process.removeAllListeners('uncaughtException');
  process.removeAllListeners('unhandledRejection');

  // Add our handlers
  process.on('uncaughtException', uncaughtExceptionHandler);
  process.on('unhandledRejection', unhandledRejectionHandler);

  // Graceful shutdown handler
  const gracefulShutdown = (signal: string) => {
    logger.info(`Received ${signal}. Graceful shutdown initiated.`);
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// Export default logger
export const logger = createLogger('app');

// Utility function to debug event listeners (for development)
export function debugEventListeners() {
  const uncaughtCount = process.listenerCount('uncaughtException');
  const rejectionCount = process.listenerCount('unhandledRejection');
  
  logger.debug('Event Listener Debug:', {
    maxListeners: process.getMaxListeners(),
    uncaughtException: uncaughtCount,
    unhandledRejection: rejectionCount
  });
  
  return {
    maxListeners: process.getMaxListeners(),
    uncaughtException: uncaughtCount,
    unhandledRejection: rejectionCount
  };
}

