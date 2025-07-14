import { z } from 'zod'

// Enhanced password validation schema
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
  .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
  .regex(/(?=.*\d)/, 'Password must contain at least one number')
  .regex(/(?=.*[@$!%*?&])/, 'Password must contain at least one special character (@$!%*?&)')

// Enhanced email validation
const emailValidationSchema = z.string()
  .email('Please provide a valid email address')
  .min(1, 'Email is required')
  .max(100, 'Email must be less than 100 characters')
  .transform(email => email.toLowerCase().trim())

// Name validation
const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters long')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
  .transform(name => name.trim())

// Role validation
const roleSchema = z.enum(['STUDENT', 'TEACHER'], {
  errorMap: () => ({ message: 'Role must be either STUDENT or TEACHER' })
})

export const signUpSchema = z.object({
  name: nameSchema,
  email: emailValidationSchema,
  password: passwordSchema,
  role: roleSchema.optional().default('STUDENT'),
})

export const logInSchema = z.object({
  email: emailValidationSchema,
  password: z.string().min(1, 'Password is required'),
  role: roleSchema.optional().default('STUDENT'),
})

export const emailVerificationSchema = z.object({
  otpCode: z.string()
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers')
})

export const forgotPasswordSchema = z.object({
  email: emailValidationSchema,
  role: roleSchema.optional().default('STUDENT'),
})

export const resetPasswordSchema = z.object({
  password: passwordSchema,
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
})

export const changeEmailSchema = z.object({
  email: emailValidationSchema,
  password: z.string().min(1, 'Password is required for email change'),
})

export const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number')
    .optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  education: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  dob: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other', 'Not specified']).optional(),
})

// Export the email schema for backward compatibility
export const emailSchema = z.object({
  email: emailValidationSchema,
});
