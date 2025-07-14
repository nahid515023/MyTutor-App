'use client'

import { useAuth } from '@/context/AuthProvider'
import Cookies from 'js-cookie'

export default function TestPage() {
  const { user, loading, isAuthenticated } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      <div className="space-y-2">
        <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
        <div><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
        <div><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</div>
        <div><strong>Token Cookie:</strong> {Cookies.get('token') || 'None'}</div>
        <div><strong>User Cookie:</strong> {Cookies.get('user') || 'None'}</div>
      </div>

      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Refresh Page
      </button>
    </div>
  )
}
