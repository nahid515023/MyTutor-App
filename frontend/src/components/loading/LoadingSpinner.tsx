import React from 'react'

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  color?: 'blue' | 'white' | 'gray' | 'amber'
}

export default function LoadingSpinner({
  size = 'md',
  className = '',
  color = 'blue'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  const colorClasses = {
    blue: 'border-blue-500 dark:border-blue-400',
    white: 'border-white',
    gray: 'border-gray-500 dark:border-gray-400',
    amber: 'border-amber-500 dark:border-amber-400'
  }

  return (
    <div
      className={`animate-spin rounded-full border-t-2 border-b-2 ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    ></div>
  )
}
