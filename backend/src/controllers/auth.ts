import { NextFunction, Request, Response } from 'express'
import { logInSchema, signUpSchema } from '../schema/users'
import { prisma } from '../index'
import { BadRequestException } from '../exceptions/bad-request'
import { ErrorCode } from '../exceptions/root'
import { hashSync, compareSync } from 'bcrypt'
import { NotFoundException } from '../exceptions/not-found'
import { UnauthorizedException } from '../exceptions/unauthorized'
import { UnprocessableEntity } from '../exceptions/validation'
import * as jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../secrets'
import { createLogger } from '../services/logger'
import { sanitizeInput } from '../utils/sanitizer'
import EmailService from '../services/email'
import { generateOTP } from '../utils/otpGenerator'
import { ZodError } from 'zod'

const logger = createLogger('auth-controller')


// Account lockout tracking
const loginAttempts = new Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }>()



// Account lockout helper functions
function isAccountLocked(email: string): boolean {
  const attempts = loginAttempts.get(email);
  if (!attempts) return false;
  
  if (attempts.lockedUntil && attempts.lockedUntil > new Date()) {
    return true;
  }
  
  // Reset if lockout period has passed
  if (attempts.lockedUntil && attempts.lockedUntil <= new Date()) {
    loginAttempts.delete(email);
    return false;
  }
  
  return false;
}

function recordFailedLogin(email: string): void {
  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: new Date() };
  attempts.count += 1;
  attempts.lastAttempt = new Date();
  
  // Lock account after 5 failed attempts for 1 hour
  if (attempts.count >= 5) {
    attempts.lockedUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    logger.warn(`Account locked due to multiple failed login attempts: ${email}`);
  }
  
  loginAttempts.set(email, attempts);
}

function clearFailedLogins(email: string): void {
  loginAttempts.delete(email);
}

// Enhanced password validation
function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Login function with enhanced security
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Processing login request', { 
      email: req.body.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })
    
    // Validate input schema
    try {
      logInSchema.parse(req.body)
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(e => e.message).join(', ')
        logger.warn('Login failed - validation error', { error: errorMessages })
        return next(
          new UnprocessableEntity(
            error.errors,
            `Validation failed: ${errorMessages}`,
            ErrorCode.UNPROCESSABLE_ENTITY
          )
        )
      }
      logger.warn('Login failed - invalid input', { error })
      return next(
        new BadRequestException(
          'Invalid input format.',
          ErrorCode.INVALID_INPUT
        )
      )
    }

    // Validate required fields
    try {
      validateRequiredFields(req.body, ['email', 'password', 'role'])
    } catch (error) {
      return next(error)
    }
    
    const { email, password, role } = req.body
    const normalizedEmail = email.toLowerCase().trim()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      logger.warn('Login failed - invalid email format', { email: normalizedEmail })
      return next(
        new BadRequestException(
          'Invalid email format.',
          ErrorCode.INVALID_INPUT
        )
      )
    }

    // Check if account is locked
    if (isAccountLocked(normalizedEmail)) {
      logger.warn('Login attempt on locked account', { email: normalizedEmail })
      return next(
        new BadRequestException(
          'Account temporarily locked due to multiple failed login attempts. Please try again later.',
          ErrorCode.ACCOUNT_LOCKED
        )
      )
    }

    let user
    try {
      user = await prisma.user.findFirst({
        where: { 
          email: normalizedEmail, 
          role 
        },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
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
    } catch (error) {
      recordFailedLogin(normalizedEmail)
      return next(handleDatabaseError(error, 'user lookup'))
    }

    if (!user) {
      recordFailedLogin(normalizedEmail)
      logger.warn('Login failed - user not found', { email: normalizedEmail })
      return next(
        new UnauthorizedException('Invalid credentials!', ErrorCode.INVALID_CREDENTIALS)
      )
    }

    if (!user.verified) {
      logger.warn('Login failed - user not verified', { email: normalizedEmail })
      return next(
        new BadRequestException(
          'Please verify your email address before logging in!',
          ErrorCode.USER_NOT_VERIFIED
        )
      )
    }

    if (user.status !== 'active') {
      logger.warn('Login failed - account not active', { email: normalizedEmail, status: user.status })
      return next(
        new BadRequestException(
          'Your account has been suspended. Please contact support.',
          ErrorCode.ACCOUNT_SUSPENDED
        )
      )
    }

    // Verify password
    let passwordMatch = false
    try {
      passwordMatch = compareSync(password, user.password)
    } catch (error) {
      logger.error('Password comparison error', { error, userId: user.id })
      recordFailedLogin(normalizedEmail)
      return next(
        new Error('Authentication error. Please try again.')
      )
    }

    if (!passwordMatch) {
      recordFailedLogin(normalizedEmail)
      logger.warn('Login failed - incorrect password', { email: normalizedEmail })
      return next(
        new UnauthorizedException(
          'Invalid credentials!',
          ErrorCode.INVALID_CREDENTIALS
        )
      )
    }

    // Clear failed login attempts on successful login
    clearFailedLogins(normalizedEmail)

    // Generate JWT token
    let token
    try {
      token = jwt.sign(
        { 
          userId: user.id,
          role: user.role,
          verified: user.verified 
        }, 
        JWT_SECRET!, 
        { expiresIn: '24h' }
      )
    } catch (error) {
      logger.error('JWT token generation failed', { error, userId: user.id })
      return next(
        new Error('Failed to generate authentication token. Please try again.')
      )
    }
    
    const maxAge = 24 * 3600 * 1000 // 24 hours

    // Remove password from response
    const { password: _, ...safeUser } = user

    logger.info('Login successful', { 
      userId: user.id, 
      email: normalizedEmail,
      ip: req.ip
    })
    
    res
      .status(200)
      .cookie('token', JSON.stringify(token), { 
        httpOnly: false, 
        maxAge,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      })
      .cookie('user', JSON.stringify(safeUser), { 
        httpOnly: false, 
        maxAge,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      })
      .json({
        success: true,
        message: 'Login successful!',
        user: safeUser
      })
  } catch (error) {
    logger.error('Login error', { error })
    next(error)
  }
}

