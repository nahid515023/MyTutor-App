import { NextFunction, Request, Response } from 'express'
import { logger } from '../services/logger'
import { prisma } from '..'
import { unlinkSync } from 'fs'
import { ErrorCode } from '../exceptions/root'
import { BadRequestException } from '../exceptions/bad-request'
import { NotFoundException } from '../exceptions/not-found'
import { UnprocessableEntity } from '../exceptions/validation'
import { hashSync, compareSync } from 'bcrypt'

const maxAge = 24 * 3600 * 1000 * 30

export const updateProfile = async (req: Request, res: Response) => {
  console.log("req.body:", req.body)
  const { education, email, location, phone, name, bio, skills } = req.body

  // Create an object with only the fields that were sent in the request
  const updateData: any = {}
  if (name !== undefined) updateData.name = name
  if (bio !== undefined) updateData.bio = bio
  if (email !== undefined) updateData.email = email
  if (location !== undefined) updateData.location = location
  if (phone !== undefined) updateData.phone = phone

  // Handle education if provided
  if (education && education.length > 0) {
    updateData.education = Array.isArray(education) 
      ? education.filter((element: string) => element.trim() !== '').join('#')
      : ''
  }

  // Handle skills if provided
  if (skills && skills.length > 0) {
    updateData.skills = Array.isArray(skills)
      ? skills.filter((element: string) => element.trim() !== '').join('#')
      : ''
  }

  console.log("req.user.id:", req.user.id)
  // Ensure the request has a valid user id
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const user = await prisma.user.update({
      where: {
        id: req.user?.id
      },
      data: updateData
    })

    // Convert education and skills back to arrays for frontend
    const userResponse = {
      ...user,
      education: user.education ? user.education.split('#') : [],
      skills: user.skills ? user.skills.split('#') : []
    }

    // Define a cookie max age (e.g., one day)
    const maxAge = 24 * 60 * 60 * 1000 // 1 day in milliseconds

    res
      .cookie('user', JSON.stringify(userResponse), { httpOnly: false, maxAge })
      .json({ 
        message: 'Update Successful!', 
        user: userResponse,
        updatedFields: Object.keys(updateData)
      })
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const updateProfileImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const image = req.file?.filename
  const oldImage = req.user?.image
  console.log(image)
  let user
  try {
    user = await prisma.user.update({
      where: {
        id: req.user?.id
      },
      data: {
        profileImage: image
      }
    })
    if (oldImage) {
      unlinkSync(`uploads/${oldImage}`)
    }
  } catch (error) {
    return next(
      new UnprocessableEntity(
        error,
        'File upload failed!',
        ErrorCode.UNPROCESSABLE_ENTITY
      )
    )
  }

  res
    .cookie('user', JSON.stringify(user), { httpOnly: false, maxAge })
    .json({ message: 'Update Successful!', user })
}

export const updateCoverImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const image = req.file?.filename
  const oldImage = req.user?.coverImage
  console.log(image)
  let user
  try {
    user = await prisma.user.update({
      where: {
        id: req.user?.id
      },
      data: {
        coverImage: image
      }
    })
    if (oldImage) {
      unlinkSync(`uploads/${oldImage}`)
    }
  } catch (error) {
    return next(
      new UnprocessableEntity(
        error,
        'File upload failed!',
        ErrorCode.UNPROCESSABLE_ENTITY
      )
    )
  }

  res
    .cookie('user', JSON.stringify(user), { httpOnly: false, maxAge })
    .json({ message: 'Update Successful!', user })
}

export const getUser = async (req: Request, res: Response) => {
  const user = await prisma.user.findFirst({
    where: {
      id: req.params.id
    }
  })
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }
  const education = user.education?.split('#') || []
  const skills = user.skills?.split('#') || []
  const userWithEducation = { ...user, education, skills }
  res.json({ user: userWithEducation })
}

export const getTutors = async (_: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where: {
      role: 'TEACHER'
    },
    select: {
      id: true,
      name: true,
      skills: true,
      profileImage: true,
      role: true,
      RatingTo: {
        select: {
          rating: true
        }
      }
    }
  })

  interface Rating {
    rating: number;
  }

  interface TutorUser {
    id: string;
    name: string;
    skills: string | null;
    profileImage: string | null;
    role: string;
    RatingTo: Rating[];
  }

  interface TutorUserWithRatings extends Omit<TutorUser, 'RatingTo'> {
    totalRatings: number;
    averageRating: number;
  }

  const user: TutorUserWithRatings[] = users.map((user: TutorUser): TutorUserWithRatings => {
    // Calculate ratings first
    const totalRatings: number = user.RatingTo.length;
    const averageRating: number = user.RatingTo.length > 0 
      ? user.RatingTo.reduce((acc: number, curr: Rating) => acc + curr.rating, 0) / user.RatingTo.length 
      : 0;

    const { RatingTo, ...userWithoutRating } = user;
    
    return {
      ...userWithoutRating,
      totalRatings,
      averageRating
    };
  });

  console.log(user)
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }
  res.json({ tutors: user })
}

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Processing password change request')
    const { currentPassword, newPassword } = req.body
    console.log(req.body)
    const userId = req.params.userId

    if (!userId) {
      logger.warn('Password change failed - user not authenticated')
      throw new BadRequestException(
        'User not authenticated',
        ErrorCode.UNAUTHORIZED
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      logger.warn('Password change failed - user not found', { userId })
      throw new NotFoundException('User not found!', ErrorCode.USER_NOT_FOUND)
    }

    logger.debug('Verifying current password', { userId })

    if (!compareSync(currentPassword, user.password)) {
      logger.warn('Password change failed - incorrect current password', {
        userId
      })
      throw new BadRequestException(
        'Incorrect password',
        ErrorCode.INCORRECT_PASSWORD
      )
    }

    logger.debug('Updating password', { userId })
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashSync(newPassword, 12)
      }
    })

    logger.info('Password updated successfully', { userId })
    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    logger.error('Password change error:', error)
    next(error)
  }
}

export const changeEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Processing email change request')
    const { email, password } = req.body
    console.log(req.body)
    const userId = req.params.userId

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      logger.warn('Email change failed - user not found', { userId })
      throw new NotFoundException('User not found!', ErrorCode.USER_NOT_FOUND)
    }

    logger.debug('Verifying current password', { userId })

    if (!compareSync(password, user.password)) {
      logger.warn('Email change failed - incorrect password', { userId })
      throw new BadRequestException(
        'Incorrect password',
        ErrorCode.INCORRECT_PASSWORD
      )
    }

    const existingUser = await prisma.user.findFirst({
      where: { email }
    })

    if (!existingUser) {
      logger.warn('Email change failed - email already in use', { userId })
      throw new BadRequestException(
        'Email already in use',
        ErrorCode.EMAIL_ALREADY_IN_USE
      )
    }

    logger.debug('Updating email', { userId, newEmail: email })

    await prisma.user.update({
      where: { id: userId },
      data: { email }
    })

    logger.info('Email updated successfully', { userId })
    res.json({
      message: 'Email updated successfully!'
    })
  } catch (error) {
    logger.error('Email change error:', error)
    next(error)
  }
}
