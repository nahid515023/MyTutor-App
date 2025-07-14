import { Request, Response, NextFunction } from 'express'
import { prisma } from '../index'
import { createLogger } from '../services/logger'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../secrets'

const logger = createLogger('session-manager')

interface SessionData {
  userId: string
  email: string
  role: string
  loginTime: Date
  lastActivity: Date
  ipAddress: string
  userAgent: string
  isActive: boolean
}

// In-memory session store (use Redis in production)
const activeSessions = new Map<string, SessionData>()

export class SessionManager {
  // Create a new session
  static createSession(user: any, req: Request): string {
    const sessionId = this.generateSessionId()
    
    const sessionData: SessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      loginTime: new Date(),
      lastActivity: new Date(),
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      isActive: true
    }
    
    activeSessions.set(sessionId, sessionData)
    
    logger.info('Session created', {
      sessionId: sessionId.substring(0, 8) + '...',
      userId: user.id,
      ip: sessionData.ipAddress
    })
    
    return sessionId
  }
  
  // Validate and refresh session
  static validateSession(sessionId: string, req: Request): SessionData | null {
    const session = activeSessions.get(sessionId)
    
    if (!session || !session.isActive) {
      return null
    }
    
    // Check for session hijacking (different IP or user agent)
    if (session.ipAddress !== req.ip || session.userAgent !== req.get('User-Agent')) {
      logger.warn('Potential session hijacking detected', {
        sessionId: sessionId.substring(0, 8) + '...',
        originalIp: session.ipAddress,
        currentIp: req.ip,
        originalUserAgent: session.userAgent,
        currentUserAgent: req.get('User-Agent')
      })
      
      this.destroySession(sessionId)
      return null
    }
    
    // Update last activity
    session.lastActivity = new Date()
    activeSessions.set(sessionId, session)
    
    return session
  }
  
  // Destroy a session
  static destroySession(sessionId: string): void {
    const session = activeSessions.get(sessionId)
    if (session) {
      session.isActive = false
      activeSessions.delete(sessionId)
      
      logger.info('Session destroyed', {
        sessionId: sessionId.substring(0, 8) + '...',
        userId: session.userId
      })
    }
  }
  
  // Destroy all sessions for a user
  static destroyUserSessions(userId: string): void {
    for (const [sessionId, session] of activeSessions.entries()) {
      if (session.userId === userId) {
        this.destroySession(sessionId)
      }
    }
    
    logger.info('All user sessions destroyed', { userId })
  }
  
  // Clean up expired sessions
  static cleanupSessions(): void {
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    const now = new Date()
    
    for (const [sessionId, session] of activeSessions.entries()) {
      const age = now.getTime() - session.lastActivity.getTime()
      
      if (age > maxAge) {
        this.destroySession(sessionId)
      }
    }
  }
  
  // Get active sessions for a user
  static getUserSessions(userId: string): SessionData[] {
    const userSessions: SessionData[] = []
    
    for (const session of activeSessions.values()) {
      if (session.userId === userId && session.isActive) {
        userSessions.push(session)
      }
    }
    
    return userSessions
  }
  
  // Generate a secure session ID
  private static generateSessionId(): string {
    return jwt.sign(
      { 
        timestamp: Date.now(),
        random: Math.random().toString(36).substring(2)
      },
      JWT_SECRET!,
      { expiresIn: '24h' }
    )
  }
}

// Middleware to validate sessions
export function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.cookies['sessionId']
  
  if (!sessionId) {
    return next() // No session, continue
  }
  
  const session = SessionManager.validateSession(sessionId, req)
  
  if (!session) {
    // Invalid session, clear cookie
    res.clearCookie('sessionId')
    return next()
  }
  
  // Attach session data to request
  ;(req as any).sessionData = session
  
  next()
}

// Clean up sessions periodically (run every hour)
setInterval(() => {
  SessionManager.cleanupSessions()
}, 60 * 60 * 1000)

export { SessionData }