// Enhanced signup function
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Processing signup request', { 
      email: req.body.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })

    // Validate input schema
    let validatedData
    try {
      validatedData = signUpSchema.parse(req.body)
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(e => e.message).join(', ')
        logger.warn('Signup failed - validation error', { error: errorMessages })
        return next(
          new UnprocessableEntity(
            error.errors,
            `Validation failed: ${errorMessages}`,
            ErrorCode.UNPROCESSABLE_ENTITY
          )
        )
      }
      logger.warn('Signup failed - invalid input', { error })
      return next(
        new BadRequestException(
          'Invalid input format.',
          ErrorCode.INVALID_INPUT
        )
      )
    }

    // Validate required fields
    try {
      validateRequiredFields(validatedData, ['name', 'email', 'password', 'role'])
    } catch (error) {
      return next(error)
    }

    // Sanitize inputs
    let sanitizedData
    try {
      sanitizedData = sanitizeInput(validatedData)
    } catch (error) {
      logger.warn('Signup failed - sanitization error', { error })
      return next(
        new BadRequestException(
          'Invalid input data format.',
          ErrorCode.INVALID_INPUT
        )
      )
    }

    const { name, email, password, role } = sanitizedData
    const normalizedEmail = email.toLowerCase().trim()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      logger.warn('Signup failed - invalid email format', { email: normalizedEmail })
      return next(
        new BadRequestException(
          'Invalid email format.',
          ErrorCode.INVALID_INPUT
        )
      )
    }

    // Enhanced password validation
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      logger.warn('Signup failed - weak password', { email: normalizedEmail })
      return next(
        new BadRequestException(
          `Password requirements not met: ${passwordValidation.errors.join(', ')}`,
          ErrorCode.WEAK_PASSWORD
        )
      )
    }

    // Check if user exists
    let existingUser
    try {
      existingUser = await prisma.user.findFirst({
        where: { 
          email: normalizedEmail, 
          role: role 
        }
      })
    } catch (error) {
      return next(handleDatabaseError(error, 'user existence check'))
    }

    if (existingUser) {
      logger.warn(`Signup attempt with existing email: ${normalizedEmail}`)
      return next(
        new BadRequestException(
          'An account with this email already exists!',
          ErrorCode.USER_ALREADY_EXISTS
        )
      )
    }

    // Create user with enhanced security
    let user
    try {
      user = await prisma.user.create({
        data: {
          name: name.trim(),
          profileImage: req.file?.filename,
          email: normalizedEmail,
          password: hashSync(password, 12),
          role: role,
          dob: '1/1/2001',
          gender: 'Not specified',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    } catch (error) {
      return next(handleDatabaseError(error, 'user creation'))
    }

    logger.info(`User created successfully: ${user.id}`)

    // Create email verification token
    let emailToken
    try {
      emailToken = generateOTP()
      await prisma.emailVerification.create({
        data: {
          userId: user.id,
          token: emailToken
        }
      })
    } catch (error) {
      logger.error('Failed to create verification token', { error, userId: user.id })
      // Don't fail the signup if verification token creation fails
      // User can request a new verification email later
    }

    // Send verification email
    if (emailToken) {
      try {
        await EmailService.sendEmail(
          user.email,
          'Welcome to MyTutor - Verify your email address',
          `Welcome to MyTutor! Your verification code is: ${emailToken}`,
          `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to MyTutor!</h2>
            <p>Thank you for joining our tutoring platform. To complete your registration, please verify your email address.</p>
            <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
              <h3>Your verification code is:</h3>
              <div style="font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 3px;">${emailToken}</div>
            </div>
            <p>This code will expire in 24 hours. If you didn't create an account with MyTutor, please ignore this email.</p>
            <p>Best regards,<br>The MyTutor Team</p>
          </div>
          `
        )
        logger.info(`Verification email sent to: ${user.email}`)
      } catch (emailError) {
        logger.error('Failed to send verification email', { error: emailError, userId: user.id })
        // Don't fail the signup if email fails
      }
    }

    // Send success response (no sensitive data)
    res.status(201).json({
      success: true,
      message: emailToken 
        ? 'Account created successfully! Please check your email for verification code.'
        : 'Account created successfully! Please contact support to verify your email.',
      userId: user.id // Only return user ID for verification purposes
    })
  } catch (error) {
    logger.error('Signup error:', error)
    next(error)
  }
}

// Enhanced logout function
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Processing logout request', { 
      userId: req.user?.id,
      ip: req.ip
    })

    // Clear cookies with proper options
    res.clearCookie('token', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    })
    res.clearCookie('user', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    })

    // Destroy session if using sessions
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          logger.warn('Session destruction error', { error: err })
        }
      })
    }

    logger.info('Logout successful', { userId: req.user?.id })
    res.status(200).json({
      success: true,
      message: 'Logout successful!'
    })
  } catch (error) {
    logger.error('Logout error:', error)
    next(error)
  }
}

