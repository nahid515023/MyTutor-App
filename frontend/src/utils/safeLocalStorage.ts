'use client'

/**
 * Safe localStorage operations that prevent SSR hydration mismatches
 */

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') {
      return null
    }
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return null
    }
  },

  setItem: (key: string, value: string): boolean => {
    if (typeof window === 'undefined') {
      return false
    }
    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
      return false
    }
  },

  removeItem: (key: string): boolean => {
    if (typeof window === 'undefined') {
      return false
    }
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
      return false
    }
  },

  clear: (): boolean => {
    if (typeof window === 'undefined') {
      return false
    }
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.warn('Error clearing localStorage:', error)
      return false
    }
  }
}

export default safeLocalStorage
