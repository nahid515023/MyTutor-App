import { Request, Response, NextFunction } from 'express'
import { UnauthorizedException } from '../exceptions/unauthorized'
import { ErrorCode } from '../exceptions/root'
import { createLogger } from '../services/logger'

const logger = createLogger('route-restriction')

// Custom exception for forbidden access
export class ForbiddenError extends Error {
  statusCode = 403
  errorCode = ErrorCode.FORBIDDEN || 4002
  
  constructor(message: string) {
    super(message)
    this.name = 'ForbiddenError'
  }
}

// Role-based authorization
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logger.warn('User not authenticated')
      return next(new UnauthorizedException('Authentication required', ErrorCode.UNAUTHORIZED))
    }

    const userRole = req.user.role
    if (!allowedRoles.includes(userRole)) {
      logger.warn(`Access denied for user ${req.user.id} with role ${userRole}. Required roles: ${allowedRoles.join(', ')}`)
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        errorCode: 4002
      })
    }

    logger.debug(`User ${req.user.id} authorized with role ${userRole}`)
    next()
  }
}

// Only ADMIN can access
export const requireAdmin = requireRole(['ADMIN'])

// Only TEACHER can access  
export const requireTeacher = requireRole(['TEACHER'])

// Only STUDENT can access
export const requireStudent = requireRole(['STUDENT'])

// TEACHER or ADMIN can access
export const requireTeacherOrAdmin = requireRole(['TEACHER', 'ADMIN'])

// STUDENT or TEACHER can access (exclude only ADMIN)
export const requireStudentOrTeacher = requireRole(['STUDENT', 'TEACHER'])

// Check if user owns the resource
export function requireOwnership(resourceIdParam: string = 'id') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedException('Authentication required', ErrorCode.UNAUTHORIZED))
    }

    const resourceOwnerId = req.params[resourceIdParam] || req.body.userId || req.body.id
    const currentUserId = req.user.id

    if (resourceOwnerId !== currentUserId) {
      logger.warn(`User ${currentUserId} attempted to access resource owned by ${resourceOwnerId}`)
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources',
        errorCode: 4002
      })
    }

    next()
  }
}

// Allow access to resource owner OR specific roles
export function requireOwnershipOrRole(allowedRoles: string[], resourceIdParam: string = 'id') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedException('Authentication required', ErrorCode.UNAUTHORIZED))
    }

    const userRole = req.user.role
    const resourceOwnerId = req.params[resourceIdParam] || req.body.userId || req.body.id
    const currentUserId = req.user.id

    // Check if user has required role
    if (allowedRoles.includes(userRole)) {
      logger.debug(`User ${currentUserId} authorized with role ${userRole}`)
      return next()
    }

    // Check if user owns the resource
    if (resourceOwnerId === currentUserId) {
      logger.debug(`User ${currentUserId} authorized as resource owner`)
      return next()
    }

    logger.warn(`Access denied for user ${currentUserId} with role ${userRole}`)
    return res.status(403).json({
      success: false,
      message: `Access denied. You must be the resource owner or have one of these roles: ${allowedRoles.join(', ')}`,
      errorCode: 4002
    })
  }
}

// Check if user account is verified
export function requireVerification() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedException('Authentication required', ErrorCode.UNAUTHORIZED))
    }

    if (!req.user.verified) {
      logger.warn(`Unverified user ${req.user.id} attempted to access protected resource`)
      return res.status(403).json({
        success: false,
        message: 'Email verification required',
        errorCode: 4002
      })
    }

    next()
  }
}

// Check if user account is active (not blocked)
export function requireActiveAccount() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedException('Authentication required', ErrorCode.UNAUTHORIZED))
    }

    if (req.user.status !== 'active') {
      logger.warn(`Blocked user ${req.user.id} attempted to access protected resource`)
      return res.status(403).json({
        success: false,
        message: 'Account is blocked or inactive',
        errorCode: 4002
      })
    }

    next()
  }
}

// Rate limiting per user (basic implementation)
const userRequestCounts = new Map<string, { count: number; resetTime: number }>()

export function rateLimitPerUser(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedException('Authentication required', ErrorCode.UNAUTHORIZED))
    }

    const userId = req.user.id
    const now = Date.now()
    const userRecord = userRequestCounts.get(userId)

    if (!userRecord || now > userRecord.resetTime) {
      // Reset or create new record
      userRequestCounts.set(userId, { count: 1, resetTime: now + windowMs })
      return next()
    }

    if (userRecord.count >= maxRequests) {
      logger.warn(`Rate limit exceeded for user ${userId}`)
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.',
        errorCode: 4003,
        retryAfter: Math.ceil((userRecord.resetTime - now) / 1000)
      })
    }

    userRecord.count++
    next()
  }
}

// Custom permission checker
export function requirePermission(permissionCheck: (user: any, req: Request) => boolean, errorMessage: string = 'Insufficient permissions') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedException('Authentication required', ErrorCode.UNAUTHORIZED))
    }

    if (!permissionCheck(req.user, req)) {
      logger.warn(`Permission denied for user ${req.user.id}`)
      return res.status(403).json({
        success: false,
        message: errorMessage,
        errorCode: 4002
      })
    }

    next()
  }
}

// Async custom permission checker
export function requireAsyncPermission(permissionCheck: (user: any, req: Request) => Promise<boolean>, errorMessage: string = 'Insufficient permissions') {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedException('Authentication required', ErrorCode.UNAUTHORIZED))
    }

    try {
      const hasPermission = await permissionCheck(req.user, req)
      if (!hasPermission) {
        logger.warn(`Permission denied for user ${req.user.id}`)
        return res.status(403).json({
          success: false,
          message: errorMessage,
          errorCode: 4002
        })
      }
      next()
    } catch (error) {
      logger.error(`Error checking permission for user ${req.user.id}:`, error)
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions',
        errorCode: 3001
      })
    }
  }
}

// Combine multiple restrictions (all must pass)
export function combineRestrictions(...middlewares: any[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    let index = 0
    
    function runNext() {
      if (index >= middlewares.length) {
        return next()
      }
      
      const middleware = middlewares[index++]
      middleware(req, res, (err?: any) => {
        if (err) {
          return next(err)
        }
        runNext()
      })
    }
    
    runNext()
  }
}