// verify function
export const emailVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Processing email verification request', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })

    // Validate input
    try {
      validateRequiredFields(req.body, ['otpCode'])
    } catch (error) {
      return next(error)
    }

    const { otpCode, userId } = req.body

    // Sanitize inputs
    const sanitizedOtpCode = typeof otpCode === 'string' ? otpCode.trim() : ''
    
    if (!sanitizedOtpCode || sanitizedOtpCode.length !== 4) {
      logger.warn('Email verification failed - invalid OTP format')
      return next(
        new BadRequestException(
          'Invalid verification code format. Code must be 6 digits.',
          ErrorCode.INVALID_VERIFICATION_TOKEN
        )
      )
    }

    let emailVerification
    try {
      // Build query based on whether userId is provided
      const whereClause: any = { token: sanitizedOtpCode }
      if (userId) {
        whereClause.userId = userId
      }

      emailVerification = await prisma.emailVerification.findFirst({
        where: whereClause
      })
    } catch (error) {
      return next(handleDatabaseError(error, 'email verification lookup'))
    }

    if (!emailVerification) {
      logger.warn('Email verification failed - invalid token', { 
        otpCode: sanitizedOtpCode.substring(0, 2) + '****' 
      })
      return next(
        new BadRequestException(
          'Invalid or expired verification code.',
          ErrorCode.INVALID_VERIFICATION_TOKEN
        )
      )
    }

    // Get user details to check status and verification
    let existingUser
    try {
      existingUser = await prisma.user.findUnique({
        where: { id: emailVerification.userId },
        select: {
          id: true,
          email: true,
          verified: true,
          status: true
        }
      })
    } catch (error) {
      return next(handleDatabaseError(error, 'user lookup'))
    }

    if (!existingUser) {
      logger.warn('Email verification failed - user not found', { 
        userId: emailVerification.userId 
      })
      return next(
        new NotFoundException(
          'User account not found.',
          ErrorCode.USER_NOT_FOUND
        )
      )
    }

    // Check if user account is active
    if (existingUser.status !== 'active') {
      logger.warn('Email verification failed - account not active', { 
        userId: emailVerification.userId,
        status: existingUser.status 
      })
      return next(
        new BadRequestException(
          'Your account has been suspended. Please contact support.',
          ErrorCode.ACCOUNT_SUSPENDED
        )
      )
    }

    // Check if already verified
    if (existingUser.verified) {
      logger.info('Email verification attempt on already verified account', { 
        userId: emailVerification.userId 
      })
      return next(
        new BadRequestException(
          'Email address is already verified.',
          ErrorCode.USER_ALREADY_EXISTS
        )
      )
    }

    let user
    try {
      user = await prisma.user.update({
        where: { id: emailVerification.userId },
        data: { 
          verified: true,
          updatedAt: new Date()
        }
      })

      // Delete verification token
      await prisma.emailVerification.delete({
        where: { id: emailVerification.id }
      })
    } catch (error) {
      return next(handleDatabaseError(error, 'user verification update'))
    }

    logger.info('Email verified successfully', { userId: user.id })

    // Generate JWT token
    let jwt_token
    try {
      jwt_token = jwt.sign(
        { 
          userId: user.id,
          role: user.role,
          verified: user.verified
        }, 
        JWT_SECRET!, 
        { expiresIn: '24h' }
      )
    } catch (error) {
      logger.error('JWT token generation failed', { error, userId: user.id })
      return next(
        new Error('Failed to generate authentication token. Please try logging in.')
      )
    }

    const maxAge = 24 * 3600 * 1000

    // Cookie options for cross-domain support
    const cookieOptions = {
      httpOnly: false,
      maxAge,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax'
    }

    res
      .status(200)
      .cookie('token', JSON.stringify(jwt_token), cookieOptions)
      .cookie('user', JSON.stringify(user), cookieOptions)
      .json({
        success: true,
        message: 'Email verified successfully! You are now logged in.',
      })
  } catch (error) {
    logger.error('Email verification error:', error)
    next(error)
  }
}

