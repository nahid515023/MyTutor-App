import { NextFunction, Request, Response } from 'express'
import { prisma } from '../index'
import { BadRequestException } from '../exceptions/bad-request'
import { ErrorCode } from '../exceptions/root'
import { hashSync, compareSync } from 'bcrypt'
import { NotFoundException } from '../exceptions/not-found'
import { UnauthorizedException } from '../exceptions/unauthorized'
import { ForbiddenException } from '../exceptions/forbidden'
import * as jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../secrets'
import { createLogger } from '../services/logger'
import { z } from 'zod'

const logger = createLogger('admin-controller')

// Validation schemas
const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

const createAdminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
})

const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'blocked', 'suspended'])
})

// Admin Login
export const adminLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Processing admin login request', { email: req.body.email })
    
    try {
      adminLoginSchema.parse(req.body)
    } catch (error) {
      logger.warn('Admin login failed - invalid input', { error })
      return next(
        new BadRequestException(
          'Invalid input data',
          ErrorCode.INVALID_INPUT
        )
      )
    }

    const { email, password } = req.body

    const admin = await prisma.user.findFirst({
      where: { 
        email, 
        role: 'ADMIN' 
      }
    })

    if (!admin) {
      logger.warn('Admin login failed - admin not found', { email })
      return next(
        new UnauthorizedException('Invalid credentials', ErrorCode.UNAUTHORIZED)
      )
    }

    if (!admin.verified) {
      logger.warn('Admin login failed - admin not verified', { email })
      return next(
        new UnauthorizedException('Admin account not verified', ErrorCode.USER_NOT_VERIFIED)
      )
    }

    if (admin.status !== 'active') {
      logger.warn('Admin login failed - admin account not active', { email })
      return next(
        new ForbiddenException('Admin account is not active', ErrorCode.FORBIDDEN)
      )
    }

    if (!compareSync(password, admin.password)) {
      logger.warn('Admin login failed - incorrect password', { email })
      return next(
        new UnauthorizedException('Invalid credentials', ErrorCode.UNAUTHORIZED)
      )
    }

    logger.debug('Generating JWT token for admin', { adminId: admin.id })
    const token = jwt.sign(
      { userId: admin.id, role: admin.role }, 
      JWT_SECRET!, 
      { expiresIn: '8h' } // Shorter expiry for admin sessions
    )

    const maxAge = 8 * 3600 * 1000 // 8 hours

    logger.info('Admin login successful', { adminId: admin.id })
    
    // Remove password from response
    const { password: _, ...adminData } = admin
    
    res
      .cookie('token', JSON.stringify(token), { httpOnly: false, maxAge })
      .cookie('user', JSON.stringify(adminData), { httpOnly: false, maxAge })
      .json({
        message: 'Admin login successful!',
        admin: adminData,
        token
      })
  } catch (error) {
    logger.error('Admin login error', { error })
    next(error)
  }
}

// Create Admin User (for initial setup)
export const createAdminUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Creating admin user', { email: req.body.email })
    
    try {
      createAdminSchema.parse(req.body)
    } catch (error) {
      logger.warn('Admin creation failed - invalid input', { error })
      return next(
        new BadRequestException(
          'Invalid input data',
          ErrorCode.INVALID_INPUT
        )
      )
    }

    const { name, email, password } = req.body

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { email }
    })

    if (existingAdmin) {
      return next(
        new BadRequestException('Admin already exists', ErrorCode.USER_ALREADY_EXISTS)
      )
    }

    // Check if any admin exists (for security - only allow if no admin exists)
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    })

    if (adminCount > 0) {
      return next(
        new ForbiddenException('Admin creation not allowed', ErrorCode.FORBIDDEN)
      )
    }

    const hashedPassword = hashSync(password, 12)

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        verified: true,
        status: 'active'
      }
    })

    logger.info('Admin user created successfully', { adminId: admin.id })

    const { password: _, ...adminData } = admin
    
    res.status(201).json({
      message: 'Admin user created successfully',
      admin: adminData
    })
  } catch (error) {
    logger.error('Admin creation error', { error })
    next(error)
  }
}

// Admin Dashboard
export const adminDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Fetching admin dashboard data')

    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalPosts,
      totalPayments,
      totalMeetings,
      recentUsers,
      recentPosts
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.post.count(),
      prisma.payment.count(),
      prisma.meeting.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true
        }
      }),
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          User: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    ])

    const dashboardData = {
      stats: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalPosts,
        totalPayments,
        totalMeetings
      },
      recentUsers,
      recentPosts
    }

    res.json({
      message: 'Dashboard data fetched successfully',
      data: dashboardData
    })
  } catch (error) {
    logger.error('Admin dashboard error', { error })
    next(error)
  }
}

// Get All Users
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const role = req.query.role as string
    const status = req.query.status as string
    const search = req.query.search as string

    const skip = (page - 1) * limit

    const where: any = {}
    if (role) where.role = role
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          verified: true,
          createdAt: true,
          profileImage: true,
          phone: true,
          location: true
        }
      }),
      prisma.user.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    res.json({
      message: 'Users fetched successfully',
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit
        }
      }
    })
  } catch (error) {
    logger.error('Get all users error', { error })
    next(error)
  }
}

// Get User by ID
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        Post: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        TutorRequest: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            Post: {
              select: {
                subject: true,
                Class: true
              }
            }
          }
        },
        RatingBy: {
          orderBy: { ratedAt: 'desc' },
          take: 5
        },
        RatingTo: {
          orderBy: { ratedAt: 'desc' },
          take: 5
        }
      }
    })

    if (!user) {
      return next(new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND))
    }

    const { password: _, ...userData } = user

    res.json({
      message: 'User fetched successfully',
      data: userData
    })
  } catch (error) {
    logger.error('Get user by ID error', { error })
    next(error)
  }
}

