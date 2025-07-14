'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme from localStorage or system preference, defaulting to light
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme') as Theme
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light')
    setTheme(initialTheme)
    
    // Apply theme to document
    applyTheme(initialTheme)
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light'
        setTheme(newTheme)
        applyTheme(newTheme)
      }
    }
    
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    
    // Add event listener for localStorage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        const newTheme = e.newValue as Theme || 'light'
        setTheme(newTheme)
        applyTheme(newTheme)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    setMounted(true)
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }
  
  // Apply theme classes to document
  const applyTheme = (currentTheme: Theme) => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(currentTheme)
    
    if (currentTheme === 'dark') {
      root.style.colorScheme = 'dark'
      document.body.classList.add('dark')
    } else {
      root.style.colorScheme = 'light'
      document.body.classList.remove('dark')
    }
  }

  // Prevent flash of wrong theme
  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext)
  
  // Provide fallback values instead of throwing an error
  if (context === undefined) {
    // Return a default implementation that does nothing
    // This prevents errors when the hook is used outside ThemeProvider
    return {
      theme: 'light' as Theme,
      toggleTheme: () => {
        console.warn('ThemeProvider not found. Theme cannot be toggled.')
      }
    }
  }
  
  return context
}