import dotenv from 'dotenv'
dotenv.config({path:'.env'})

// Validate required environment variables
function validateEnv() {
  const required = ['JWT_SECRET', 'DATABASE_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.log('💡 Please copy .env.example to .env and fill in the required values');
    process.exit(1);
  }
}

validateEnv();

// Server Configuration
export const PORT = process.env.PORT || 3001
export const NODE_ENV = process.env.NODE_ENV || 'development'

// Security Configuration
export const JWT_SECRET = process.env.JWT_SECRET
export const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback-session-secret'

// Database Configuration  
export const DATABASE_URL = process.env.DATABASE_URL

// Email Configuration
export const EMAIL = process.env.EMAIL
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

// Payment Configuration
export const STORE_ID = process.env.STORE_ID
export const STORE_PASSWORD = process.env.STORE_PASSWORD

// Frontend URLs
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

// Security Settings
export const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5')
export const LOCKOUT_TIME = parseInt(process.env.LOCKOUT_TIME || '3600000') // 1 hour
export const PASSWORD_MIN_LENGTH = parseInt(process.env.PASSWORD_MIN_LENGTH || '8')

// Rate Limiting
export const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '900000') // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')

// File Upload
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB
export const ALLOWED_FILE_TYPES = process.env.ALLOWED_FILE_TYPES?.split(',') || [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp'
]

// Logging
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info'
export const LOG_FILE_PATH = process.env.LOG_FILE_PATH || './logs'