//forgot password

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Processing forgot password request', {
      email: req.body.email,
      Role: req.body.role
    })
    const { email, role } = req.body

    const user = await prisma.user.findFirst({
      where: { email, role }
    })

    if (!user) {
      logger.warn(
        'Forgot password failed - user not found',
        { email },
        { role }
      )
      return next(
        new NotFoundException('User not found!', ErrorCode.USER_NOT_FOUND)
      )
    }

    // Create token
    const ResetToken = generateOTP(6)
    // Store token in db
    await prisma.restPassword.create({
      data: {
        userId: user.id,
        token: ResetToken
      }
    })

    // Create link for password reset
    const link = `http://localhost:${3000}/forgot-password/${ResetToken}/${
      user.id
    }`

    // Send reset password email
    EmailService.sendEmail(
      user.email,
      'Reset your password',
      `Click on the link to reset your password: ${link}`,
      `<p>Click on the link to reset your password: <a href="${link}">${link}</a></p>`
    )

    logger.info(`Password reset email sent to: ${user.email}`)

    // Send success response
    res.status(200).json({
      success: true,
      message:
        'A password reset link has been sent to your email address. Please check your inbox and follow the instructions to reset your password.'
    })
  } catch (error) {
    logger.error('Forgot password error', { error })
    next(error)
  }
}

