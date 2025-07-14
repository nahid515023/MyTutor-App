'use client'

import { useTheme } from '@/context/ThemeProvider'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className={`p-2 rounded-lg transition-colors ${className}`}
        aria-label="Theme toggle placeholder"
      >
        <Sun className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors duration-200 ${
        theme === 'dark'
          ? 'hover:bg-gray-800 text-yellow-300'
          : 'hover:bg-gray-100 text-gray-700'
      } ${className}`}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  )
} 