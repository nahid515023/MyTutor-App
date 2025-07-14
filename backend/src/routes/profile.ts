import { Router } from 'express'
import { errorHandler } from '../error-hander'
import {
  updateProfile,
  updateProfileImage,
  getUser,
  changeEmail,
  changePassword,
  updateCoverImage,
  getTutors
} from '../controllers/porfile'
import { authMiddleware } from '../middlewares/auth'
import upload from '../utils/imageUpload'
import { 
  requireTeacher, 
  requireOwnership, 
  requireActiveAccount, 
  requireVerification,
  combineRestrictions,
  rateLimitPerUser 
} from '../middlewares/routeRestriction'

const profileRoutes: Router = Router()

// Base restrictions for profile routes
const baseProfileRestrictions = combineRestrictions(
  authMiddleware,
  requireActiveAccount()
)

// Get all tutors - any authenticated active user can access, but only teachers are shown
profileRoutes.get('/allTutors', baseProfileRestrictions, errorHandler(getTutors))

// Get specific user profile - any authenticated active user can access
profileRoutes.get('/:id', baseProfileRestrictions, errorHandler(getUser))

// Update own profile - user can only update their own profile
profileRoutes.post(
  '/update-profile',
  baseProfileRestrictions,
  requireVerification(), // Must be verified to update profile
  errorHandler(updateProfile)
)

// Update profile image - with rate limiting and ownership check
profileRoutes.post(
  '/update-image',
  baseProfileRestrictions,
  requireVerification(),
  rateLimitPerUser(10, 60 * 1000), // Max 10 image uploads per minute
  upload.single('profilePic'),
  errorHandler(updateProfileImage)
)

// Update cover image - with rate limiting and ownership check
profileRoutes.post(
  '/update-cover',
  baseProfileRestrictions,
  requireVerification(),
  rateLimitPerUser(5, 60 * 1000), // Max 5 cover uploads per minute
  upload.single('coverPhoto'),
  errorHandler(updateCoverImage)
)

// Change password - user can only change their own password
profileRoutes.post(
  '/change-password/:userId',
  baseProfileRestrictions,
  requireOwnership('userId'), // Can only change own password
  errorHandler(changePassword)
)

// Change email - user can only change their own email
profileRoutes.post(
  '/change-email/:userId', 
  baseProfileRestrictions,
  requireOwnership('userId'), // Can only change own email
  errorHandler(changeEmail)
)

export default profileRoutes
