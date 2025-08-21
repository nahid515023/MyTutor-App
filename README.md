# 🎓 MyTutor App – Complete Tutoring Platform

A comprehensive full-stack tutoring platform connecting students with teachers. Built with modern technologies, featuring real-time chat, video meetings, secure payments, and comprehensive admin management.

## 🚀 Features

### 👥 User Management
- **Multi-role Authentication**: Student, Teacher, Admin roles
- **Email & Google OAuth**: Multiple sign-in options
- **Profile Management**: Detailed profiles with skills, education, bio
- **Account Verification**: Email verification system
- **Password Recovery**: Secure password reset flow

### 📚 Tutoring System
- **Post Creation**: Students create tutoring requests
- **Tutor Applications**: Teachers apply to requests
- **Subject & Grade Filtering**: Organized by subjects and academic levels
- **Booking System**: Complete booking workflow
- **Fee Management**: Transparent pricing system

### 💬 Real-time Communication
- **Live Chat**: Socket.IO powered messaging
- **Message Status**: Delivery and read receipts
- **Typing Indicators**: Real-time typing status
- **Message History**: Persistent chat history
- **File Sharing**: Image and document sharing

### 🎥 Video Meetings
- **Meeting Scheduling**: Integrated calendar system
- **Video Conferencing**: ZEGO cloud integration
- **Meeting Reminders**: Automated notifications
- **Session Management**: Complete meeting lifecycle

### 💳 Payment Integration
- **SSLCommerz Gateway**: Secure payment processing
- **Multiple Payment Methods**: Cards, mobile banking, etc.
- **Transaction Tracking**: Complete payment history
- **Automated Billing**: Seamless payment flow

### ⭐ Rating & Review System
- **Post-Meeting Reviews**: Rate tutoring sessions
- **Teacher Ratings**: Comprehensive rating system
- **Review Management**: Moderated review system

### 🔔 Notification System
- **Real-time Notifications**: Instant updates
- **Email Notifications**: Important alerts via email
- **Push Notifications**: Browser notifications
- **Notification History**: Persistent notification log

### 🛡️ Admin Dashboard
- **User Management**: Comprehensive user administration
- **Content Moderation**: Review and moderate content
- **Analytics Dashboard**: Detailed platform statistics
- **Payment Monitoring**: Transaction oversight

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Passport.js + JWT + Sessions
- **Real-time**: Socket.IO
- **Validation**: Zod schemas
- **Logging**: Winston logger
- **Security**: Rate limiting, CORS, sanitization
- **Payments**: SSLCommerz integration
- **Email**: Nodemailer
- **File Upload**: Multer

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Chakra UI, MUI, NextUI, Radix UI
- **State Management**: React Hooks
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Video**: ZEGO UIKit
- **Icons**: React Icons, FontAwesome

## 📁 Project Structure

```
MyTutor-App/
├── backend/                 # Backend API Server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Custom middleware
│   │   ├── services/        # Business logic
│   │   ├── config/          # Configuration files
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript definitions
│   │   ├── schema/          # Validation schemas
│   │   └── exceptions/      # Custom error classes
│   ├── prisma/              # Database schema & migrations
│   ├── uploads/             # File upload directory
│   ├── logs/                # Application logs
│   ├── tests/               # Test files
│   └── docs/                # Documentation
├── frontend/                # Next.js Frontend
│   ├── src/
│   │   ├── app/             # Next.js app directory
│   │   ├── components/      # React components
│   │   ├── lib/             # Utility libraries
│   │   ├── hooks/           # Custom React hooks
│   │   └── types/           # TypeScript definitions
│   └── public/              # Static assets
└── README.md               # Project documentation
```

## 🚦 Prerequisites

- **Node.js**: Version 18+ 
- **npm**: Latest version
- **PostgreSQL**: Version 14+ (local or cloud)
- **Git**: For version control

## ⚡ Quick Start

### 1️⃣ Clone Repository

```bash
git clone https://github.com/nahid515023/MyTutor-App.git
cd MyTutor-App
```

### 2️⃣ Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npx prisma generate

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

The backend will be available at `http://localhost:3001`

### 3️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## ⚙️ Environment Configuration

### Backend Environment Variables (`backend/.env`)

Copy `backend/.env.example` and configure the following:

#### 🔐 Required Variables
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mytutor_db"

# Security
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
SESSION_SECRET="your-super-secret-session-key-change-this-in-production"

# Server
PORT=3001
NODE_ENV=development

