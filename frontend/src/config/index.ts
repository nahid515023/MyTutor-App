/**
 * Configuration file for MyTutor Frontend Application
 * Centralizes all environment variables and application settings
 */

// // Validate required environment variables
// function validateEnv(): void {
//   const required = [
//     'NEXT_PUBLIC_API_URL',
//     'NEXT_PUBLIC_GOOGLE_CLIENT_ID'
//   ] as const;

//   const missing = required.filter(key => !process.env[key]);

//   if (missing.length > 0) {
//     const errorMessage = `Missing required environment variables: ${missing.join(', ')}. Please check your .env.local file.`;

//     if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
//       throw new Error(errorMessage);
//     } else {
//       console.error(errorMessage);
//       console.warn('Some features may not work properly without these variables');
//     }
//   }
// }

// // Run validation
// validateEnv();

// Environment detection
export const isProduction = process.env.NEXT_PUBLIC_PRODUCTION === 'PRODUCTION'
export const isDevelopment = !isProduction
export const isClient = typeof window !== 'undefined'
export const isServer = !isClient

// API Configuration
export const API_CONFIG = {
  BASE_URL: isProduction
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:3001/api/',
  IMAGE_BASE_URL: isProduction
    ? process.env.NEXT_PUBLIC_API_URL_IMAGE
    : 'http://localhost:3001/',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
} as const

// Authentication Configuration
export const AUTH_CONFIG = {
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  TOKEN_STORAGE_KEY: 'mytutor_auth_token',
  USER_STORAGE_KEY: 'mytutor_user_data',
  REFRESH_TOKEN_KEY: 'mytutor_refresh_token',
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
} as const

// Application Settings
export const APP_CONFIG = {
  NAME: 'MyTutor',
  VERSION: '1.0.0',
  DESCRIPTION: 'Find the perfect tutor for your learning journey',
  DEFAULT_AVATAR: process.env.NEXT_PUBLIC_DEFULT_IMAGE || '/default-avatar.svg',
  APP_ID: process.env.NEXT_PUBLIC_APPID || '',

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,

  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
} as const

// UI Configuration
export const UI_CONFIG = {
  THEME: {
    DEFAULT_MODE: 'light' as const,
    STORAGE_KEY: 'mytutor_theme_mode'
  },

  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280
  },

  ANIMATION: {
    DURATION: {
      FAST: 150,
      NORMAL: 300,
      SLOW: 500
    },
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const

// Feature Flags
export const FEATURES = {
  ENABLE_CHAT: true,
  ENABLE_VIDEO_CALLS: true,
  ENABLE_PAYMENTS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_RATING_SYSTEM: true,
  ENABLE_ADMIN_PANEL: true,
  ENABLE_GOOGLE_AUTH: true,
  ENABLE_EMAIL_VERIFICATION: true
} as const

// Route Configuration
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  CHAT: '/chat',
  MEETINGS: '/meetings',
  POSTS: '/posts',
  ADMIN: '/admin',
  VERIFY_EMAIL: '/verify-email',
  ACCOUNT_BLOCKED: '/account-blocked',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404'
} as const

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    LOGOUT: 'auth/logout',
    REFRESH: 'auth/refresh',
    GOOGLE_AUTH: 'auth/google',
    VERIFY_EMAIL: 'auth/verify-email',
    FORGOT_PASSWORD: 'auth/forgot-password',
    RESET_PASSWORD: 'auth/reset-password'
  },

  USER: {
    PROFILE: 'profile',
    UPDATE_PROFILE: 'profile/update',
    UPLOAD_AVATAR: 'profile/avatar',
    CHANGE_PASSWORD: 'profile/change-password'
  },

  POSTS: {
    LIST: 'posts',
    CREATE: 'posts/create',
    UPDATE: 'posts/update',
    DELETE: 'posts/delete',
    MY_POSTS: 'posts/my-posts'
  },

  CHAT: {
    CONVERSATIONS: 'chat/conversations',
    MESSAGES: 'chat/messages',
    SEND_MESSAGE: 'chat/send'
  },

  MEETINGS: {
    LIST: 'meetings',
    CREATE: 'meetings/create',
    UPDATE: 'meetings/update',
    DELETE: 'meetings/delete'
  },

  PAYMENTS: {
    CREATE_INTENT: 'payments/create-intent',
    CONFIRM: 'payments/confirm',
    HISTORY: 'payments/history'
  },

  ADMIN: {
    DASHBOARD: 'admin/dashboard',
    USERS: 'admin/users',
    POSTS: 'admin/posts',
    REPORTS: 'admin/reports'
  },

  HEALTH: 'health'
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please select a supported file.'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTER_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'You have been logged out.',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  EMAIL_VERIFIED: 'Email verified successfully!',
  POST_CREATED: 'Post created successfully!',
  POST_UPDATED: 'Post updated successfully!',
  POST_DELETED: 'Post deleted successfully!',
  MESSAGE_SENT: 'Message sent successfully!'
} as const

// Export all configurations as a single object for easy access
export const CONFIG = {
  API: API_CONFIG,
  AUTH: AUTH_CONFIG,
  APP: APP_CONFIG,
  UI: UI_CONFIG,
  FEATURES,
  ROUTES,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  IS_PRODUCTION: isProduction,
  IS_DEVELOPMENT: isDevelopment,
  IS_CLIENT: isClient,
  IS_SERVER: isServer
} as const

// Default export for convenience
export default CONFIG
