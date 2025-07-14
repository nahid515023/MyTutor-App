'use client'

import { useAuth, UserRole, User } from '@/context/AuthProvider'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export interface RoutePermission {
  path: string
  allowedRoles?: UserRole[]
  requireVerification?: boolean
  requireActiveAccount?: boolean
  customPermission?: (user: User) => boolean
  redirectTo?: string
}

// Define your route permissions here
const routePermissions: RoutePermission[] = [
  // Dashboard routes - Admin only
  {
    path: '/dashboard',
    allowedRoles: ['ADMIN'],
    requireVerification: true,
    requireActiveAccount: true,
    redirectTo: '/unauthorized'
  },
  
  // Post creation - Student only
  {
    path: '/create-post',
    allowedRoles: ['STUDENT'],
    requireVerification: true,
    requireActiveAccount: true,
    redirectTo: '/unauthorized'
  },
  
  // Meeting room - Teachers and Students
  {
    path: '/meeting-room',
    allowedRoles: ['TEACHER', 'STUDENT'],
    requireVerification: true,
    requireActiveAccount: true,
    redirectTo: '/verify-email'
  },
  
  // Profile routes - All authenticated users
  {
    path: '/profile',
    requireVerification: false,
    requireActiveAccount: true,
    redirectTo: '/account-blocked'
  },
  
  // Tutor browsing - Students and verified users
  {
    path: '/tutors',
    allowedRoles: ['STUDENT'],
    requireVerification: true,
    requireActiveAccount: true,
    redirectTo: '/verify-email'
  },
  
  // Chat - Teachers and Students
  {
    path: '/chats',
    allowedRoles: ['TEACHER', 'STUDENT'],
    requireVerification: true,
    requireActiveAccount: true,
    redirectTo: '/verify-email'
  }
]

export function useRoutePermissions() {
  const { user, isAuthenticated, hasRole, isVerified, isActive, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    // Find matching route permission
    const routePermission = routePermissions.find(permission => 
      pathname.startsWith(permission.path)
    )

    if (!routePermission) return

    // Check authentication
    if (!isAuthenticated) {
      router.push('/signin')
      return
    }

    // Check active account
    if (routePermission.requireActiveAccount && !isActive()) {
      router.push('/account-blocked')
      return
    }

    // Check verification
    if (routePermission.requireVerification && !isVerified()) {
      router.push('/verify-email')
      return
    }

    // Check roles
    if (routePermission.allowedRoles && user && !hasRole(routePermission.allowedRoles)) {
      router.push(routePermission.redirectTo || '/unauthorized')
      return
    }

    // Check custom permission
    if (routePermission.customPermission && user && !routePermission.customPermission(user)) {
      router.push(routePermission.redirectTo || '/unauthorized')
      return
    }
  }, [pathname, user, isAuthenticated, hasRole, isVerified, isActive, loading, router])

  return {
    hasPermission: (path: string) => {
      const permission = routePermissions.find(p => path.startsWith(p.path))
      if (!permission) return true
      
      if (!isAuthenticated) return false
      if (permission.requireActiveAccount && !isActive()) return false
      if (permission.requireVerification && !isVerified()) return false
      if (permission.allowedRoles && user && !hasRole(permission.allowedRoles)) return false
      if (permission.customPermission && user && !permission.customPermission(user)) return false
      
      return true
    },
    routePermissions
  }
}

// Hook for checking specific permissions
export function usePermissions() {
  const { user, isAuthenticated, hasRole, isVerified, isActive } = useAuth()

  return {
    // Role checks
    isAdmin: () => hasRole(['ADMIN']),
    isTeacher: () => hasRole(['TEACHER']),
    isStudent: () => hasRole(['STUDENT']),
    isTeacherOrAdmin: () => hasRole(['TEACHER', 'ADMIN']),
    isStudentOrTeacher: () => hasRole(['STUDENT', 'TEACHER']),
    
    // Status checks
    isAuthenticated: () => isAuthenticated,
    isVerified: () => isVerified(),
    isActive: () => isActive(),
    
    // Feature permissions
    canCreatePost: () => isAuthenticated && hasRole(['STUDENT']) && isVerified() && isActive(),
    canApplyToTutor: () => isAuthenticated && hasRole(['TEACHER']) && isVerified() && isActive(),
    canAccessDashboard: () => isAuthenticated && hasRole(['ADMIN']) && isVerified() && isActive(),
    canCreateMeeting: () => isAuthenticated && hasRole(['TEACHER', 'STUDENT']) && isVerified() && isActive(),
    canViewPosts: () => isAuthenticated && isActive(),
    canChat: () => isAuthenticated && hasRole(['TEACHER', 'STUDENT']) && isVerified() && isActive(),
    
    // Resource ownership (you'll need to pass resource data)
    canEditProfile: (profileUserId: string) => user?.id === profileUserId || hasRole(['ADMIN']),
    canDeletePost: (postUserId: string) => user?.id === postUserId || hasRole(['ADMIN']),
    canViewPrivateProfile: (profileUserId: string) => user?.id === profileUserId || hasRole(['ADMIN']),
    
    // Custom permissions
    checkCustomPermission: (permissionCheck: (user: User) => boolean) => {
      return user ? permissionCheck(user) : false
    }
  }
}
