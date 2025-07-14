'use client'
import { api } from '@/_lib/api'
import { showToast } from '@/utils/toastService'
import Link from 'next/link'
import { Loader2, Mail } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { FooterPage } from '@/components/FooterPage'
interface ForgotPasswordParams {
  params: {
    role: string
  }
}

export default function ForgotPassword ({ params }: ForgotPasswordParams) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Email is required')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    try {
      setIsLoading(true)
      const res = await api.post<{ message: string }>('/auth/forgot-password', {
        email,
        role: params.role
      })

      if (res.data?.message) {
        setMessage(res.data.message)
        showToast('success', 'Reset instructions sent to your email')
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || 'An error occurred. Please try again.'
      setError(errorMessage)
      showToast('error', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
    <Navbar/>
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-12'>
        <div className='w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:shadow-xl'>
          <div className='p-6 sm:p-10'>
            {message ? (
              <div className='text-center space-y-5'>
                <div
                  className='bg-green-50 border border-green-100 text-green-700 px-6 py-5 rounded-xl shadow-sm'
                  role='alert'
                >
                  <h3 className='font-semibold text-xl mb-3'>Success!</h3>
                  <p className='text-green-600'>{message}</p>
                </div>
                <Link
                  href='/signin'
                  className='mt-5 inline-block text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline'
                >
                  Return to login
                </Link>
              </div>
            ) : (
              <>
                <div className='text-center mb-8'>
                  <h1 className='text-3xl font-bold text-gray-900 mb-3 tracking-tight'>
                    Forgot Password
                  </h1>
                  <p className='text-gray-600 text-lg'>
                    Enter your email address and we&apos;ll send you instructions
                    to reset your password.
                  </p>
                </div>

                {error && (
                  <div
                    className='bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-xl shadow-sm mb-6'
                    role='alert'
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className='space-y-7'>
                  <div>
                    <label
                      htmlFor='email'
                      className='block text-sm font-semibold text-gray-700 mb-2'
                    >
                      Email address
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <Mail className='h-5 w-5 text-gray-400' />
                      </div>
                      <input
                        type='email'
                        id='email'
                        name='email'
                        placeholder='you@example.com'
                        className='py-3.5 pl-11 pr-4 block w-full border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300'
                        required
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value)
                          if (error) setError('')
                        }}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <button
                    type='submit'
                    disabled={isLoading}
                    className='w-full py-3.5 px-4 flex justify-center items-center gap-3 rounded-xl border border-transparent font-semibold bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 text-base disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow'
                  >
                    {isLoading && <Loader2 className='h-5 w-5 animate-spin' />}
                    {isLoading ? 'Sending...' : 'Reset Password'}
                  </button>

                  <div className='text-center'>
                    <button
                      className='text-base text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline'
                      onClick={() => {
                        if (params.role === 'STUDENT') {
                          window.location.href = '/student/signin'
                        } else if (params.role === 'TEACHER') {
                          window.location.href = '/teacher/signin'
                        }
                      }}
                    >
                      Remember your password? Sign in
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <FooterPage/>
    </>
  )
}


