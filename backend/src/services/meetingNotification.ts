import cron from 'node-cron'
import { prisma } from '../index'
import EmailService from './email'

class MeetingNotificationService {
  private isRunning = false

  constructor() {
    this.startScheduler()
  }

  private startScheduler() {
    // Run every 5 minutes to check for upcoming meetings
    cron.schedule('*/5 * * * *', async () => {
      if (this.isRunning) return
      
      this.isRunning = true
      try {
        await this.checkAndSendNotifications()
      } catch (error) {
        console.error('Error in meeting notification scheduler:', error)
      } finally {
        this.isRunning = false
      }
    })

    console.log('Meeting notification scheduler started - runs every 5 minutes')
  }

  private async checkAndSendNotifications() {
    try {
      const now = new Date()
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000)

      // Find all meetings starting within 30 minutes that haven't been notified yet
      const upcomingMeetings = await prisma.meeting.findMany({
        where: {
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

      for (const meeting of upcomingMeetings) {
        await this.sendMeetingNotification(meeting)
      }

      if (upcomingMeetings.length > 0) {
        console.log(`Sent notifications for ${upcomingMeetings.length} upcoming meetings`)
      }
    } catch (error) {
      console.error('Error checking upcoming meetings:', error)
    }
  }

  private async sendMeetingNotification(meeting: any) {
    try {
      const meetingTime = new Date(meeting.start)
      const now = new Date()
      const minutesUntilMeeting = Math.floor((meetingTime.getTime() - now.getTime()) / (1000 * 60))
      
      const subject = `Meeting Reminder: ${meeting.title}`
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 28px;">🔔 Meeting Reminder</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your meeting is starting soon!</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="border-left: 4px solid #667eea; padding-left: 20px; margin-bottom: 25px;">
              <h2 style="color: #333; margin: 0 0 10px 0; font-size: 24px;">${meeting.title}</h2>
              <p style="color: #666; margin: 0; font-size: 16px;">Starting in ${minutesUntilMeeting} minutes</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151; font-size: 18px;">📅 Meeting Details:</h3>
              <div style="line-height: 1.6; color: #555;">
                <p style="margin: 8px 0;"><strong>📍 Title:</strong> ${meeting.title}</p>
                <p style="margin: 8px 0;"><strong>🕐 Start Time:</strong> ${meetingTime.toLocaleString()}</p>
                <p style="margin: 8px 0;"><strong>🕑 End Time:</strong> ${new Date(meeting.end).toLocaleString()}</p>
                ${meeting.link ? `
                  <p style="margin: 8px 0;"><strong>🔗 Meeting Link:</strong></p>
                  <a href="${meeting.link}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 5px;">Join Meeting Now</a>
                ` : ''}
              </div>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-weight: 500;">
                ⚠️ <strong>Important:</strong> Please make sure you're ready to join the meeting on time. We recommend joining 2-3 minutes early.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">Best regards,</p>
            <p style="margin: 5px 0 0 0; font-weight: bold; color: #667eea;">MyTutor Team</p>
            <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.7;">
              This is an automated reminder. Please don't reply to this email.
            </p>
          </div>
        </div>
      `

      const plainTextContent = `
Meeting Reminder: ${meeting.title}

Your meeting "${meeting.title}" is starting in ${minutesUntilMeeting} minutes.

Meeting Details:
- Title: ${meeting.title}
- Start Time: ${meetingTime.toLocaleString()}
- End Time: ${new Date(meeting.end).toLocaleString()}
${meeting.link ? `- Meeting Link: ${meeting.link}` : ''}

Please make sure you're ready to join the meeting on time.

Best regards,
MyTutor Team
      `

      // Send email to student
      try {
        await EmailService.sendEmail(
          meeting.User.email,
          subject,
          plainTextContent,
          emailContent
        )
        console.log(`Notification sent to student: ${meeting.User.email}`)
      } catch (emailError) {
        console.error(`Failed to send email to student ${meeting.User.email}:`, emailError)
      }

      // Send email to teacher
      try {
        await EmailService.sendEmail(
          meeting.Teacher.email,
          subject,
          plainTextContent,
          emailContent
        )
        console.log(`Notification sent to teacher: ${meeting.Teacher.email}`)
      } catch (emailError) {
        console.error(`Failed to send email to teacher ${meeting.Teacher.email}:`, emailError)
      }
    } catch (error) {
      console.error('Error sending meeting notification:', error)
    }
  }

  public async sendImmediateNotifications(): Promise<{ meetingsNotified: number }> {
    try {
      const now = new Date()
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000)

      const upcomingMeetings = await prisma.meeting.findMany({
        where: {
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

      for (const meeting of upcomingMeetings) {
        await this.sendMeetingNotification(meeting)
      }

      return { meetingsNotified: upcomingMeetings.length }
    } catch (error) {
      console.error('Error sending immediate notifications:', error)
      throw error
    }
  }
}

export default new MeetingNotificationService()
