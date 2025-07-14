'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface AdminProtectedRouteProps {
  children: React.ReactNode
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        const adminUser = localStorage.getItem('adminUser')

        if (!token || !adminUser) {
          router.push('/admin/login')
          return
        }

        const userData = JSON.parse(adminUser)
        if (userData.role !== 'ADMIN') {
          router.push('/admin/login')
          return
        }

        // Optionally verify token with backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (!response.ok) {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
          router.push('/admin/login')
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-2 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
