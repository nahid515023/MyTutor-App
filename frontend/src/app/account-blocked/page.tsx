'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Ban, MessageCircle, ArrowLeft } from 'lucide-react'

export default function AccountBlockedPage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <Ban className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Account Blocked
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Your account has been temporarily suspended.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {user && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Account: <span className="font-semibold text-gray-900 dark:text-white">{user.email}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Status: <span className="font-semibold text-red-600 dark:text-red-400">{user.status}</span>
              </p>
            </div>
          )}
          
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>Your account has been suspended due to a violation of our terms of service.</p>
            <p>If you believe this is an error, please contact our support team.</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={logout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
