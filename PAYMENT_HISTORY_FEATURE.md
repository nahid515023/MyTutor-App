# Payment History Feature

## Overview
The Payment History page allows users to view their transaction history based on their role:
- **Students**: View payments they have made to teachers
- **Teachers**: View payments they have received from students

## Features

### User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Role-based Display**: Shows different information based on user role
- **Search Functionality**: Search by transaction ID, subject, or person name
- **Status Filtering**: Filter transactions by status (All, Completed, Pending, Failed, Cancelled)
- **Real-time Stats**: Shows total earnings/spending, completed payments, and payment method

### Navigation
- Added to main navigation (both desktop and mobile)
- Available as `/payment-history` route
- Accessible from the navigation menu

### Data Display
- **Transaction Details**: Transaction ID, payment method
- **Person Information**: Student/Teacher details with profile images
- **Subject Information**: Course subject, class, and medium
- **Amount**: Formatted currency display
- **Status**: Color-coded badges for different payment statuses
- **Date**: Formatted creation date

### Status Types
- **COMPLETED**: Successfully processed payments (green)
- **PENDING**: Payments in progress (yellow)
- **FAILED**: Failed transactions (red)
- **CANCELLED**: Cancelled transactions (gray)

## API Integration
- Endpoint: `GET /api/payment/history/:userId?role=${userRole}`
- Authentication: Required (uses auth middleware)
- Response: Returns paginated payment history with related user and post data

## Components Used
- Modern UI components (shadcn/ui)
- Responsive tables and cards
- Search and filter controls
- Loading states and error handling

## Usage
1. Navigate to the Payment History page from the main navigation
2. Use search to find specific transactions
3. Filter by status to view specific types of transactions
4. Click refresh to reload the latest data

## File Structure
```
frontend/src/app/(root)/payment-history/page.tsx  # Main payment history page
frontend/src/components/PaymentHistoryButton.tsx   # Reusable button component
frontend/src/components/Nav.tsx                    # Updated navigation with payment history link
```

## Backend Integration
The feature integrates with the existing payment controller's `getPaymentHistory` function, which:
- Fetches payments based on user role
- Includes related User, Teacher, and Post data
- Orders by creation date (newest first)
- Handles authentication and authorization
