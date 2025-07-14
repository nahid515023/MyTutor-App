'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGoogleLogin } from '@react-oauth/google'
import { Button } from '@/components/ui/button'
import { FcGoogle } from 'react-icons/fc'
import { showToast } from '@/utils/toastService'

interface GoogleAuthProps {
  role?: 'STUDENT' | 'TEACHER'
}

export default function GoogleAuth({ role = 'STUDENT' }: GoogleAuthProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setIsLoading(true)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            token: response.access_token,
            role 
          }),
          credentials: 'include',
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || 'Authentication failed')
        }

        showToast('success','Successfully logged in with Google!')
        router.push('/home')
        router.refresh()
      } catch (error) {
        showToast('error',error instanceof Error ? error.message : 'Authentication failed')
      } finally {
        setIsLoading(false)
      }
    },
    onError: () => {
      showToast('error','Google authentication failed')
      setIsLoading(false)
    },
  })

  return (
    <Button
      variant="outline"
      type="button"
      className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={() => login()}
      disabled={isLoading}
    >
      <FcGoogle className="mr-2 h-5 w-5" />
      <span className="flex-1">{isLoading ? 'Please wait...' : 'Continue with Google'}</span>
    </Button>
  )
} 