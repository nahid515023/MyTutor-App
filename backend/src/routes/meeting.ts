import { Router } from 'express'
import {
  createMeeting,
  getMeetingsByUserId,
  deleteMeeting,
  updateMeeting,
  getMeetingsByPostId
} from '../controllers/meeting'
import { errorHandler } from '../error-hander'
import { authMiddleware } from '../middlewares/auth'
import { requireStudent } from '../middlewares/routeRestriction'

const meetingRoutes: Router = Router()

meetingRoutes.get('/:postId', authMiddleware, requireStudent, errorHandler(getMeetingsByPostId))
meetingRoutes.get(
  '/get/:userId/:role',
  authMiddleware,
  errorHandler(getMeetingsByUserId)
)
meetingRoutes.post('/create', authMiddleware, requireStudent, errorHandler(createMeeting))
meetingRoutes.put('/:meetingId', authMiddleware, requireStudent, errorHandler(updateMeeting))
meetingRoutes.delete('/:postId', authMiddleware, requireStudent, errorHandler(deleteMeeting))

export default meetingRoutes