// Update User Status
export const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    
    try {
      updateUserStatusSchema.parse(req.body)
    } catch (error) {
      return next(
        new BadRequestException('Invalid status', ErrorCode.INVALID_INPUT)
      )
    }

    const { status } = req.body

    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return next(new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND))
    }

    // Prevent admin from changing their own status
    if (user.role === 'ADMIN' && user.id === req.user?.id) {
      return next(
        new ForbiddenException('Cannot change your own status', ErrorCode.FORBIDDEN)
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true
      }
    })

    logger.info('User status updated', { userId: id, newStatus: status, updatedBy: req.user?.id })

    res.json({
      message: 'User status updated successfully',
      data: updatedUser
    })
  } catch (error) {
    logger.error('Update user status error', { error })
    next(error)
  }
}

// Delete User
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return next(new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND))
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user?.id) {
      return next(
        new ForbiddenException('Cannot delete your own account', ErrorCode.FORBIDDEN)
      )
    }

    // Prevent deleting other admins
    if (user.role === 'ADMIN') {
      return next(
        new ForbiddenException('Cannot delete admin users', ErrorCode.FORBIDDEN)
      )
    }

    await prisma.user.delete({
      where: { id }
    })

    logger.info('User deleted', { userId: id, deletedBy: req.user?.id })

    res.json({
      message: 'User deleted successfully'
    })
  } catch (error) {
    logger.error('Delete user error', { error })
    next(error)
  }
}

// Get Platform Analytics
export const getPlatformAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      userGrowth,
      postGrowth,
      paymentGrowth,
      monthlyRevenue,
      topRatedTeachers,
      mostActiveSubjects
    ] = await Promise.all([
      // User growth
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
        where: {
          createdAt: {
            gte: lastMonth
          }
        }
      }),
      // Post growth
      prisma.post.count({
        where: {
          createdAt: {
            gte: thisMonth
          }
        }
      }),
      // Payment growth
      prisma.payment.count({
        where: {
          createdAt: {
            gte: thisMonth
          }
        }
      }),
      // Monthly revenue
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: thisMonth
          }
        }
      }),
      // Top rated teachers
      prisma.user.findMany({
        where: { role: 'TEACHER' },
        include: {
          RatingTo: {
            select: { rating: true }
          }
        },
        take: 10
      }),
      // Most active subjects
      prisma.post.groupBy({
        by: ['subject'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      })
    ])

    const analytics = {
      userGrowth,
      postGrowth,
      paymentGrowth,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      topRatedTeachers: topRatedTeachers.map(teacher => ({
        ...teacher,
        averageRating: teacher.RatingTo.length > 0 
          ? teacher.RatingTo.reduce((sum, rating) => sum + rating.rating, 0) / teacher.RatingTo.length
          : 0
      })),
      mostActiveSubjects
    }

    res.json({
      message: 'Analytics fetched successfully',
      data: analytics
    })
  } catch (error) {
    logger.error('Get platform analytics error', { error })
    next(error)
  }
}

// Get All Posts
export const getAllPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const subject = req.query.subject as string
    const booked = req.query.booked as string

    const skip = (page - 1) * limit

    const where: any = {}
    if (subject) where.subject = { contains: subject, mode: 'insensitive' }
    if (booked) where.booked = booked === 'true'

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          User: {
            select: {
              name: true,
              email: true
            }
          },
          TutorRequest: {
            select: {
              id: true,
              User: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }),
      prisma.post.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    res.json({
      message: 'Posts fetched successfully',
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit
        }
      }
    })
  } catch (error) {
    logger.error('Get all posts error', { error })
    next(error)
  }
}

// Delete Post
export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const post = await prisma.post.findUnique({
      where: { id }
    })

    if (!post) {
      return next(new NotFoundException('Post not found', ErrorCode.POST_NOT_FOUND))
    }

    await prisma.post.delete({
      where: { id }
    })

    logger.info('Post deleted by admin', { postId: id, deletedBy: req.user?.id })

    res.json({
      message: 'Post deleted successfully'
    })
  } catch (error) {
    logger.error('Delete post error', { error })
    next(error)
  }
}

// Get All Payments
export const getAllPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const status = req.query.status as string

    const skip = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status

    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          User: {
            select: {
              name: true,
              email: true
            }
          },
          Teacher: {
            select: {
              name: true,
              email: true
            }
          },
          Post: {
            select: {
              subject: true,
              Class: true
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    res.json({
      message: 'Payments fetched successfully',
      data: {
        payments,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit
        }
      }
    })
  } catch (error) {
    logger.error('Get all payments error', { error })
    next(error)
  }
}

// Get Reports
export const getReports = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reportType = req.query.type as string
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined

    let reportData: any = {}

    switch (reportType) {
      case 'users':
        reportData = await prisma.user.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true
          }
        })
        break

      case 'payments':
        reportData = await prisma.payment.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            User: {
              select: {
                name: true,
                email: true
              }
            },
            Teacher: {
              select: {
                name: true,
                email: true
              }
            }
          }
        })
        break

      case 'posts':
        reportData = await prisma.post.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            User: {
              select: {
                name: true,
                email: true
              }
            }
          }
        })
        break

      default:
        return next(new BadRequestException('Invalid report type', ErrorCode.INVALID_INPUT))
    }

    res.json({
      message: 'Report generated successfully',
      data: reportData
    })
  } catch (error) {
    logger.error('Get reports error', { error })
    next(error)
  }
}
