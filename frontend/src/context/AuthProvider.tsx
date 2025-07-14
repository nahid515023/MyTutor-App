'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

// User types based on your backend
export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  verified: boolean
  status: string
  profileImage?: string
  bio?: string
  skills?: string
  phone?: string
  grade?: string
  education?: string
  location?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (userData: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  refreshAuth: () => Promise<void>
  hasRole: (roles: UserRole | UserRole[]) => boolean
  isVerified: () => boolean
  isActive: () => boolean
  checkPermission: (permission: (user: User) => boolean) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = Cookies.get('token')
      const userCookie = Cookies.get('user')
      
      console.log('=== checkAuthStatus ===')
      console.log('Raw token cookie:', token)
      console.log('Raw user cookie:', userCookie)

      if (!token) {
        console.log('No token found, setting user to null')
        setUser(null)
        setLoading(false)
        return
      }

      if (userCookie) {
        try {
          // Parse the user cookie (which is stored as JSON string)
          const parsedUser = JSON.parse(userCookie)
          console.log('Parsed user:', parsedUser)
          setUser(parsedUser)
        } catch (error) {
          console.error('Error parsing user cookie:', error)
          Cookies.remove('user')
          Cookies.remove('token')
          setUser(null)
        }
      } else {
        console.log('No user cookie found')
        setUser(null)
      }

      setLoading(false)
      console.log('=== checkAuthStatus complete ===')
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setLoading(false)
    }
  }

  const login = (userData: User) => {
    setUser(userData)
    Cookies.set('user', JSON.stringify(userData), { expires: 7 }) // 7 days
  }

  const refreshAuth = async () => {
    await checkAuthStatus()
  }

  const logout = () => {
    setUser(null)
    Cookies.remove('token')
    Cookies.remove('user')
    router.push('/')
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 })
    }
  }

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  }

  const isVerified = (): boolean => {
    return user?.verified === true
  }

  const isActive = (): boolean => {
    return user?.status === 'active'
  }

  const checkPermission = (permission: (user: User) => boolean): boolean => {
    if (!user) return false
    return permission(user)
  }

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    refreshAuth,
    hasRole,
    isVerified,
    isActive,
    checkPermission
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
