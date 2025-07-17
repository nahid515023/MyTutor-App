'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseMemoryCleanupOptions {
  cleanupInterval?: number
  maxItems?: number
}

export function useMemoryCleanup(
  items: unknown[],
  options: UseMemoryCleanupOptions = {}
) {
  const { cleanupInterval = 30000, maxItems = 100 } = options
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    // Clear previous timeout
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current)
    }

    // Schedule cleanup if we have too many items
    if (items.length > maxItems) {
      cleanupTimeoutRef.current = setTimeout(() => {
        // Force garbage collection if available
        if (global.gc) {
          global.gc()
        }
        
        // Clean up URL.createObjectURL references
        items.forEach((item: unknown) => {
          if (item && typeof item === 'string' && item.startsWith('blob:')) {
            URL.revokeObjectURL(item)
          }
        })
      }, cleanupInterval)
    }

    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current)
      }
    }
  }, [items, cleanupInterval, maxItems])

  // Cleanup function for manual use
  const forceCleanup = useCallback(() => {
    if (global.gc) {
      global.gc()
    }
    
    // Clean up any blob URLs
    items.forEach((item: unknown) => {
      if (item && typeof item === 'string' && item.startsWith('blob:')) {
        URL.revokeObjectURL(item)
      }
    })
  }, [items])

  return { forceCleanup }
}

// Hook for optimizing re-renders
export function useOptimizedState<T>(
  initialValue: T,
  compareFn?: (prev: T, next: T) => boolean
) {
  const [state, setState] = useState(initialValue)
  const prevStateRef = useRef(initialValue)

  const optimizedSetState = useCallback((newValue: T | ((prev: T) => T)) => {
    const nextValue = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(prevStateRef.current)
      : newValue

    const shouldUpdate = compareFn 
      ? !compareFn(prevStateRef.current, nextValue)
      : prevStateRef.current !== nextValue

    if (shouldUpdate) {
      prevStateRef.current = nextValue
      setState(nextValue)
    }
  }, [compareFn])

  return [state, optimizedSetState] as const
}
