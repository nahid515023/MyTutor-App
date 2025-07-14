import { Request, Response, NextFunction } from 'express'
import { ForbiddenException } from '../exceptions/forbidden'
import { UnauthorizedException } from '../exceptions/unauthorized'
import { ErrorCode } from '../exceptions/root'
import { createLogger } from '../services/logger'

const logger = createLogger('authorization-middleware')

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
      return next(new ForbiddenException(
        `Access denied. Required role: ${allowedRoles.join(' or ')}`, 
        ErrorCode.FORBIDDEN
      ))
    }

    logger.debug(`User ${req.user.id} authorized with role ${userRole}`)
    next()
  }
}

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
      return next(new ForbiddenException('Access denied. You can only access your own resources', ErrorCode.FORBIDDEN))
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
    return next(new ForbiddenException(
      `Access denied. You must be the resource owner or have one of these roles: ${allowedRoles.join(', ')}`, 
      ErrorCode.FORBIDDEN
    ))
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
      return next(new ForbiddenException('Email verification required', ErrorCode.FORBIDDEN))
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
      return next(new ForbiddenException('Account is blocked or inactive', ErrorCode.FORBIDDEN))
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
      return next(new ForbiddenException('Rate limit exceeded. Please try again later.', ErrorCode.FORBIDDEN))
    }

    userRecord.count++
    next()
  }
}

// Custom permission checker
export function requirePermission(permissionCheck: (user: any, req: Request) => boolean) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedException('Authentication required', ErrorCode.UNAUTHORIZED))
    }

    if (!permissionCheck(req.user, req)) {
      logger.warn(`Permission denied for user ${req.user.id}`)
      return next(new ForbiddenException('Insufficient permissions', ErrorCode.FORBIDDEN))
    }

    next()
  }
}
