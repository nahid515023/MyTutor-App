'use client'

import React, { useEffect, useState } from 'react'
import { useTheme } from '@/context/ThemeProvider'
import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false)
  
  // Only access theme context after component has mounted on client
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Safe access to theme context
  const { theme, toggleTheme } = useTheme()
  
  // Don't render anything until mounted on client
  if (!mounted) {
    return (
      <button
        className={`p-2 rounded-lg transition-colors duration-200 bg-gray-100 text-gray-800 ${className || ''}`}
        aria-label="Theme toggle placeholder"
      >
        <Sun className="h-5 w-5" />
      </button>
    )
  }
  
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600 hover:text-yellow-200'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      } ${className || ''}`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  )
}