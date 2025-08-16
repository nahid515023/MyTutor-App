import { Router } from 'express'
import {
  login,
  signup,
  emailVerification,
  forgotPassword,
  resetPassword,
  googleAuth,
  logout
} from '../controllers/auth'
import { errorHandler } from '../error-hander'
import upload from '../utils/imageUpload'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { authMiddleware } from '../middlewares/auth'
import { authLimiter } from '../config/rateLimiters'

const authRoutes: Router = Router()

// Public authentication routes with rate limiting
authRoutes.post('/login', errorHandler(login))
authRoutes.post(
  '/signup',
  upload.single('profileImage'),
  errorHandler(signup)
)
authRoutes.post('/google', errorHandler(googleAuth))
authRoutes.put('/verify', errorHandler(emailVerification))
authRoutes.post('/forgot-password', errorHandler(forgotPassword))
authRoutes.post(
  '/reset-password/:ResetToken/:userId',
  errorHandler(resetPassword)
)

// Protected route
authRoutes.get('/logout', authMiddleware, errorHandler(logout))

// Google OAuth routes - Passport.js method (alternative)
authRoutes.get(
  '/google/oauth',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
)

authRoutes.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { userId: (req.user as any).id },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      )

      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`)
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`)
    }
  }
)

export default authRoutes
