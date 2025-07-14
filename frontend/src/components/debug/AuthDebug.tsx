'use client'

import { useAuth } from '@/context/AuthProvider'
import { useEffect } from 'react'
import Cookies from 'js-cookie'

export default function AuthDebug() {
  const { user, loading, isAuthenticated, isVerified, isActive } = useAuth()

  useEffect(() => {
    // Log auth status for debugging
    console.log('=== AUTH DEBUG ===')
    console.log('User:', user)
    console.log('Loading:', loading)
    console.log('IsAuthenticated:', isAuthenticated)
    console.log('IsVerified:', isVerified())
    console.log('IsActive:', isActive())
    console.log('Token Cookie:', Cookies.get('token'))
    console.log('User Cookie:', Cookies.get('user'))
    console.log('================')
  }, [user, loading, isAuthenticated, isVerified, isActive])

  if (loading) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded">
        Auth Loading...
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded text-sm max-w-sm">
      <div><strong>User:</strong> {user ? user.name : 'None'}</div>
      <div><strong>Role:</strong> {user ? user.role : 'None'}</div>
      <div><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
      <div><strong>Verified:</strong> {user ? (isVerified() ? 'Yes' : 'No') : 'N/A'}</div>
      <div><strong>Active:</strong> {user ? (isActive() ? 'Yes' : 'No') : 'N/A'}</div>
    </div>
  )
}