//reset password

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Processing reset password request', {
      ResetToken: req.params.ResetToken,
      userId: req.params.userId
    })
    const { ResetToken, userId } = req.params
    const { password } = req.body
    const resetPassword = await prisma.restPassword.findFirst({
      where: { token: ResetToken, userId: userId }
    })

    if (!resetPassword) {
      logger.warn('Reset password failed - invalid token', {
        ResetToken,
        userId
      })
      return next(
        new BadRequestException(
          'Invalid reset password token!',
          ErrorCode.INVALID_RESET_PASSWORD_TOKEN
        )
      )
    }

    // Update user password
    const user = await prisma.user.update({
      where: { id: userId },
      data: { password: hashSync(password, 12) }
    })

    // Delete reset password token
    await prisma.restPassword.delete({
      where: { id: resetPassword.id }
    })

    logger.info('Password reset successfully', { userId: user.id })

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Password reset successfully!'
    })
  } catch (error) {
    logger.error('Reset password error', { error })
    next(error)
  }
}

// Google OAuth handler
export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Processing Google authentication request')
    const { token, role } = req.body
    console.log('Google auth request body:', req.body)
    if (!token) {
      logger.warn('Google auth failed - no token provided')
      return next(
        new BadRequestException(
          'Google token is required!',
          ErrorCode.INVALID_INPUT
        )
      )
    }

    if (!role || !['STUDENT', 'TEACHER'].includes(role)) {
      logger.warn('Google auth failed - invalid role')
      return next(
        new BadRequestException(
          'Valid role (STUDENT or TEACHER) is required!',
          ErrorCode.INVALID_INPUT
        )
      )
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
      );

      if (!response.ok) {
        throw new Error(`Google API error: ${response.statusText}`);
      }

      const userData = await response.json();
      console.log('Google user data:', userData);

      // Extract user information
      const { email, name, picture } = userData;


      // Check if user exists with same email and role
      let user = await prisma.user.findFirst({
        where: { 
          email: email.toLowerCase(),
          role: role
        }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: email,
            name: name,
            password: '',
            role: role,
            verified: true,
            profileImage: picture,
            dob: '1/1/2001',
            gender: 'Not specified',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        logger.info(`New user created via Google auth: ${user.id}`);
      }
      // Generate JWT token
      const jwt_token = jwt.sign({ userId: user.id }, JWT_SECRET!, {
        expiresIn: '1d'
      });
      const maxAge = 24 * 3600 * 1000;

      logger.info('Google authentication successful', { userId: user.id });

      // Cookie options for cross-domain support
      const cookieOptions = {
        httpOnly: false,
        maxAge,
        secure: process.env.NODE_ENV === 'production',
        sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax'
      }

      res
        .status(200)
        .cookie('token', JSON.stringify(jwt_token), cookieOptions)
        .cookie('user', JSON.stringify(user), cookieOptions)
        .json({
          success: true,
          message: 'Google authentication successful!',
          user: user
        });
    } catch (googleError) {
      console.error('Google API error:', googleError);
      return next(
        new BadRequestException(
          'Error verifying Google token',
          ErrorCode.INVALID_GOOGLE_TOKEN
        )
      );
    }
  } catch (error) {
    logger.error('Google authentication error:', error)
    next(error)
  }
}

// Enhanced error handling helper function
function handleDatabaseError(error: any, operation: string): never {
  logger.error(`Database error during ${operation}:`, error)
  
  // Handle specific Prisma errors
  if (error.code === 'P2002') {
    throw new BadRequestException(
      'A record with this information already exists.',
      ErrorCode.USER_ALREADY_EXISTS
    )
  }
  
  if (error.code === 'P2025') {
    throw new NotFoundException(
      'The requested record was not found.',
      ErrorCode.USER_NOT_FOUND
    )
  }
  
  // Handle connection errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    throw new Error('Database connection failed. Please try again later.')
  }
  
  // Generic database error
  throw new Error('A database error occurred. Please try again later.')
}

// Input validation helper
function validateRequiredFields(fields: Record<string, any>, requiredFields: string[]): void {
  const missingFields = requiredFields.filter(field => 
    !fields[field] || (typeof fields[field] === 'string' && fields[field].trim() === '')
  )
  
  if (missingFields.length > 0) {
    throw new BadRequestException(
      `Missing required fields: ${missingFields.join(', ')}`,
      ErrorCode.INVALID_INPUT
    )
  }
}
