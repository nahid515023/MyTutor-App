import { Router } from 'express'
import authRoutes from './auth'
import postRoutes from './post'
import profileRoutes from './profile'
import chatRouter from './chat'
import ratingRouter from './rating'
import meetingRoutes from './meeting'
import paymentRouter from './payment'
import dashboardRoutes from './dashboard'
import adminRoutes from './admin'



const rootRouter: Router = Router()

rootRouter.use('/auth',authRoutes)
rootRouter.use('/profile',profileRoutes)
rootRouter.use('/posts',postRoutes)
rootRouter.use('/chat',chatRouter);
rootRouter.use('/rating',ratingRouter);
rootRouter.use('/meeting',meetingRoutes);
rootRouter.use('/payment',paymentRouter);
rootRouter.use('/dashboard',dashboardRoutes);
rootRouter.use('/admin', adminRoutes);

export default rootRouter
