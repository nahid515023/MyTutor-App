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

// Enhanced Error Message Component
const ErrorMessage = ({ message }: { message: string }) => (
  <div className='bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2'>
    <div className='flex-shrink-0'>
      <svg
        className='h-4 w-4 text-red-400'
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
    <p className='text-red-700 text-sm font-medium'>{`${message}. Please try again.`}</p>
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

  const handleError = (err: { response?: { data: { message: string } }; request?: unknown }) => {
    if (err.response && err.response.data) {
      setShowError('Email or Password is incorrect')
      setIsIncorrectPassword(true)
    } else if (err.request) {
      showToast('error', 'No Response from Server!')
    } else {
      showToast('error', 'Unexpected Error!')
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await api.post<{ message: string }>('auth/login', {
        email,
        password,
        role
      })

      console.log('Login response:', response.data)

      showToast('success', response.data.message || 'Login Successful!')
      setIsIncorrectPassword(false)
      
      // Refresh auth context to pick up new cookies, then navigate
      await refreshAuth()
      router.push('/home')
      
    } catch (err) {
      handleError(err as { response?: { data: { message: string } }; request?: unknown })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
          <div className='px-8 pt-8 '>
            <div className='text-center'>
              <h2 className='text-3xl font-bold mb-2 text-blue-500'>{title}</h2>
              <p className='text-gray-600 text-sm'>{subtitle}</p>
            </div>
          </div>

          {/* Form Section */}
          <div className='px-8 py-8'>
            <form onSubmit={handleLogin} className='space-y-6'>
              {/* Email Field */}
              <div className='space-y-2'>
                <label
                  htmlFor='email'
                  className='block text-sm font-semibold text-gray-700'
                >
                  Email Address
                </label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <FaEnvelope className='h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors' />
                  </div>
                  <input
                    id='email'
                    type='email'
                    required
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 placeholder-gray-400 ${
                      isIncorrectPassword
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 hover:border-gray-300'
                    }`}
                    placeholder='Enter your email address'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className='space-y-2'>
                <label
                  htmlFor='password'
                  className='block text-sm font-semibold text-gray-700'
                >
                  Password
                </label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <FaLock className='h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors' />
                  </div>
                  <input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 placeholder-gray-400 ${
                      isIncorrectPassword
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 hover:border-gray-300'
                    }`}
                    placeholder='Enter your password'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors'
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <FaEye className='h-4 w-4 text-gray-500 hover:text-gray-700' />
                    ) : (
                      <IoMdEyeOff className='h-4 w-4 text-gray-500 hover:text-gray-700' />
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
                  className='text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors'
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type='submit'
                disabled={isLoading}
                className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              >
                {isLoading ? (
                  <div className='flex items-center justify-center'>
                    <svg
                      className='animate-spin h-5 w-5 mr-3'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  <span className='flex items-center justify-center'>
                    Sign in
                    <svg
                      className='ml-2 h-4 w-4'
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
              <div className='relative my-8'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-200'></div>
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-4 bg-white text-gray-500 font-medium'>
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Auth */}
              <div className='space-y-3'>
                <GoogleAuth role={role} />
              </div>
            </form>
          </div>

          {/* Footer Section */}
          <div className='px-8 py-6 bg-gray-50 border-t border-gray-100'>
            <p className='text-center text-sm text-gray-600'>
              Don&apos;t have an account?{' '}
              <Link
                href={`/${role === 'STUDENT' ? 'student' : 'teacher'}/signup`}
                className='font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors'
              >
                Create an account →
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className='mt-6 text-center'>
          <p className='text-xs text-gray-500'>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
