'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldX, ArrowLeft, Home } from 'lucide-react'

export default function UnauthorizedPage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Access Denied
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            You don&apos;t have permission to access this page.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {user && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current Role: <span className="font-semibold text-gray-900 dark:text-white">{user.role}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Account Status: <span className="font-semibold text-gray-900 dark:text-white">{user.status}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Verified: <span className="font-semibold text-gray-900 dark:text-white">
                  {user.verified ? 'Yes' : 'No'}
                </span>
              </p>
            </div>
          )}
          
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
              onClick={() => router.push('/home')}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
          
          {user && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                If you believe this is an error, please contact support or try logging in with a different account.
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={logout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900"
              >
                Switch Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