# Frontend URLs (for CORS)
CLIENT_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:3000"
```

#### 📧 Email Configuration (Optional)
```env
EMAIL="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
```

#### 🔑 Google OAuth (Optional)
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### 💳 Payment Gateway (Optional)
```env
STORE_ID="your-store-id"
STORE_PASSWORD="your-store-password"
```

#### 🛡️ Security Settings (Optional)
```env
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=3600000
PASSWORD_MIN_LENGTH=8
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables (`frontend/.env.local`)

```env
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_API_URL_IMAGE="http://localhost:3001"

# Google OAuth (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
```

## 🗄️ Database Management

### Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (development)
npm run migrate

# Reset database (development only)
npm run migrate:reset

# Deploy migrations (production)
npm run migrate:deploy

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Student, Teacher, Admin roles
- **Posts**: Tutoring requests from students
- **TutorRequests**: Applications from teachers
- **Chat**: Real-time messaging system
- **Meetings**: Video call scheduling
- **Payments**: Transaction records
- **Ratings**: Review and rating system
- **Notifications**: System notifications

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /verify-email` - Email verification
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset
- `GET /google` - Google OAuth login
- `GET /me` - Get current user

### Profile Management (`/api/profile`)
- `GET /` - Get user profile
- `PUT /` - Update profile
- `POST /upload-avatar` - Upload profile image
- `POST /upload-cover` - Upload cover image
- `GET /public/:id` - Get public profile

### Posts & Requests (`/api/posts`)
- `GET /` - Get all posts
- `POST /` - Create new post
- `GET /:id` - Get specific post
- `PUT /:id` - Update post
- `DELETE /:id` - Delete post
- `POST /:id/request` - Apply as tutor
- `GET /:id/requests` - Get post applications

### Chat System (`/api/chat`)
- `GET /conversations` - Get user conversations
- `GET /:id/messages` - Get conversation messages
- `POST /send` - Send message
- `DELETE /:id` - Delete message
- `PUT /:id/read` - Mark as read

### Meetings (`/api/meeting`)
- `GET /` - Get user meetings
- `POST /` - Schedule new meeting
- `PUT /:id` - Update meeting
- `DELETE /:id` - Cancel meeting
- `GET /:id/join` - Get meeting join link

### Payments (`/api/payment`)
- `POST /initiate` - Initiate payment
- `POST /callback` - Payment callback
- `GET /history` - Payment history
- `GET /:id` - Get payment details

### Ratings (`/api/rating`)
- `POST /` - Submit rating
- `GET /user/:id` - Get user ratings
- `GET /post/:id` - Get post ratings
- `PUT /:id` - Update rating

### Dashboard (`/api/dashboard`)
- `GET /stats` - Get dashboard statistics
- `GET /recent-activity` - Recent activities
- `GET /earnings` - Earnings overview

### Admin (`/api/admin`)
- `GET /users` - Manage users
- `GET /posts` - Manage posts
- `GET /payments` - Monitor payments
- `GET /reports` - System reports

## 🔧 Available Scripts

### Backend Scripts

```bash
# Development
npm run dev            # Start development server with nodemon
npm run build          # Build TypeScript to JavaScript
npm start              # Start production server

# Database
npm run migrate        # Run database migrations
npm run migrate:reset  # Reset database (development only)
npm run migrate:deploy # Deploy migrations (production)
npm run db:generate    # Generate Prisma client
npm run db:studio      # Open Prisma Studio

# Utilities
npm run create-admin   # Create admin user
npm test               # Run tests
npm run security:check # Run security audit
npm run logs:view      # View application logs
npm run logs:errors    # View error logs
```

### Frontend Scripts

```bash
# Development
npm run dev     # Start Next.js development server
npm run build   # Build for production
npm start       # Start production server

# Code Quality
npm run lint    # Run ESLint
npm run analyze # Analyze bundle size

# Utilities
npm run clean   # Clean build cache
```

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure authentication
- **Session Management**: Server-side sessions
- **Role-based Access**: Student/Teacher/Admin roles
- **OAuth Integration**: Google OAuth support

### Data Protection
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: Input sanitization
- **CSRF Protection**: CORS configuration

### Rate Limiting
- **Global Rate Limiting**: 1000 requests per 15 minutes
- **Auth Rate Limiting**: 5 login attempts per 15 minutes
- **Signup Rate Limiting**: 3 attempts per hour
- **Account Lockout**: Progressive lockout system

### Security Headers
- **Content Security Policy**: XSS protection
- **HSTS**: HTTPS enforcement
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME sniffing protection

## 🌐 Socket.IO Real-time Features

### Connection Management
- **User Online Status**: Track online users
- **Conversation Rooms**: Join/leave chat rooms
- **Automatic Reconnection**: Handle connection drops

### Messaging System
- **Real-time Messages**: Instant message delivery
- **Message Status**: Sent, delivered, read indicators
- **Typing Indicators**: Show when users are typing
- **Message Deletion**: Real-time message removal
- **File Sharing**: Image and document sharing

### Event Handling
```javascript
// Client-side events
socket.emit('joinConversation', conversationId)
socket.emit('sendMessage', messageData)
socket.emit('typing', { conversationId, isTyping: true })
socket.emit('markAsRead', { messageIds, conversationId })

