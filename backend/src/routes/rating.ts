import { Router } from 'express'
import { errorHandler } from '../error-hander'

import {
  allRatingByUser,
  createRating,
  getRatingById
} from '../controllers/rating'

const ratingRoutes: Router = Router()

ratingRoutes.post('/review', errorHandler(createRating))
ratingRoutes.get('/:id', errorHandler(getRatingById))
ratingRoutes.get('/allRatingByUser/:userId', errorHandler(allRatingByUser))

export default ratingRoutes
