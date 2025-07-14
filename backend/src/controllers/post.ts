import { Request, Response, NextFunction } from 'express'
import { prisma } from '..'
import { createLogger } from '../services/logger'

const logger = createLogger('post-controller')

interface QueryParams {
  page?: number
  limit?: number
  sort?: 'asc' | 'desc'
  category?: string
}

export const getPosts = async (
  req: Request<{}, {}, {}, QueryParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
      booked: false
      },
      include: {
      User: true,
      TutorRequest: true
      },
      orderBy: {
      createdAt: 'desc'
      }
    })

    if (!posts) {
      logger.error('Fetching posts failed')
      return res.status(404).json({ message: 'Fetching posts failed' })
    }

    logger.info('Fetching posts successful')
    res.status(200).json({ posts: posts })
  } catch (error) {
    logger.error('Error fetching posts:', error)
    next(error)
  }
}

export const createPost = async (req: Request, res: Response) => {
  const { medium, selectedClass, subject, fees, description, preferableTime,preferableDate} =
    req.body
  const userId = req.user?.id

  const formattedPreferableTime = (() => {
    if (preferableTime && typeof preferableTime === 'string') {
      const convertToAmPm = (time: string): string => {
        const [hours, minutes] = time.trim().split(':')
        let hourNum = parseInt(hours, 10)
        const period = hourNum >= 12 ? 'PM' : 'AM'
        hourNum = hourNum % 12 || 12
        return `${hourNum}:${minutes} ${period}`
      }
      const times = preferableTime.split('-')
      if (times.length === 2) {
        return `${convertToAmPm(times[0])}-${convertToAmPm(times[1])}`
      }
    }
    return preferableTime
  })()

  if (req.user?.role === 'TEACHER') {
    return res.status(400).json({ message: 'Only student can create post!' })
  }

  try {
    console.log('Create post:', req.body)
    await prisma.post.create({
      data: {
        medium,
        Class: selectedClass,
        subject,
        fees,
        description,
        preferableTime,
        userId,
        preferableDate
      }
    })

    logger.info('Create post successfuly!')
    res.status(200).json({ message: 'Create post successfuly!' })
  } catch (err) {
    logger.error('Create post failed:', err)
    console.log(err)
    res.status(400).json({ message: 'Create post failed!' })
  }
}

export const updatePost = async (req: Request, res: Response) => {
  const { id } = req.params
  const { medium, selectedClass, subject, fees, description, preferableTime,preferableDate } = req.body
  try {
    await prisma.post.update({
      where: {
        id
      },
      data: {
        medium,
        Class:selectedClass,
        subject,
        fees,
        description,
        preferableTime,
        preferableDate,
      }
    })
    res.status(200).json({message: 'Update post success!' })
  } catch (err) {
    res.status(400).json({ message: 'Update post failed!' })
  }
}

export const deletePost = async (req: Request, res: Response) => {
  try {
    logger.info('Delete post:', req.params)
    const { id } = req.params
    await prisma.post.delete({
      where: {
        id
      }
    })
    res.status(200).json({ message: 'Delete post success!' })
  } catch (err) {
    res.status(400).json({ message: 'Delete post failed!' })
  }
}

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params
    const interested = await prisma.tutorRequest.findFirst({
      where: {
        postId: id,
        userId
      }
    })
    const posts = await prisma.post.findFirst({
      where: {
        id
      },
      include: {
        User: true,
        TutorRequest: true
      }
    })

    res.status(200).json({ post: posts, interested: interested ? true : false })
  } catch (err) {
    res.status(400).json({ message: 'Post dose not found!' })
  }
}

export const getTutorRequest = async (req: Request, res: Response) => {
  const { postId } = req.params
  // if (req.user?.role !== 'STUDENT') {
  //   return res.status(400).json({ message: 'Only teacher can request tutor!' })
  // }

  try {
    const date = await prisma.tutorRequest.findMany({
      where: {
        postId
      },
      include: {
        User: true
      }
    })
    res.status(200).json({ allRequest: date })
  } catch (err) {
    res.status(400).json({ message: 'Request tutor failed!' })
  }
}

export const createTutorRequest = async (req: Request, res: Response) => {
  const userId = req.user?.id
  const { postId } = req.params
  const { comment } = req.body

  if (req.user?.role !== 'TEACHER') {
    return res.status(400).json({ message: 'Only teacher can request tutor!' })
  }

  try {
    await prisma.tutorRequest.create({
      data: {
        postId,
        userId,
        comment
      }
    })
    res.status(200).json({ message: 'Request tutor success!' })
  } catch (err) {
    res.status(400).json({ message: 'Request tutor failed!' })
  }
}

export const removeTutorRequest = async (req: Request, res: Response) => {
  const userId = req.user?.id
  const { postId } = req.params

  if (req.user?.role !== 'TEACHER') {
    return res.status(400).json({ message: 'Only Author can delete!' })
  }

  try {
    const data = await prisma.tutorRequest.findFirst({
      where: {
        postId,
        userId
      }
    })
    if (!data) {
      return res.status(400).json({ message: 'Request not found!' })
    }
    await prisma.tutorRequest.delete({
      where: {
        id: data.id
      }
    })
    res.status(200).json({ message: 'Remove successful!' })
  } catch (err) {
    res.status(400).json({ message: 'Remove failed!' })
  }
}

export const getUserAllPost = async (req: Request, res: Response) => {
  const userId = req.params.userId
  console.log('User id:', userId)
  const posts = await prisma.post.findMany({
    where: {
      userId
    },
    include: {
      TutorRequest: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  res.status(200).json({ posts: posts, message: 'Get user post success!' })
}

export const bookedPost = async (req: Request, res: Response) => {
  const postId = req.params.postId
  logger.info('Booked post:', postId)
  try {
    await prisma.post.update({
      where: {
        id: postId
      },
      data: {
        booked: true
      }
    })
    res.status(200).json({ message: 'Post booked success!' })
  } catch (err) {
    res.status(400).json({ message: 'Post booked failed!' })
  }
}
