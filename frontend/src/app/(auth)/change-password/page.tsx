'use client'
import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import {
  Eye,
  EyeOff,
  Lock as LockIcon,
  CheckCircle,
  AlertCircle,
  Save
} from 'lucide-react'
import { api } from '@/_lib/api'

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const userCookie = Cookies.get('user')
    const userData = userCookie ? JSON.parse(userCookie) : null

    setUser(userData)
    setIsLoading(false)

    if (!userData || !userData.id) {
      window.location.href = '/login'
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const togglePasswordVisibility = (
    field: 'currentPassword' | 'newPassword' | 'confirmPassword'
  ): void => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.currentPassword) {
      setError('Current password is required')
      return false
    }

    if (!formData.newPassword) {
      setError('New password is required')
      return false
    }

    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long')
      return false
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      return false
    }

    return true
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await api.post(`/profile/change-password/${user?.id}`, formData)
      setMessage('Your password has been successfully changed')
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err.response as { data?: { message?: string } }
        setError(
          errorResponse.data?.message ||
            'Failed to change password. Please try again.'
        )
      } else {
        setError('Failed to change password. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return null
  }

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center p-8'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto'></div>
          <p className='mt-4 text-gray-600 dark:text-gray-300'>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !user.id) {
    return null
  }

  return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700'>
          <div className='text-center'>
            <div className='flex justify-center mb-4'>
              <LockIcon className='h-12 w-12 text-blue-500' />
            </div>
            <h2 className='text-3xl font-extrabold text-gray-900 dark:text-gray-100'>
              Change Password
            </h2>
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              Please enter your current password and a new password
            </p>
          </div>

          {message && (
            <div className='p-4 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 transition-all duration-300'>
              <p className='flex items-center'>
                <CheckCircle className='h-5 w-5 mr-2 text-green-500 dark:text-green-400' />
                {message}
              </p>
            </div>
          )}

          {error && (
            <div className='p-4 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 transition-all duration-300'>
              <p className='flex items-center'>
                <AlertCircle className='h-5 w-5 mr-2 text-red-500 dark:text-red-400' />
                {error}
              </p>
            </div>
          )}

          <form className='space-y-6' onSubmit={handleSubmit}>
            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='currentPassword'
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
                    id='currentPassword'
                    name='currentPassword'
                    type={showPasswords.currentPassword ? 'text' : 'password'}
                    autoComplete='current-password'
                    required
                    className='w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                    value={formData.currentPassword}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                    onClick={() => togglePasswordVisibility('currentPassword')}
                  >
                    {showPasswords.currentPassword ? (
                      <EyeOff className='h-5 w-5' />
                    ) : (
                      <Eye className='h-5 w-5' />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor='newPassword'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1'
                >
                  New Password
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
                    id='newPassword'
                    name='newPassword'
                    type={showPasswords.newPassword ? 'text' : 'password'}
                    autoComplete='new-password'
                    required
                    className='w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                    value={formData.newPassword}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                    onClick={() => togglePasswordVisibility('newPassword')}
                  >
                    {showPasswords.newPassword ? (
                      <EyeOff className='h-5 w-5' />
                    ) : (
                      <Eye className='h-5 w-5' />
                    )}
                  </button>
                </div>
                <p className='mt-1 text-xs text-gray-500 dark:text-gray-400 pl-1'>
                  Password must be at least 8 characters long
                </p>
              </div>

              <div>
                <label
                  htmlFor='confirmPassword'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1'
                >
                  Confirm New Password
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
                    id='confirmPassword'
                    name='confirmPassword'
                    type={showPasswords.confirmPassword ? 'text' : 'password'}
                    autoComplete='new-password'
                    required
                    className='w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                  >
                    {showPasswords.confirmPassword ? (
                      <EyeOff className='h-5 w-5' />
                    ) : (
                      <Eye className='h-5 w-5' />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className='pt-2'>
              <button
                type='submit'
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
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
                    Change Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
  )
}

export default ChangePasswordForm
