'use client'

import { useAuth, UserRole } from '@/context/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface RouteGuardProps {
  children: ReactNode
  requireAuth?: boolean
  allowedRoles?: UserRole[]
  requireVerification?: boolean
  requireActiveAccount?: boolean
  redirectTo?: string
  fallback?: ReactNode
}

export function RouteGuard({
  children,
  requireAuth = true,
  allowedRoles,
  requireVerification = false,
  requireActiveAccount = true,
  redirectTo,
  fallback
}: RouteGuardProps) {
  const { user, loading, isAuthenticated, hasRole, isVerified, isActive } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // Check authentication
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo || '/student/signin')
      return
    }

    // Check active account
    if (requireActiveAccount && user && !isActive()) {
      router.push('/account-blocked')
      return
    }

    // Check verification
    if (requireVerification && user && !isVerified()) {
      router.push('/verify-email')
      return
    }

    // Check roles
    if (allowedRoles && user && !hasRole(allowedRoles)) {
      router.push('/unauthorized')
      return
    }
  }, [
    user, 
    loading, 
    isAuthenticated, 
    router, 
    requireAuth, 
    requireActiveAccount, 
    requireVerification, 
    allowedRoles, 
    redirectTo, 
    hasRole, 
    isActive, 
    isVerified
  ])

  if (loading) {
    return fallback || <LoadingSpinner />
  }

  // Authentication check
  if (requireAuth && !isAuthenticated) {
    return fallback || <LoadingSpinner />
  }

  // Active account check
  if (requireActiveAccount && user && !isActive()) {
    return fallback || <div>Account is blocked or inactive</div>
  }

  // Verification check
  if (requireVerification && user && !isVerified()) {
    return fallback || <div>Email verification required</div>
  }

  // Role check
  if (allowedRoles && user && !hasRole(allowedRoles)) {
    return fallback || <div>Insufficient permissions</div>
  }

  return <>{children}</>
}

// Specific role guards
export function AdminGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RouteGuard
      allowedRoles={['ADMIN']}
      requireVerification={true}
      fallback={fallback}
    >
      {children}
    </RouteGuard>
  )
}

export function TeacherGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RouteGuard
      allowedRoles={['TEACHER']}
      requireVerification={true}
      fallback={fallback}
    >
      {children}
    </RouteGuard>
  )
}

export function StudentGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RouteGuard
      allowedRoles={['STUDENT']}
      requireVerification={true}
      fallback={fallback}
    >
      {children}
    </RouteGuard>
  )
}

export function TeacherOrAdminGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RouteGuard
      allowedRoles={['TEACHER', 'ADMIN']}
      requireVerification={true}
      fallback={fallback}
    >
      {children}
    </RouteGuard>
  )
}

export function StudentOrTeacherGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RouteGuard
      allowedRoles={['STUDENT', 'TEACHER']}
      requireVerification={true}
      fallback={fallback}
    >
      {children}
    </RouteGuard>
  )
}

// Public route guard (for pages that should only be accessible when NOT logged in)
export function PublicOnlyGuard({ children, redirectTo = '/home' }: { children: ReactNode; redirectTo?: string }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, loading, router, redirectTo])

  if (loading) {
    return <LoadingSpinner />
  }

  if (isAuthenticated) {
    return <LoadingSpinner />
  }

  return <>{children}</>
}
