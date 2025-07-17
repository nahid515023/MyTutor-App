import React from 'react'

interface FullPageLoadingProps {
  title?: string
  message?: string
  isVisible?: boolean
}

export default function FullPageLoading({
  title = 'Loading Application',
  message = 'Please wait while we prepare everything for you...',
  isVisible = true
}: FullPageLoadingProps) {
  if (!isVisible) return null

  return (
    <div className='fixed inset-0 bg-gray-50 dark:bg-gray-900 z-50 flex flex-col justify-center items-center'>
      {/* Background Pattern */}
      <div className='absolute inset-0 opacity-10'>
        <div className='absolute inset-0 bg-gradient-to-br from-blue-500/20 to-amber-500/20'></div>
        <div className='absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[length:20px_20px]'></div>
      </div>

      {/* Loading Content */}
      <div className='relative z-10 flex flex-col items-center'>
        {/* Main Spinner */}
        <div className='relative mb-8'>
          <div className='absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-amber-500 dark:from-blue-600 dark:to-amber-600 blur-xl opacity-30 animate-pulse'></div>
          <div className='relative animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-blue-500 dark:border-blue-400'></div>
        </div>

        {/* Text Content */}
        <div className='text-center max-w-md'>
          <h1 className='text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4'>
            {title}
          </h1>
          <p className='text-gray-600 dark:text-gray-400 text-lg mb-8'>
            {message}
          </p>

          {/* Animated Dots */}
          <div className='flex justify-center gap-2'>
            <div
              className='w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce'
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className='w-3 h-3 rounded-full bg-amber-500 dark:bg-amber-400 animate-bounce'
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className='w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce'
              style={{ animationDelay: '300ms' }}
            ></div>
            <div
              className='w-3 h-3 rounded-full bg-amber-500 dark:bg-amber-400 animate-bounce'
              style={{ animationDelay: '450ms' }}
            ></div>
            <div
              className='w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce'
              style={{ animationDelay: '600ms' }}
            ></div>
          </div>

          {/* Progress Bar */}
          <div className='mt-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden'>
            <div className='h-full bg-gradient-to-r from-blue-500 to-amber-500 dark:from-blue-600 dark:to-amber-600 rounded-full animate-pulse'></div>
          </div>
        </div>
      </div>
    </div>
  )
}
