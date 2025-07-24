import { NextFunction, Request, Response } from 'express'
import { prisma } from '..'
import EmailService from '../services/email'
import MeetingNotificationService from '../services/meetingNotification'

export const createMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const convertTimeToDate = (dateStr: string, timeStr: string): Date => {
      const dateTime = `${dateStr}T${timeStr}:00Z`
      const fullDate = new Date(dateTime)
      if (isNaN(fullDate.getTime())) {
        throw new Error('Invalid date or time format')
      }
      return fullDate
    }
    const startTime = convertTimeToDate(req.body.date, req.body.start)
    const endTime = convertTimeToDate(req.body.date, req.body.end)
    await prisma.meeting.create({
      data: {
        title: req.body.title,
        userId: req.body.userId,
        teacherId: req.body.teacherId,
        postId: req.body.postId,
        start: startTime,
        end: endTime,
        link: req.body.link,
        date: new Date(`${req.body.date}T00:00:00`)
      }
    })

    await prisma.post.update({
      where: {
        id: req.body.postId
      },
      data: {
        booked: true
      }
    })
    res.status(200).json({ message: 'Meeting created successfully!' })
  } catch (error) {
    console.error('Error creating meeting:', error)
    next(error)
  }
}

export const getMeetings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const meetings = await prisma.meeting.findMany()
    res.status(200).json(meetings)
  } catch (error) {
    console.error('Error fetching meetings:', error)
    next(error)
  }
}

export const getMeetingsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.params)
    const meetings = await prisma.meeting.findMany({
      where: {
        [req.params.role === 'TEACHER' ? 'teacherId' : 'userId']: req.params.userId
      },
      include: {
        Rating: true
      }
    })
    res.status(200).json(meetings)
  } catch (error) {
    console.error('Error fetching meetings by user ID:', error)
    next(error)
  }
}

export const deleteMeeting = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params

    if (!postId) {
      return res.status(400).json({ error: 'postId is required' })
    }

    await prisma.post.update({
      where: {
        id: postId
      },
      data: {
        booked: false
      }
    })

    // Find the meeting using postId
    const meeting = await prisma.meeting.findFirst({
      where: { postId },
      select: { id: true }
    })



    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }

    // Delete using the unique id
    await prisma.meeting.delete({
      where: { id: meeting.id }
    })

    return res.status(200).json({ message: 'Meeting deleted successfully' })
  } catch (error) {
    console.error('Error deleting meeting:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params

    if (!meetingId) {
      return res.status(400).json({ error: 'meetingId is required' })
    }

    const parseDateTime = (dateTimeStr: string): Date => {
      const fullDate = new Date(dateTimeStr)
      if (isNaN(fullDate.getTime())) {
        throw new Error('Invalid date or time format')
      }
      return fullDate
    }

    const startTime = parseDateTime(req.body.start)
    const endTime = parseDateTime(req.body.end)

    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        title: req.body.title,
        start: startTime,
        end: endTime,
        link: req.body.link,
        date: new Date(req.body.date)
      }
    })

    return res
      .status(200)
      .json({
        message: 'Meeting updated successfully',
        meeting: updatedMeeting
      })
  } catch (error) {
    console.error('Error updating meeting:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const getMeetingsByPostId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId } = req.params
    console.log('Fetching meetings for postId:', postId)

    if (!postId) {
      return res.status(400).json({ error: 'postId is required' })
    }

    const meetings = await prisma.meeting.findFirst({
      where: { postId },
      select:{
        id:true,
        userId:true,
        teacherId:true,
      }
    })

    res.status(200).json(meetings)
  } catch (error) {
    console.error('Error fetching meetings by post ID:', error)
    next(error)
  }
}

export const checkUpcomingMeetings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params
    const now = new Date()
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000)

    // Find meetings starting within 30 minutes
    const upcomingMeetings = await prisma.meeting.findMany({
      where: {
        OR: [
          { userId: userId },
          { teacherId: userId }
        ],
        start: {
          gte: now,
          lte: thirtyMinutesFromNow
        }
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        Teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    res.status(200).json(upcomingMeetings)
  } catch (error) {
    console.error('Error checking upcoming meetings:', error)
    next(error)
  }
}

export const sendMeetingNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await MeetingNotificationService.sendImmediateNotifications()
    
    res.status(200).json({ 
      message: 'Notifications sent successfully',
      meetingsNotified: result.meetingsNotified
    })
  } catch (error) {
    console.error('Error sending meeting notifications:', error)
    next(error)
  }
}
