# MyTutor App 📚

A comprehensive online tutoring platform that connects students with qualified teachers for personalized learning experiences. Built with modern web technologies to provide seamless video calls, secure payments, and effective learning management.

## ✨ Features

### 🎓 Core Learning Features
- **Video Meetings**: High-quality video calls powered by ZegoCloud
- **Real-time Chat**: Instant messaging between students and teachers
- **Meeting Notifications**: Automated email and visual reminders for upcoming sessions
- **Profile Management**: Comprehensive user profiles with skills, education, and bio
- **Rating System**: Mutual rating system for students and teachers

### 💳 Payment & Billing
- **Secure Payments**: Integrated with SSLCommerz payment gateway
- **Payment History**: Complete transaction history for both students and teachers
- **Multiple Payment Methods**: Support for various payment options

### 🔐 Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **Google OAuth**: Social login integration
- **Role-based Access**: Student, Teacher, and Admin roles
- **Email Verification**: Secure account verification process
- **Password Reset**: Secure password recovery system

### 📊 Admin Features
- **Dashboard Analytics**: Comprehensive admin dashboard
- **User Management**: Manage students, teachers, and admin accounts
- **Payment Monitoring**: Track all transactions and payments
- **Security Monitoring**: Rate limiting and security controls

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Google OAuth
- **Real-time Communication**: Socket.io
- **Email Service**: Nodemailer
- **Payment Gateway**: SSLCommerz
- **Task Scheduling**: Node-cron
- **Validation**: Zod schema validation

### Frontend
- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: 
  - Chakra UI
  - Material-UI (MUI)
  - NextUI
  - Radix UI primitives
- **Video Calls**: ZegoCloud UIKit
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **State Management**: React hooks

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/nahid515023/MyTutor-App.git
   cd MyTutor-App/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/mytutor_db"
   JWT_SECRET="your-super-secret-jwt-key"
   SESSION_SECRET="your-super-secret-session-key"
   PORT=3001
   EMAIL="your-email@gmail.com"
   EMAIL_PASSWORD="your-app-password"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   CLIENT_URL="http://localhost:3000"
   STORE_ID="your-ssl-commerz-store-id"
   STORE_PASSWORD="your-ssl-commerz-password"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run migrate
   
   # (Optional) Open Prisma Studio
   npm run db:studio
   ```

5. **Create Admin User**
   ```bash
   npm run create-admin
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   NEXT_PUBLIC_ZEGO_APP_ID=your-zego-app-id
   NEXT_PUBLIC_ZEGO_SERVER_SECRET=your-zego-server-secret
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
MyTutor-App/
├── backend/
│   ├── src/
│   │   ├── controllers/      # API route handlers
│   │   ├── routes/          # Express routes
│   │   ├── middlewares/     # Custom middleware
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration files
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── tests/               # Test files
│   └── uploads/             # File uploads
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js app directory
│   │   ├── components/      # Reusable components
│   │   └── lib/             # Utility libraries
│   ├── public/              # Static assets
│   └── styles/              # Global styles
└── docs/                    # Documentation files
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/google` - Google OAuth login

### User Management
- `GET /api/profile/:id` - Get user profile
- `PUT /api/profile/:id` - Update user profile
- `POST /api/profile/upload` - Upload profile image

### Meetings
- `GET /api/meeting/:userId` - Get user meetings
- `POST /api/meeting` - Create new meeting
- `GET /api/meeting/upcoming/:userId` - Get upcoming meetings
- `POST /api/meeting/send-notifications` - Send meeting notifications

### Payments
- `POST /api/payment/create` - Create payment
- `GET /api/payment/history/:userId` - Get payment history
- `POST /api/payment/verify` - Verify payment

### Chat
- `GET /api/chat/:userId` - Get user chats
- `POST /api/chat/send` - Send message

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment variables
2. Update `DATABASE_URL` for production database
3. Configure email service for production
4. Set up SSL certificates
5. Deploy to your preferred hosting service (Heroku, AWS, DigitalOcean, etc.)

### Frontend Deployment
1. Build the application:
   ```bash
   npm run build
   ```
2. Deploy to Vercel, Netlify, or your preferred hosting service
3. Update environment variables for production

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm run lint
```

## 📊 Scripts

### Backend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run create-admin` - Create admin user
- `npm test` - Run tests

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run analyze` - Analyze bundle size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Nahid** - *Initial work* - [nahid515023](https://github.com/nahid515023)

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](docs/)
2. Create an [issue](https://github.com/nahid515023/MyTutor-App/issues)
3. Contact the development team

## 🔄 Changelog

### Recent Updates
- ✅ Meeting notification system with email and visual alerts
- ✅ Payment history tracking for students and teachers
- ✅ Memory optimization for better performance
- ✅ Enhanced security with rate limiting and authentication

---

**Made with ❤️ for the education community**