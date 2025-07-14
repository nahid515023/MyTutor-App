import { prisma } from '../index'
import { createLogger } from '../services/logger'

const logger = createLogger('ownership-utils')

/**
 * Check if a user owns a specific post
 */
export async function checkPostOwnership(userId: string, postId: string): Promise<boolean> {
  try {
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        userId: userId
      }
    })
    return !!post
  } catch (error) {
    logger.error('Error checking post ownership:', error)
    return false
  }
}

/**
 * Check if a user owns a specific meeting
 */
export async function checkMeetingOwnership(userId: string, meetingId: string): Promise<boolean> {
  try {
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        OR: [
          { teacherId: userId },
          { userId: userId }
        ]
      }
    })
    return !!meeting
  } catch (error) {
    logger.error('Error checking meeting ownership:', error)
    return false
  }
}

/**
 * Check if a user owns a specific payment record
 */
export async function checkPaymentOwnership(userId: string, paymentId: string): Promise<boolean> {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        OR: [
          { userId: userId },
          { teacherId: userId }
        ]
      }
    })
    return !!payment
  } catch (error) {
    logger.error('Error checking payment ownership:', error)
    return false
  }
}

/**
 * Check if a user owns a specific rating
 */
export async function checkRatingOwnership(userId: string, ratingId: string): Promise<boolean> {
  try {
    const rating = await prisma.rating.findFirst({
      where: {
        id: ratingId,
        ratingBy: userId
      }
    })
    return !!rating
  } catch (error) {
    logger.error('Error checking rating ownership:', error)
    return false
  }
}

/**
 * Check if a user is involved in a tutor request (either as the post owner or the requesting tutor)
 */
export async function checkTutorRequestInvolvement(userId: string, postId: string): Promise<boolean> {
  try {
    // Check if user owns the post OR has made a tutor request for this post
    const post = await prisma.post.findFirst({
      where: { id: postId },
      include: {
        TutorRequest: {
          where: { userId }
        }
      }
    })
    
    if (!post) return false
    
    // User owns the post OR user has made a tutor request
    return post.userId === userId || post.TutorRequest.length > 0
  } catch (error) {
    logger.error('Error checking tutor request involvement:', error)
    return false
  }
}

/**
 * Generic ownership checker - checks if user has any relationship to a resource
 */
export async function checkResourceAccess(
  userId: string, 
  resourceType: 'post' | 'meeting' | 'payment' | 'rating', 
  resourceId: string
): Promise<boolean> {
  switch (resourceType) {
    case 'post':
      return checkPostOwnership(userId, resourceId)
    case 'meeting':
      return checkMeetingOwnership(userId, resourceId)
    case 'payment':
      return checkPaymentOwnership(userId, resourceId)
    case 'rating':
      return checkRatingOwnership(userId, resourceId)
    default:
      return false
  }
}

/**
 * Check if user can moderate content (is teacher or admin)
 */
export function canModerateContent(userRole: string): boolean {
  return ['TEACHER', 'ADMIN'].includes(userRole)
}

/**
 * Check if user can access admin features
 */
export function canAccessAdmin(userRole: string): boolean {
  return userRole === 'ADMIN'
}

/**
 * Check if user can create posts (students only)
 */
export function canCreatePosts(userRole: string): boolean {
  return userRole === 'STUDENT'
}

/**
 * Check if user can apply for tutor positions (teachers only)
 */
export function canApplyForTutoring(userRole: string): boolean {
  return userRole === 'TEACHER'
}
