import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth'

const paymentRouter: Router = Router()
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
