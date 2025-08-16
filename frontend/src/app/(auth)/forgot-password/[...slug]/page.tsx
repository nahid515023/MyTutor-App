'use client'

import { api } from '@/_lib/api'
import { showToast } from '@/utils/toastService'
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
        router.push('/')
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
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    id='password'
                    ref={passwordRef}
                    className='w-full px-4 pr-12 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-all duration-300 placeholder-gray-400
                             hover:border-blue-400'
                    required
                    placeholder='Enter your new password'
                  />
                  <button
                    type='button'
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(p => !p)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition-all duration-200 p-1'
                  >
                  {showPassword ? (
                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className='w-5 h-5'>
                      <path d='M3.53 2.47a.75.75 0 10-1.06 1.06l2.028 2.028A12.43 12.43 0 001.5 12s3.75 7.5 10.5 7.5a10.94 10.94 0 005.442-1.456l2.028 2.028a.75.75 0 101.06-1.06l-18-18zM12 6.75c1.11 0 2.136.365 2.963.983l-1.093 1.093A3.75 3.75 0 008.82 13.87l-1.1 1.1A6.8 6.8 0 015.4 12c.638-1.12 2.966-5.25 6.6-5.25z' />
                      <path d='M14.53 10.03l-4.5 4.5A3.75 3.75 0 0014.53 10.03z' />
                    </svg>
                  ) : (
                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className='w-5 h-5'>
                      <path d='M12 4.5C5.25 4.5 1.5 12 1.5 12s3.75 7.5 10.5 7.5S22.5 12 22.5 12 18.75 4.5 12 4.5zm0 12a4.5 4.5 0 110-9 4.5 4.5 0 010 9z' />
                    </svg>
                  )}
                </button>
                </div>
              </div>
              <div className='transition-all duration-300 hover:transform hover:translate-y-[-2px]'>
                <label
                  htmlFor='confirm-password'
                  className='block text-sm font-semibold text-gray-700 mb-2'
                >
                  Confirm Password
                </label>
                <div className='relative'>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name='confirm-password'
                    id='confirm-password'
                    ref={confirmPasswordRef}
                    className='w-full px-4 pr-12 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-all duration-300 placeholder-gray-400
                             hover:border-blue-400'
                    required
                    placeholder='Confirm your new password'
                  />
                  <button
                    type='button'
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    onClick={() => setShowConfirmPassword(p => !p)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition-all duration-200 p-1'
                  >
                  {showConfirmPassword ? (
                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className='w-5 h-5'>
                      <path d='M3.53 2.47a.75.75 0 10-1.06 1.06l2.028 2.028A12.43 12.43 0 001.5 12s3.75 7.5 10.5 7.5a10.94 10.94 0 005.442-1.456l2.028 2.028a.75.75 0 101.06-1.06l-18-18zM12 6.75c1.11 0 2.136.365 2.963.983l-1.093 1.093A3.75 3.75 0 008.82 13.87l-1.1 1.1A6.8 6.8 0 015.4 12c.638-1.12 2.966-5.25 6.6-5.25z' />
                      <path d='M14.53 10.03l-4.5 4.5A3.75 3.75 0 0014.53 10.03z' />
                    </svg>
                  ) : (
                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className='w-5 h-5'>
                      <path d='M12 4.5C5.25 4.5 1.5 12 1.5 12s3.75 7.5 10.5 7.5S22.5 12 22.5 12 18.75 4.5 12 4.5zm0 12a4.5 4.5 0 110-9 4.5 4.5 0 010 9z' />
                    </svg>
                  )}
                </button>
                </div>
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

          {/* <div className='mt-6 text-center text-sm'>
            <p className='text-gray-600'>
              Need a new reset link?{' '}
              <Link 
                href='/forgot-password' 
                className='text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300 underline hover:no-underline'
              >
                Request here
              </Link>
            </p>
          </div> */}
        </div>
      </div>
    </div>
    <FooterPage/>
    </>
  )
}
