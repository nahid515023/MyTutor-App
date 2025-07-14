'use client'

import { api } from '@/_lib/api'
import { showToast } from '@/utils/toastService'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FooterPage } from '@/components/FooterPage'
import Navbar from '@/components/Navbar'

// eslint-disable-next-line @next/next/no-async-client-component
export default function PasswordReset ({
  params
}: {
  params: { slug: string[] }
}) {
  const [userId, setUserId] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)

  // Fetch reset token and user ID from params
  useEffect(() => {
    try {
      const slug = params.slug
      if (slug?.length === 2) {
        setResetToken(slug[0])
        setUserId(slug[1])
      } else {
        showToast(
          'error',
          'Invalid or missing reset token. Please check your email for the correct link.'
        )
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      showToast(
        'error',
        'Failed to process reset link. Please try again or request a new one.'
      )
    }
  }, [params.slug]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm-password') as string

    // Input validation
    if (password !== confirmPassword) {
      showToast(
        'warning',
        'Passwords do not match. Please double-check and try again.'
      )
      confirmPasswordRef.current?.focus()
      setLoading(false)
      return
    }

    if (password.length < 8) {
      showToast('error', 'Your password must be at least 8 characters long.')
      passwordRef.current?.focus()
      setLoading(false)
      return
    }

    try {
      // API call to reset password
      const response = await api.post(
        `/auth/reset-password/${resetToken}/${userId}`,
        { password }
      )
      const data = response.data as { success: boolean; message: string }

      if (data.success) {
        router.push('/signin')
        showToast(
          'success',
          'Your password has been successfully reset. You can now log in with your new password.'
        )
      } else {
        showToast(
          'error',
          'Password reset failed. Please try again or request a new reset link.'
        )
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.status === 400) {
        showToast(
          'error',
          'This link is invalid or expired. Please request a new reset link.'
        )
      } else {
        showToast(
          'error',
          'An error occurred while resetting your password. Please try again later.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  // UI Rendering
  return (
    <>
    <Navbar/>
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50  py-12 px-4 sm:px-6 lg:px-8'>
      <div className='flex flex-col items-center justify-center w-full max-w-md space-y-8'>
        <div className='w-full bg-white rounded-xl shadow-2xl p-8 space-y-8 transition-all duration-300 hover:shadow-xl'>
          <div className="text-center space-y-4">
            <div className="inline-block p-3 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 mb-2">
              <svg 
                className="w-8 h-8 text-blue-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h2 className='text-3xl font-bold text-gray-900 text-center transition-colors duration-300'>
              Reset Your Password
            </h2>
            <p className="text-gray-600 max-w-sm mx-auto">
              Enter your new password below. Make sure it&apos;s secure and easy to remember.
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6 mt-8' method='POST'>
            <div className='space-y-6'>
              <div className='transition-all duration-300 hover:transform hover:translate-y-[-2px]'>
                <label
                  htmlFor='password'
                  className='block text-sm font-semibold text-gray-700 mb-2'
                >
                  New Password
                </label>
                <input
                  type='password'
                  name='password'
                  id='password'
                  ref={passwordRef}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-300 placeholder-gray-400
                           hover:border-blue-400'
                  required
                  placeholder='Enter your new password'
                />
              </div>
              <div className='transition-all duration-300 hover:transform hover:translate-y-[-2px]'>
                <label
                  htmlFor='confirm-password'
                  className='block text-sm font-semibold text-gray-700 mb-2'
                >
                  Confirm Password
                </label>
                <input
                  type='password'
                  name='confirm-password'
                  id='confirm-password'
                  ref={confirmPasswordRef}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-300 placeholder-gray-400
                           hover:border-blue-400'
                  required
                  placeholder='Confirm your new password'
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className={`w-full px-6 py-3.5 text-white rounded-lg shadow-md font-semibold
                         transition-all duration-300 transform hover:translate-y-[-2px]
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                         ${
                           loading
                             ? 'bg-blue-400 cursor-not-allowed opacity-75'
                             : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                         }`}
            >
              {loading ? (
                <span className='flex items-center justify-center'>
                  <svg className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <div className='mt-6 text-center text-sm'>
            <p className='text-gray-600'>
              Need a new reset link?{' '}
              <Link 
                href='/forgot-password' 
                className='text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300 underline hover:no-underline'
              >
                Request here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    <FooterPage/>
    </>
  )
}
