import React from 'react'

interface LoadingStateProps {
  title?: string
  message?: string
  className?: string
  size?: 'small' | 'medium' | 'large'
}

export default function LoadingState({
  title = 'Loading...',
  message = 'Please wait while we process your request...',
  className = '',
  size = 'medium'
}: LoadingStateProps) {
  const sizeClasses = {
    small: {
      container: 'h-48',
      spinner: 'h-12 w-12',
      title: 'text-lg',
      message: 'text-sm',
      dots: 'w-2 h-2'
    },
    medium: {
      container: 'h-96',
      spinner: 'h-20 w-20',
      title: 'text-xl',
      message: 'text-base',
      dots: 'w-3 h-3'
    },
    large: {
      container: 'h-[32rem]',
      spinner: 'h-24 w-24',
      title: 'text-2xl',
      message: 'text-lg',
      dots: 'w-4 h-4'
    }
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={`flex flex-col justify-center items-center ${currentSize.container} bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 ${className}`}>
      <div className='relative'>
        <div className='absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-amber-500 dark:from-blue-600 dark:to-amber-600 blur-xl opacity-20 animate-pulse'></div>
        <div className={`relative animate-spin rounded-full ${currentSize.spinner} border-t-4 border-b-4 border-blue-500 dark:border-blue-400`}></div>
      </div>
      <div className='mt-8 text-center'>
        <h3 className={`${currentSize.title} font-semibold text-gray-800 dark:text-gray-200 mb-2`}>
          {title}
        </h3>
        <p className={`text-gray-600 dark:text-gray-400 ${currentSize.message}`}>
          {message}
        </p>
      </div>
      <div className='mt-6 flex gap-2'>
        <div
          className={`${currentSize.dots} rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce`}
          style={{ animationDelay: '0ms' }}
        ></div>
        <div
          className={`${currentSize.dots} rounded-full bg-amber-500 dark:bg-amber-400 animate-bounce`}
          style={{ animationDelay: '150ms' }}
        ></div>
        <div
          className={`${currentSize.dots} rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce`}
          style={{ animationDelay: '300ms' }}
        ></div>
      </div>
    </div>
  )
}
