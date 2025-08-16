import { Router } from 'express'
import {
  getDashboardData,
  getDashboardAnalytics,
  getPublicStatistics,
  getUsers,
  deleteUser,
  updateStatus,
  getPosts,
  deletePost,
  updatePostStatus,
  getPayments,
  deletePayment,
  updatePaymentStatus,
  getMeetings,
  deleteMeeting,
  updateMeetingStatus,
  getEmailVerifications,
  deleteEmailVerification,
  resendEmailVerification
} from '../controllers/dashboard'
import { errorHandler } from '../error-hander'
import { authMiddleware } from '../middlewares/auth'
import { 
  requireAdmin, 
  requireActiveAccount, 
  requireVerification,
  combineRestrictions 
} from '../middlewares/routeRestriction'

const dashboardRouter: Router = Router()

// Public statistics endpoint (no authentication required)
dashboardRouter.get('/public-stats', errorHandler(getPublicStatistics))

// All dashboard routes require authentication, verification, and active account
const baseDashboardRestrictions = combineRestrictions(
  authMiddleware,
  requireVerification(),
  requireActiveAccount()
)

// Dashboard overview - Admin only
dashboardRouter.get('/', baseDashboardRestrictions, requireAdmin, errorHandler(getDashboardData))
dashboardRouter.get('/analytics', baseDashboardRestrictions, requireAdmin, errorHandler(getDashboardAnalytics))
// User management - Admin only
dashboardRouter.get('/users', baseDashboardRestrictions, requireAdmin, errorHandler(getUsers))
dashboardRouter.delete('/users/:id', baseDashboardRestrictions, requireAdmin, errorHandler(deleteUser))
dashboardRouter.put('/users/:id', baseDashboardRestrictions, requireAdmin, errorHandler(updateStatus))

// Post management - Admin only
dashboardRouter.get('/posts', baseDashboardRestrictions, requireAdmin, errorHandler(getPosts))
dashboardRouter.delete('/posts/:id', baseDashboardRestrictions, requireAdmin, errorHandler(deletePost))
dashboardRouter.put('/posts/:id', baseDashboardRestrictions, requireAdmin, errorHandler(updatePostStatus))

// Payment management - Admin only
dashboardRouter.get('/payments', baseDashboardRestrictions, requireAdmin, errorHandler(getPayments))
dashboardRouter.delete('/payments/:id', baseDashboardRestrictions, requireAdmin, errorHandler(deletePayment))
dashboardRouter.put('/payments/:id', baseDashboardRestrictions, requireAdmin, errorHandler(updatePaymentStatus))

// Meeting management - Admin only
dashboardRouter.get('/meetings', baseDashboardRestrictions, requireAdmin, errorHandler(getMeetings))
dashboardRouter.delete('/meetings/:id', baseDashboardRestrictions, requireAdmin, errorHandler(deleteMeeting))
dashboardRouter.put('/meetings/:id', baseDashboardRestrictions, requireAdmin, errorHandler(updateMeetingStatus))

// Email verification management - Admin only
dashboardRouter.get('/email-verifications', baseDashboardRestrictions, requireAdmin, errorHandler(getEmailVerifications))
dashboardRouter.delete('/email-verifications/:id', baseDashboardRestrictions, requireAdmin, errorHandler(deleteEmailVerification))
dashboardRouter.put('/email-verifications/:id/resend', baseDashboardRestrictions, requireAdmin, errorHandler(resendEmailVerification))

export default dashboardRouter
