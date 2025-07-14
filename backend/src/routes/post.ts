import { Router } from 'express'
import {
  createPost,
  getPosts,
  deletePost,
  updatePost,
  getUserAllPost,
  getPostById,
  createTutorRequest,
  removeTutorRequest,
  getTutorRequest,
  bookedPost
} from '../controllers/post'
import { errorHandler } from '../error-hander'
import { authMiddleware } from '../middlewares/auth'
import { 
  requireTeacher, 
  requireStudent,
  requireOwnership, 
  requireActiveAccount, 
  requireVerification,
  combineRestrictions,
  rateLimitPerUser,
  requireAsyncPermission
} from '../middlewares/routeRestriction'
import { checkPostOwnership, checkTutorRequestInvolvement } from '../utils/ownershipUtils'

const postRoutes: Router = Router()

// Base restrictions for authenticated post routes
const basePostRestrictions = combineRestrictions(
  authMiddleware,
  requireActiveAccount(),
  requireVerification()
)

// Public routes - no authentication required
postRoutes.get('/', errorHandler(getPosts)) // Anyone can view posts
postRoutes.get('/:id', errorHandler(getPostById)) // Anyone can view a specific post
postRoutes.get('/request/:postId', errorHandler(getTutorRequest)) // Anyone can view tutor requests

// Post creation - only students can create posts (looking for tutors)
postRoutes.post(
  '/', 
  basePostRestrictions,
  requireStudent, // Only students can create posts
  rateLimitPerUser(5, 60 * 60 * 1000), // Max 5 posts per hour
  errorHandler(createPost)
)

// Delete post - only post owner can delete their own posts
postRoutes.delete(
  '/:id', 
  basePostRestrictions,
  requireAsyncPermission(async (user, req) => {
    // Check if user owns the post or is admin
    if (user.role === 'ADMIN') return true
    return await checkPostOwnership(user.id, req.params.id)
  }, 'You can only delete your own posts'),
  errorHandler(deletePost)
)

// Get user's own posts - with ownership check
postRoutes.get(
  '/my-post/:userId', 
  basePostRestrictions,
  requireOwnership('userId'), // Can only view own posts
  errorHandler(getUserAllPost)
)

// Book a post - only teachers can book posts
postRoutes.put(
  '/booked/:postId', 
  basePostRestrictions,
  requireTeacher, // Only teachers can book posts
  errorHandler(bookedPost)
)

// Update post - only post owner can update
postRoutes.put(
  '/updatePost/:id', 
  basePostRestrictions,
  requireAsyncPermission(async (user, req) => {
    // Check if user owns the post or is admin
    if (user.role === 'ADMIN') return true
    return await checkPostOwnership(user.id, req.params.id)
  }, 'You can only update your own posts'),
  errorHandler(updatePost)
)

// Tutor request routes
// Create tutor request - only teachers can request to tutor
postRoutes.post(
  '/request/:postId', 
  basePostRestrictions,
  requireTeacher, // Only teachers can apply to tutor
  rateLimitPerUser(10, 60 * 60 * 1000), // Max 10 applications per hour
  errorHandler(createTutorRequest)
)

// Remove tutor request - only the teacher who made the request can remove it
postRoutes.delete(
  '/request/:postId', 
  basePostRestrictions,
  requireTeacher, // Only teachers can remove tutor requests
  errorHandler(removeTutorRequest)
)



export default postRoutes
