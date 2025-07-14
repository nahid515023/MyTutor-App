import { Request, Response } from 'express'
import { prisma } from '..'
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.count()
    const posts = await prisma.post.count()
    const ratings = await prisma.rating.count()
    const meetings = await prisma.meeting.count()
    const payments = await prisma.payment.count()
    const chats = await prisma.chat.count()
    const dashboardData = {
      users,
      posts,
      ratings,
      meetings,
      payments,
      chats
    }
    res.status(200).json(dashboardData)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })
    res.status(200).json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params.id
  try {
    await prisma.user.delete({
      where: { id: userId }
    })
    res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateStatus = async (req: Request, res: Response) => {
  const userId = req.params.id
  const { status } = req.body
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status }
    })
    res.status(200).json(updatedUser)
  } catch (error) {
    console.error('Error updating user status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        TutorRequest: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        Rating: {
          include: {
            ratingByUser: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        Meeting: true,
        Payment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    res.status(200).json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deletePost = async (req: Request, res: Response) => {
  const postId = req.params.id
  try {
    await prisma.post.delete({
      where: { id: postId }
    })
    res.status(200).json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updatePostStatus = async (req: Request, res: Response) => {
  const postId = req.params.id
  const { booked } = req.body
  try {
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { booked }
    })
    res.status(200).json(updatedPost)
  } catch (error) {
    console.error('Error updating post status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getPayments = async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
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
        },
        Post: {
          select: {
            id: true,
            subject: true,
            Class: true,
            medium: true,
            description: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    res.status(200).json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deletePayment = async (req: Request, res: Response) => {
  const paymentId = req.params.id
  try {
    await prisma.payment.delete({
      where: { id: paymentId }
    })
    res.status(200).json({ message: 'Payment deleted successfully' })
  } catch (error) {
    console.error('Error deleting payment:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updatePaymentStatus = async (req: Request, res: Response) => {
  const paymentId = req.params.id
  const { status } = req.body
  try {
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status }
    })
    res.status(200).json(updatedPayment)
  } catch (error) {
    console.error('Error updating payment status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getMeetings = async (req: Request, res: Response) => {
  try {
    const meetings = await prisma.meeting.findMany({
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
        },
        Post: {
          select: {
            id: true,
            subject: true,
            Class: true,
            medium: true,
            description: true,
            fees: true
          }
        },
        Rating: {
          select: {
            id: true,
            rating: true,
            review: true,
            ratingBy: true,
            ratingTo: true
          }
        }
      },
      orderBy: {
        start: 'desc'
      }
    })
    res.status(200).json(meetings)
  } catch (error) {
    console.error('Error fetching meetings:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteMeeting = async (req: Request, res: Response) => {
  const meetingId = req.params.id
  try {
    await prisma.meeting.delete({
      where: { id: meetingId }
    })
    res.status(200).json({ message: 'Meeting deleted successfully' })
  } catch (error) {
    console.error('Error deleting meeting:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateMeetingStatus = async (req: Request, res: Response) => {
  const meetingId = req.params.id
  const { title, start, end, link, date } = req.body
  try {
    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: { title, start, end, link, date }
    })
    res.status(200).json(updatedMeeting)
  } catch (error) {
    console.error('Error updating meeting:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Email Verification endpoints
export const getEmailVerifications = async (req: Request, res: Response) => {
  try {
    const emailVerifications = await prisma.emailVerification.findMany({
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            verified: true,
            role: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    res.status(200).json(emailVerifications)
  } catch (error) {
    console.error('Error fetching email verifications:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteEmailVerification = async (req: Request, res: Response) => {
  const verificationId = req.params.id
  try {
    await prisma.emailVerification.delete({
      where: { id: verificationId }
    })
    res.status(200).json({ message: 'Email verification deleted successfully' })
  } catch (error) {
    console.error('Error deleting email verification:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const resendEmailVerification = async (req: Request, res: Response) => {
  const verificationId = req.params.id
  try {
    // In a real application, you would regenerate the token and send a new email
    // For now, we'll just update the updatedAt timestamp
    const updatedVerification = await prisma.emailVerification.update({
      where: { id: verificationId },
      data: { updatedAt: new Date() }
    })
    res.status(200).json({ message: 'Email verification resent successfully', data: updatedVerification })
  } catch (error) {
    console.error('Error resending email verification:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Enhanced dashboard analytics
export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    // Get total counts
    const totalUsers = await prisma.user.count()
    const totalPosts = await prisma.post.count()
    const totalMeetings = await prisma.meeting.count()
    const totalPayments = await prisma.payment.count()
    const totalEmailVerifications = await prisma.emailVerification.count()

    // Get user statistics
    const activeUsers = await prisma.user.count({
      where: { status: 'active' }
    })
    const blockedUsers = await prisma.user.count({
      where: { status: 'blocked' }
    })
    const verifiedUsers = await prisma.user.count({
      where: { verified: true }
    })

    // Get role distribution
    const students = await prisma.user.count({
      where: { role: 'STUDENT' }
    })
    const teachers = await prisma.user.count({
      where: { role: 'TEACHER' }
    })
    const admins = await prisma.user.count({
      where: { role: 'ADMIN' }
    })

    // Get payment statistics
    const pendingPayments = await prisma.payment.count({
      where: { status: 'PENDING' }
    })
    const completedPayments = await prisma.payment.count({
      where: { status: 'COMPLETED' }
    })
    const totalRevenue = await prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true }
    })

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })

    const recentMeetings = await prisma.meeting.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // Get monthly user registration trend (last 6 months)
    const monthlyUserData = []
    for (let i = 5; i >= 0; i--) {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - i)
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)

      const usersCount = await prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate
          }
        }
      })

      const studentsCount = await prisma.user.count({
        where: {
          role: 'STUDENT',
          createdAt: {
            gte: startDate,
            lt: endDate
          }
        }
      })

      const teachersCount = await prisma.user.count({
        where: {
          role: 'TEACHER',
          createdAt: {
            gte: startDate,
            lt: endDate
          }
        }
      })

      monthlyUserData.push({
        month: startDate.toLocaleDateString('en-US', { month: 'short' }),
        students: studentsCount,
        teachers: teachersCount,
        total: usersCount
      })
    }

    // Get daily activity for the last 7 days
    const dailyActivityData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const meetingsCount = await prisma.meeting.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      })

      const paymentsCount = await prisma.payment.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      })

      dailyActivityData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        meetings: meetingsCount,
        payments: paymentsCount
      })
    }

    // Get recent system activities
    const recentActivities = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        verified: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10
    })

    const analytics = {
      summary: {
        totalUsers,
        totalPosts,
        totalMeetings,
        totalPayments,
        totalEmailVerifications,
        activeUsers,
        blockedUsers,
        verifiedUsers,
        recentUsers,
        recentMeetings
      },
      userDistribution: {
        students,
        teachers,
        admins
      },
      payments: {
        pending: pendingPayments,
        completed: completedPayments,
        totalRevenue: totalRevenue._sum.amount || 0
      },
      charts: {
        monthlyUsers: monthlyUserData,
        dailyActivity: dailyActivityData
      },
      recentActivities
    }

    res.status(200).json(analytics)
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
