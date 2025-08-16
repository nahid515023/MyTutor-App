'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaEnvelope, FaLock, FaEye } from 'react-icons/fa'
import { IoMdEyeOff } from 'react-icons/io'
import Link from 'next/link'
import { api } from '@/_lib/api'
import { showToast } from '@/utils/toastService'
import GoogleAuth from '@/components/auth/GoogleAuth'
import { useAuth } from '@/context/AuthProvider'
import LoadingSpinner from '@/components/loading/LoadingSpinner'

// Enhanced Error Message Component
const ErrorMessage = ({ message }: { message: string }) => (
  <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 sm:p-3 flex items-center space-x-2'>
    <div className='flex-shrink-0'>
      <svg
        className='h-3 w-3 sm:h-4 sm:w-4 text-red-400 dark:text-red-300'
        fill='currentColor'
        viewBox='0 0 20 20'
      >
        <path
          fillRule='evenodd'
          d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
          clipRule='evenodd'
        />
      </svg>
    </div>
    <p className='text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium'>{`${message}. Please try again.`}</p>
  </div>
)

interface LoginFormProps {
  role: 'STUDENT' | 'TEACHER'
  title?: string
  subtitle?: string
}

export default function LoginForm ({
  role,
  title = 'Welcome Back!',
  subtitle = 'Please sign in to your account'
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isIncorrectPassword, setIsIncorrectPassword] = useState(false)
  const [showError, setShowError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  
  const { refreshAuth } = useAuth()

  const handleError = (err: { response?: { data: { message: string; errorCode?: number } }; request?: unknown }) => {
    if (err.response && err.response.data) {
      const { message, errorCode } = err.response.data
      
      if (errorCode === 1007) {
        setShowError('Invalid email or password')
        setIsIncorrectPassword(true)
        showToast('error', message || 'Invalid credentials!')
      } else {
        setShowError(message || 'Login failed')
        setIsIncorrectPassword(true)
        showToast('error', message || 'Login failed!')
      }
    } else if (err.request) {
      setShowError('No response from server')
      showToast('error', 'No Response from Server!')
    } else {
      setShowError('An unexpected error occurred')
      showToast('error', 'Unexpected Error!')
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setShowError('') // Clear any previous errors
    setIsIncorrectPassword(false)
    
    try {
      const response = await api.post<{ message: string; errorCode?: number }>('auth/login', {
        email,
        password,
        role
      })

      console.log('Login response:', response.data)

      // Check if the response contains an error code
      if (response.data.errorCode === 1007) {
        // Handle invalid credentials error
        setShowError('Invalid email or password')
        setIsIncorrectPassword(true)
        showToast('error', response.data.message || 'Invalid credentials!')
      }else{
        
        // Success case
        showToast('success', response.data.message || 'Login Successful!')
        setIsIncorrectPassword(false)
        
        // Refresh auth context to pick up new cookies, then navigate
        await refreshAuth()
        router.push('/home')
      }

      
    } catch (err) {
      handleError(err as { response?: { data: { message: string; errorCode?: number } }; request?: unknown })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex justify-center items-center px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900'>
      <div className='w-full max-w-md mx-auto'>
        <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden'>
          <div className='px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8'>
            <div className='text-center'>
              <h2 className='text-2xl sm:text-3xl font-bold mb-2 text-blue-500 dark:text-blue-400'>{title}</h2>
              <p className='text-gray-600 dark:text-gray-300 text-xs sm:text-sm'>{subtitle}</p>
            </div>
          </div>

          {/* Form Section */}
          <div className='px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
            <form onSubmit={handleLogin} className='space-y-4 sm:space-y-6'>
              {/* Email Field */}
              <div className='space-y-1 sm:space-y-2'>
                <label
                  htmlFor='email'
                  className='block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300'
                >
                  Email Address
                </label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none'>
                    <FaEnvelope className='h-3 w-3 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors' />
                  </div>
                  <input
                    id='email'
                    type='email'
                    required
                    className={`w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      isIncorrectPassword
                        ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/50'
                        : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/50 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    placeholder='Enter your email address'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className='space-y-1 sm:space-y-2'>
                <label
                  htmlFor='password'
                  className='block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300'
                >
                  Password
                </label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none'>
                    <FaLock className='h-3 w-3 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors' />
                  </div>
                  <input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`w-full pl-9 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      isIncorrectPassword
                        ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/50'
                        : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/50 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    placeholder='Enter your password'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-600 rounded-r-lg sm:rounded-r-xl transition-colors'
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <FaEye className='h-3 w-3 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200' />
                    ) : (
                      <IoMdEyeOff className='h-3 w-3 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200' />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {isIncorrectPassword && (
                <div className='animate-pulse'>
                  <ErrorMessage message={showError} />
                </div>
              )}

              {/* Forgot Password Link */}
              <div className='text-right'>
                <Link
                  href={`/forgot-password/${role}`}
                  className='text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors'
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type='submit'
                disabled={isLoading}
                className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base'
              >
                {isLoading ? (
                  <div className='flex items-center justify-center'>
                    <LoadingSpinner size="sm" color="white" className="mr-2 sm:mr-3" />
                    Signing in...
                  </div>
                ) : (
                  <span className='flex items-center justify-center'>
                    Sign in
                    <svg
                      className='ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13 7l5 5m0 0l-5 5m5-5H6'
                      />
                    </svg>
                  </span>
                )}
              </button>

              {/* Divider */}
              <div className='relative my-6 sm:my-8'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-200 dark:border-gray-600'></div>
                </div>
                <div className='relative flex justify-center text-xs sm:text-sm'>
                  <span className='px-3 sm:px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium'>
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Auth */}
              <div className='space-y-2 sm:space-y-3'>
                <GoogleAuth role={role} />
              </div>
            </form>
          </div>

          {/* Footer Section */}
          <div className='px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600'>
            <p className='text-center text-xs sm:text-sm text-gray-600 dark:text-gray-300'>
              Don&apos;t have an account?{' '}
              <Link
                href={`/${role === 'STUDENT' ? 'student' : 'teacher'}/signup`}
                className='font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors'
              >
                Create an account →
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className='mt-4 sm:mt-6 text-center px-4'>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