// Server-side events
socket.on('newMessage', handleNewMessage)
socket.on('messageStatus', handleMessageStatus)
socket.on('userTyping', handleTypingStatus)
socket.on('onlineUsers', handleOnlineUsers)
```

## 🚀 Deployment

### Production Environment Setup

1. **Backend Deployment**

```bash
# Clone repository
git clone https://github.com/nahid515023/MyTutor-App.git
cd MyTutor-App/backend

# Install dependencies
npm ci

# Set up production environment
cp .env.example .env
# Configure production values

# Build application
npm run build

# Run database migrations
npm run migrate:deploy

# Start production server
npm start
```

2. **Frontend Deployment**

```bash
cd frontend

# Install dependencies
npm ci

# Set up production environment
cp .env.local.example .env.local
# Configure production values

# Build application
npm run build

# Start production server
npm start
```

### Environment-specific Configurations

#### Development
- CORS: Permissive for localhost
- Logging: Detailed debug information
- Security: Relaxed for development
- Database: Local PostgreSQL

#### Production
- CORS: Strict origin validation
- Logging: Error and warning levels
- Security: Full security headers
- Database: Managed PostgreSQL service

### Known Deployment Platforms
- **Backend**: `mytutor-backend.onrender.com`
- **Frontend**: `mytutor-frontend.onrender.com`, `mytutor-mx8r.onrender.com`

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run test suite
npm test

# Run specific test file
npx ts-node tests/auth.test.ts

# Security audit
npm run security:check
```

### Frontend Testing

```bash
cd frontend

# Lint code
npm run lint

# Type checking
npx tsc --noEmit
```

## 🛠️ Development Tools

### Recommended VS Code Extensions
- **Prisma**: Database schema management
- **TypeScript**: Enhanced TypeScript support
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Thunder Client**: API testing
- **GitLens**: Git integration

### Database Management
- **Prisma Studio**: Visual database browser
- **pgAdmin**: PostgreSQL administration
- **DBeaver**: Universal database tool

### API Testing
- **Postman**: API development and testing
- **Thunder Client**: VS Code extension
- **cURL**: Command-line testing

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Verify DATABASE_URL format
postgresql://username:password@localhost:5432/database_name

# Test connection
npx prisma db pull
```

#### Environment Variable Issues
```bash
# Backend: Missing required variables
cp .env.example .env
# Fill in required values

# Frontend: API connection issues
# Verify NEXT_PUBLIC_API_URL matches backend URL
```

#### CORS Issues
```bash
# Development: Ensure localhost URLs match
CLIENT_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:3000"

# Production: Match deployed frontend domains
CLIENT_URL="https://your-frontend-domain.com"
```

#### Port Conflicts
```bash
# Backend default: 3001
# Frontend default: 3000
# Change PORT in .env if needed
```

#### File Upload Issues
```bash
# Check uploads directory permissions
chmod 755 backend/uploads

# Verify file size limits in .env
MAX_FILE_SIZE=5242880  # 5MB
```

### Debug Mode

```bash
# Backend: Enable debug logging
LOG_LEVEL=debug npm run dev

# Frontend: Enable verbose logging
npm run dev -- --verbose
```

### Health Checks

```bash
# Backend health check
curl http://localhost:3001/health

# Database connection test
curl http://localhost:3001/api/auth/me
```

## 📚 Additional Resources

### Documentation
- [Backend API Documentation](./backend/docs/)
- [Error Handling Guide](./backend/docs/error-handling.md)
- [Prisma Schema](./backend/prisma/schema.prisma)

### External Dependencies
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.IO Documentation](https://socket.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the ISC License. See individual package.json files for specific licensing information.

## 👥 Authors

- **Nahid** - [@nahid515023](https://github.com/nahid515023)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- Socket.IO for real-time capabilities
- All the open-source contributors
