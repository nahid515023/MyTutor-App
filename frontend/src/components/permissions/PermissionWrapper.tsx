'use client'

import { useAuth, UserRole, User } from '@/context/AuthProvider'
import { ReactNode } from 'react'

interface PermissionWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  showForRoles?: UserRole[]
  hideForRoles?: UserRole[]
  requireVerification?: boolean
  requireActiveAccount?: boolean
  customPermission?: (user: User) => boolean
  showForAuthenticated?: boolean
  showForUnauthenticated?: boolean
}

export function PermissionWrapper({
  children,
  fallback = null,
  showForRoles,
  hideForRoles,
  requireVerification = false,
  requireActiveAccount = false,
  customPermission,
  showForAuthenticated,
  showForUnauthenticated
}: PermissionWrapperProps) {
  const { user, isAuthenticated, hasRole, isVerified, isActive, checkPermission } = useAuth()

  // Check authentication requirements
  if (showForAuthenticated === true && !isAuthenticated) {
    return <>{fallback}</>
  }

  if (showForUnauthenticated === true && isAuthenticated) {
    return <>{fallback}</>
  }

  // If not authenticated and we need user-specific checks, hide content
  if (!user && (showForRoles || hideForRoles || requireVerification || requireActiveAccount || customPermission)) {
    return <>{fallback}</>
  }

  // Check active account requirement
  if (requireActiveAccount && user && !isActive()) {
    return <>{fallback}</>
  }

  // Check verification requirement  
  if (requireVerification && user && !isVerified()) {
    return <>{fallback}</>
  }

  // Check role restrictions
  if (showForRoles && user && !hasRole(showForRoles)) {
    return <>{fallback}</>
  }

  if (hideForRoles && user && hasRole(hideForRoles)) {
    return <>{fallback}</>
  }

  // Check custom permission
  if (customPermission && user && !checkPermission(customPermission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Convenience components for common use cases
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionWrapper showForRoles={['ADMIN']} fallback={fallback}>
      {children}
    </PermissionWrapper>
  )
}

export function TeacherOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionWrapper showForRoles={['TEACHER']} fallback={fallback}>
      {children}
    </PermissionWrapper>
  )
}

export function StudentOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionWrapper showForRoles={['STUDENT']} fallback={fallback}>
      {children}
    </PermissionWrapper>
  )
}

export function TeacherOrAdmin({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionWrapper showForRoles={['TEACHER', 'ADMIN']} fallback={fallback}>
      {children}
    </PermissionWrapper>
  )
}

export function StudentOrTeacher({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionWrapper showForRoles={['STUDENT', 'TEACHER']} fallback={fallback}>
      {children}
    </PermissionWrapper>
  )
}

export function AuthenticatedOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionWrapper showForAuthenticated={true} fallback={fallback}>
      {children}
    </PermissionWrapper>
  )
}

export function UnauthenticatedOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionWrapper showForUnauthenticated={true} fallback={fallback}>
      {children}
    </PermissionWrapper>
  )
}

export function VerifiedOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionWrapper requireVerification={true} fallback={fallback}>
      {children}
    </PermissionWrapper>
  )
}
