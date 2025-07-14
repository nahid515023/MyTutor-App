'use client'

import { useState } from 'react'
import { Eye, EyeOff, Mail, Save } from 'lucide-react'
import { api } from '@/_lib/api'
import Cookies from 'js-cookie'
interface FormData {
  newEmail: string
  password: string
}

export default function ChangeEmail () {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    newEmail: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  // Get user id from cookie
  const user = JSON.parse(Cookies.get('user') || '{}')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const validateForm = (): boolean => {
    // Simple email regex for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.newEmail)) {
      setError('New email is invalid')
      return false
    }
    if (formData.password.length < 8) {
      setError('Please enter your password to confirm this change')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await api.post(
        `/profile/change-email/${user.id}`,
        formData
      )
      if (response.status !== 200) {
        setError('An unexpected error occurred')
        return
      }
      // Show success message
      setSuccess(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700'>
        <div className='text-center'>
          <div className='flex justify-center mb-4'>
            <Mail className='h-12 w-12 text-blue-500' />
          </div>
          <h2 className='text-3xl font-extrabold text-gray-900 dark:text-gray-100'>
            Change Email Address
          </h2>
          <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
            Please enter your new email address and current password
          </p>
        </div>

        {success ? (
          <div className='p-4 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 transition-all duration-300'>
            <p className='flex items-center'>
              <svg
                className='h-5 w-5 mr-2 text-green-500 dark:text-green-400'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
              Email updated successfully
            </p>
          </div>
        ) : (
          <form className='space-y-6' onSubmit={handleSubmit}>
            {error && (
              <div className='p-4 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 transition-all duration-300'>
                <p className='flex items-center'>
                  <svg
                    className='h-5 w-5 mr-2 text-red-500 dark:text-red-400'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                      clipRule='evenodd'
                    />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='newEmail'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1'
                >
                  New Email
                </label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Mail className='h-5 w-5 text-gray-400 dark:text-gray-500' />
                  </div>
                  <input
                    id='newEmail'
                    name='newEmail'
                    type='email'
                    required
                    value={formData.newEmail}
                    onChange={handleChange}
                    className='w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                    placeholder='your.new@email.com'
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1'
                >
                  Current Password
                </label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <svg
                      className='h-5 w-5 text-gray-400 dark:text-gray-500'
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <input
                    id='password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className='w-full pl-10 pr-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                    placeholder='••••••••'
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className='h-5 w-5' />
                    ) : (
                      <Eye className='h-5 w-5' />
                    )}
                  </button>
                </div>
                <p className='mt-1 text-xs text-gray-500 dark:text-gray-400 pl-1'>
                  Please enter your current password to verify your identity
                </p>
              </div>
            </div>

            <div className='pt-2'>
              <button
                type='submit'
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className='w-5 h-5 mr-3 text-white animate-spin'
                      xmlns='http://www.w3.org/2000/svg'
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className='w-5 h-5 mr-2' />
                    Change Email
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
