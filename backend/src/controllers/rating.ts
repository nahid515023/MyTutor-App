import { prisma } from '../index'
import { Request, Response } from 'express'

// This function is used to get all ratings of a user
export const allRatingByUser = async (req: Request, res: Response) => {
  const { userId } = req.params
  const ratings = await prisma.rating.findMany({
    where: {
      ratingTo: userId
    },
    include: {
      ratingByUser: true
    },
    orderBy: {
      ratedAt: 'desc'
    }
  })
  res.json({ratings})
}

// This function is used to get ratings by id
export const getRatingById = async (req: Request, res: Response) => {
  const { id } = req.params
  const rating = await prisma.rating.findUnique({
    where: {
      id
    }
  })
  res.json(rating)
}

// this function is used to create a rating
export const createRating = async (req: Request, res: Response) => {
  const { rating, review, postId, ratingBy, ratingTo, meetingId } = req.body
  await prisma.rating.create({
    data: {
      rating,
      review,
      postId,
      ratingBy,
      ratingTo,
      meetingId
    }
  })
  res.json({ message: 'Rating created successfully' })
}
