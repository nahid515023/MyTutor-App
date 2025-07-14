import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { createLogger } from '../services/logger'
import { UnauthorizedException } from '../exceptions/unauthorized'
import { ErrorCode } from '../exceptions/root'
import { JWT_SECRET } from '../secrets'
import { prisma } from '..'

const logger = createLogger('auth-middleware')

interface JWTPayload {
  userId: string
  role?: string
  verified?: boolean
  iat: number
  exp: number
}

// Extend Request interface to include user
declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
  }
}

// Blacklisted tokens (in production, use Redis or database)
const tokenBlacklist = new Set<string>()

export function addToBlacklist(token: string): void {
  tokenBlacklist.add(token)
}

export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token)
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from cookie or Authorization header
    let token: string | undefined
    
    if (req.cookies['token']) {
      try {
        token = JSON.parse(req.cookies['token'])
      } catch (error) {
        logger.warn('Failed to parse token from cookie')
      }
    }
    
    // Fallback to Authorization header
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7)
    }
    
    logger.debug(`Extracted token: ${token ? 'present' : 'missing'}`)

    if (!token) {
      logger.warn('No token provided', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path
      })
      return next(
        new UnauthorizedException('Access Denied - Authentication required', ErrorCode.UNAUTHORIZED)
      )
    }

    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      logger.warn('Blacklisted token used', { token: token.substring(0, 20) + '...' })
      return next(
        new UnauthorizedException('Token has been invalidated', ErrorCode.UNAUTHORIZED)
      )
    }

    try {
      // Verify JWT token
      const payload = jwt.verify(token, JWT_SECRET!) as JWTPayload
      logger.debug(`JWT payload: ${JSON.stringify({ userId: payload.userId, role: payload.role })}`)

      // Fetch user from DB to ensure they still exist and are active
      const user = await prisma.user.findFirst({
        where: { id: payload.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          verified: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          bio: true,
          profileImage: true,
          coverImage: true,
          phone: true,
          dob: true,
          gender: true,
          location: true
        }
      })

      if (!user) {
        logger.error(`User not found for valid token: ${payload.userId}`)
        return next(
          new UnauthorizedException('User no longer exists', ErrorCode.UNAUTHORIZED)
        )
      }

      // Check if user account is still active
      if (user.status !== 'active') {
        logger.warn(`Inactive user attempted access: ${user.id}, status: ${user.status}`)
        return next(
          new UnauthorizedException('Account has been suspended', ErrorCode.UNAUTHORIZED)
        )
      }

      // Check if user is still verified (in case verification was revoked)
      if (!user.verified) {
        logger.warn(`Unverified user attempted access: ${user.id}`)
        return next(
          new UnauthorizedException('Email verification required', ErrorCode.USER_NOT_VERIFIED)
        )
      }

      req.user = user
      logger.debug(`User authenticated: ${user.id} (${user.role})`)
      next()
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        logger.warn('Token expired', { 
          expiredAt: jwtError.expiredAt,
          ip: req.ip 
        })
        return next(
          new UnauthorizedException('Token has expired', ErrorCode.UNAUTHORIZED)
        )
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        logger.warn('Invalid token format', { 
          error: jwtError.message,
          ip: req.ip 
        })
        return next(
          new UnauthorizedException('Invalid token format', ErrorCode.UNAUTHORIZED)
        )
      } else {
        throw jwtError
      }
    }
  } catch (error) {
    logger.error('Authentication middleware error', { 
      error,
      ip: req.ip,
      path: req.path
    })
    return next(
      new UnauthorizedException('Authentication failed', ErrorCode.UNAUTHORIZED)
    )
  }
}

// Optional authentication middleware (doesn't fail if no token)
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await authMiddleware(req, res, (err) => {
      // If there's an auth error, continue without user
      if (err) {
        req.user = null
      }
      next()
    })
  } catch (error) {
    req.user = null
    next()
  }
}
