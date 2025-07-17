# Meeting Notification System

This system provides automated notifications for meetings that are starting within 30 minutes, including both visual indicators on the frontend and email notifications to both tutors and students.

## Features

### 🔔 Visual Notifications (Frontend)
- **Real-time banners**: A notification banner appears at the top of the meeting page when meetings are starting within 30 minutes
- **Meeting card highlights**: Upcoming meetings within 30 minutes are highlighted with:
  - Orange/red gradient background with pulse animation
  - Notification bell icon with bounce animation
  - Time countdown badge showing minutes until meeting
  - Enhanced styling for meeting links
- **Toast notifications**: Pop-up toast messages appear when meetings are detected within 30 minutes
- **Auto-refresh**: The system checks for upcoming meetings every minute

### 📧 Email Notifications (Backend)
- **Beautiful HTML emails**: Rich, styled email templates with meeting details
- **Dual delivery**: Emails are sent to both the student and teacher
- **Automated scheduling**: Background service runs every 5 minutes to check for upcoming meetings
- **Professional formatting**: Includes meeting title, time, link, and branding

## Technical Implementation

### Backend Components

#### 1. Meeting Notification Service (`/backend/src/services/meetingNotification.ts`)
- **Automated scheduler**: Uses `node-cron` to run checks every 5 minutes
- **Email delivery**: Sends rich HTML and plain text emails
- **Error handling**: Graceful error handling for individual email failures
- **Manual trigger**: Supports immediate notification sending via API

#### 2. Enhanced Meeting Controller (`/backend/src/controllers/meeting.ts`)
- `checkUpcomingMeetings`: Returns meetings starting within 30 minutes for a specific user
- `sendMeetingNotifications`: Manually triggers notification sending

#### 3. New API Endpoints (`/backend/src/routes/meeting.ts`)
- `GET /meeting/upcoming/:userId` - Get upcoming meetings for a user
- `POST /meeting/send-notifications` - Manually send notifications

### Frontend Components

#### 1. Enhanced Meeting Page (`/frontend/src/app/(root)/meeting/page.tsx`)
- **Real-time checking**: Checks for upcoming meetings every minute
- **Visual indicators**: Dynamic styling and animations for urgent meetings
- **Notification banner**: Top-of-page alert for immediate attention
- **Toast integration**: Uses existing toast service for notifications

## Usage

### Automatic Operation
The system runs automatically once the backend server starts:
1. Background scheduler checks every 5 minutes for meetings starting within 30 minutes
2. Frontend checks every minute and displays visual indicators
3. Emails are sent automatically to both participants

### Manual Operation
You can also trigger notifications manually:
```bash
# Via API endpoint
POST /api/meeting/send-notifications
```

### Configuration
The notification timing can be adjusted by modifying:
- **30-minute threshold**: Change the time calculation in both frontend and backend
- **Check frequency**: Modify the cron schedule (`*/5 * * * *`) in the notification service
- **Frontend refresh**: Adjust the `setInterval` duration (currently 60000ms = 1 minute)

## Email Template Features
- **Responsive design**: Works on desktop and mobile
- **Professional branding**: MyTutor branded template
- **Meeting details**: Complete meeting information
- **Direct link**: One-click join button for online meetings
- **Accessibility**: Proper alt text and semantic HTML

## Error Handling
- Individual email failures don't stop the entire notification process
- Comprehensive logging for debugging
- Graceful degradation if notification service fails
- Frontend continues to work even if backend notifications fail

## Dependencies
- `node-cron`: For scheduled background tasks
- `nodemailer`: For email sending (already installed)
- React hooks: `useState`, `useEffect`, `useCallback` for frontend state management

## Future Enhancements
- [ ] Push notifications for mobile app
- [ ] SMS notifications option
- [ ] Customizable notification timing
- [ ] Meeting reminder history
- [ ] Notification preferences per user
- [ ] Multiple reminder intervals (1 hour, 30 min, 5 min)
