'use client'

import { useEffect } from 'react'

export default function COOPErrorHandler() {
  useEffect(() => {
    // Global error handler for COOP-related errors
    const handleError = (event: ErrorEvent) => {
      const error = event.error || event.message
      
      // Check if this is a COOP-related error
      if (
        (typeof error === 'string' && error.includes('Cross-Origin-Opener-Policy')) ||
        (typeof error === 'string' && error.includes('window.closed')) ||
        (error instanceof Error && error.message.includes('Cross-Origin-Opener-Policy')) ||
        (error instanceof Error && error.message.includes('window.closed'))
      ) {
        console.warn('COOP error detected and suppressed:', error)
        event.preventDefault()
        return true
      }
      
      return false
    }

    // Global unhandled rejection handler
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      
      if (
        (typeof reason === 'string' && reason.includes('Cross-Origin-Opener-Policy')) ||
        (typeof reason === 'string' && reason.includes('window.closed')) ||
        (reason instanceof Error && reason.message.includes('Cross-Origin-Opener-Policy')) ||
        (reason instanceof Error && reason.message.includes('window.closed'))
      ) {
        console.warn('COOP-related promise rejection detected and suppressed:', reason)
        event.preventDefault()
        return true
      }
      
      return false
    }

    // Add event listeners
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return null
}
