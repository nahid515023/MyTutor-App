'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Mail, ArrowLeft, Home } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleResendVerification = async () => {
    try {
      // Implement resend verification logic here
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        alert('Verification email sent! Please check your inbox.')
      } else {
        alert('Failed to send verification email. Please try again.')
      }
    } catch (error) {
      console.error('Error resending verification:', error)
      alert('An error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Email Verification Required
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Please verify your email address to access all features.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {user && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Email: <span className="font-semibold text-gray-900 dark:text-white">{user.email}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Verification Status: <span className="font-semibold text-red-600 dark:text-red-400">Pending</span>
              </p>
            </div>
          )}
          
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>We&apos;ve sent a verification link to your email address.</p>
            <p>Please check your inbox and click the verification link to continue.</p>
          </div>
          
          <Button 
            onClick={handleResendVerification}
            className="w-full"
          >
            <Mail className="w-4 h-4 mr-2" />
            Resend Verification Email
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/home')}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Didn&apos;t receive the email? Check your spam folder or try resending.
            </p>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={logout}
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
