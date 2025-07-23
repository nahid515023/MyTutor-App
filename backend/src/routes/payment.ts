import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth'
import cors from 'cors'

const paymentRouter: Router = Router()

// Add specific CORS for payment routes
paymentRouter.use(cors({
  origin: true, // Allow all origins for payment routes in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}))

import { 
  createPayment, 
  successPayment, 
  failPayment, 
  cancelPayment, 
  ipnHandler,
  getPaymentHistory 
} from '../controllers/payment'

paymentRouter.post('/create', createPayment)
paymentRouter.post('/success/:tran_id', successPayment)
paymentRouter.post('/fail/:tran_id', failPayment)
paymentRouter.post('/cancel/:tran_id', cancelPayment)
paymentRouter.post('/ipn', ipnHandler)
paymentRouter.get('/history/:userId', authMiddleware, getPaymentHistory)

export default paymentRouter
