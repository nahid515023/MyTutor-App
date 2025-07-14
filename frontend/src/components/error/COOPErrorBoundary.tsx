'use client'

import React from 'react'

interface COOPErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface COOPErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>
}

class COOPErrorBoundary extends React.Component<
  COOPErrorBoundaryProps,
  COOPErrorBoundaryState
> {
  constructor(props: COOPErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): COOPErrorBoundaryState {
    // Check if this is a COOP-related error
    const isCOOPError = error.message.includes('Cross-Origin-Opener-Policy') ||
                       error.message.includes('window.closed') ||
                       error.message.includes('popup')
    
    if (isCOOPError) {
      console.warn('COOP error caught and handled:', error.message)
      return { hasError: true, error }
    }
    
    // Re-throw other errors
    throw error
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log COOP errors for debugging
    if (error.message.includes('Cross-Origin-Opener-Policy') ||
        error.message.includes('window.closed')) {
      console.warn('COOP Error caught by boundary:', error, errorInfo)
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} reset={this.reset} />
      }
      
      // Default fallback for COOP errors
      return (
        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800">
            Authentication Service Notice
          </h3>
          <p className="mt-1 text-sm text-yellow-700">
            There was a temporary issue with the authentication popup. Please try again.
          </p>
          <button
            onClick={this.reset}
            className="mt-2 px-3 py-1 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default COOPErrorBoundary
