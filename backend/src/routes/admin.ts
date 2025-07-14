import { Router } from 'express'
import { 
  adminLogin, 
  adminDashboard, 
  getAllUsers, 
  getUserById, 
  updateUserStatus, 
  deleteUser,
  getPlatformAnalytics,
  getAllPosts,
  deletePost,
  getAllPayments,
  getReports,
  createAdminUser
} from '../controllers/admin'
import { errorHandler } from '../error-hander'
import { authMiddleware } from '../middlewares/auth'
import { requireRole } from '../middlewares/authorization'

const adminRoutes: Router = Router()

// Admin authentication
adminRoutes.post('/login', errorHandler(adminLogin))
adminRoutes.post('/create-admin', errorHandler(createAdminUser)) // Only for initial setup

// Protected admin routes
adminRoutes.use(authMiddleware)
adminRoutes.use(requireRole(['ADMIN']))

// Dashboard
adminRoutes.get('/dashboard', errorHandler(adminDashboard))
adminRoutes.get('/analytics', errorHandler(getPlatformAnalytics))

// User Management
adminRoutes.get('/users', errorHandler(getAllUsers))
adminRoutes.get('/users/:id', errorHandler(getUserById))
adminRoutes.put('/users/:id/status', errorHandler(updateUserStatus))
adminRoutes.delete('/users/:id', errorHandler(deleteUser))

// Post Management
adminRoutes.get('/posts', errorHandler(getAllPosts))
adminRoutes.delete('/posts/:id', errorHandler(deletePost))

// Payment Management
adminRoutes.get('/payments', errorHandler(getAllPayments))

// Reports
adminRoutes.get('/reports', errorHandler(getReports))

export default adminRoutes
