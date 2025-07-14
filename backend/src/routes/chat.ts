import { Router } from 'express'
import {
  connectUser,
  createChat,
  deleteChat,
  disconnectUser,
  getChat,
  getConnectedUsers
} from '../controllers/chat'
import { authMiddleware } from '../middlewares/auth'

const chatRouter = Router()

//Chat connection routes
chatRouter.get('/users/connected/:userId', authMiddleware, getConnectedUsers)
chatRouter.post('/users/connect/:contactUserId', authMiddleware, connectUser)
chatRouter.delete(
  '/users/connect/:contactUserId',
  authMiddleware,
  disconnectUser
)
//Chat routes
chatRouter.get('/chats/:connectedId', authMiddleware, getChat)
chatRouter.post('/chats', authMiddleware, createChat)
chatRouter.delete('/chats/:id', authMiddleware, deleteChat)

export default chatRouter
