import { Request, Response, NextFunction } from 'express'
import { createLogger } from '../services/logger'

const logger = createLogger('security-middleware')

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block')
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy - more permissive for development
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self'; " +
      "connect-src 'self' https:; " +
      "frame-ancestors 'none'"
    )
  } else {
    // Development mode - very permissive CSP
    res.setHeader('Content-Security-Policy', 
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' localhost:* 127.0.0.1:*; " +
      "style-src 'self' 'unsafe-inline' data:; " +
      "img-src 'self' data: blob: https: http: localhost:* 127.0.0.1:*; " +
      "font-src 'self' data:; " +
      "connect-src 'self' ws: wss: http: https: localhost:* 127.0.0.1:*; " +
      "frame-src 'self' localhost:* 127.0.0.1:*; " +
      "media-src 'self' data: blob:; " +
      "object-src 'none'; " +
      "base-uri 'self'"
    )
  }
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=()'
  )
  
  // HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  
  next()
}

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  
  const logData = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous'
  }
  
  logger.info('Request started', logData)
  
  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info('Request completed', {
      ...logData,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    })
  })
  
  next()
}

// Input sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Remove any HTML tags from request body strings
  function sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      // Remove HTML tags and trim whitespace
      return obj.replace(/<[^>]*>/g, '').trim()
    } else if (Array.isArray(obj)) {
      return obj.map(sanitizeObject)
    } else if (obj && typeof obj === 'object') {
      const sanitized: any = {}
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key])
      }
      return sanitized
    }
    return obj
  }
  
  if (req.body) {
    req.body = sanitizeObject(req.body)
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query)
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params)
  }
  
  next()
}

// IP-based rate limiting store
const ipRequests = new Map<string, { count: number; resetTime: number }>()

export function ipRateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown'
    const now = Date.now()
    
    const requests = ipRequests.get(ip)
    
    if (!requests || now > requests.resetTime) {
      // Reset or initialize counter
      ipRequests.set(ip, { count: 1, resetTime: now + windowMs })
      return next()
    }
    
    if (requests.count >= maxRequests) {
      logger.warn('Rate limit exceeded', { ip, count: requests.count, maxRequests })
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((requests.resetTime - now) / 1000)
      })
    }
    
    requests.count++
    next()
  }
}

// Suspicious activity detection
export function detectSuspiciousActivity(req: Request, res: Response, next: NextFunction) {
  const suspiciousPatterns = [
    /(<script|javascript|vbscript)/i,  // XSS attempts
    /(union|select|insert|delete|drop|create|alter)/i,  // SQL injection
    /(\.\.\/|\.\.\\|\/etc\/passwd|\/windows\/system32)/i,  // Path traversal
    /(eval\(|exec\(|system\(|shell_exec)/i,  // Code injection
  ]
  
  const checkForSuspiciousContent = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(obj))
    } else if (Array.isArray(obj)) {
      return obj.some(checkForSuspiciousContent)
    } else if (obj && typeof obj === 'object') {
      return Object.values(obj).some(checkForSuspiciousContent)
    }
    return false
  }
  
  const isSuspicious = 
    checkForSuspiciousContent(req.body) ||
    checkForSuspiciousContent(req.query) ||
    checkForSuspiciousContent(req.params)
  
  if (isSuspicious) {
    logger.warn('Suspicious activity detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.url,
      body: req.body,
      query: req.query,
      params: req.params
    })
    
    return res.status(400).json({
      error: 'Invalid request detected'
    })
  }
  
  next()
}
