'use client'

import { usePermissions } from '@/hooks/useRoutePermissions'
import Link from 'next/link'
import { 
  Home, 
  BookOpen, 
  MessageCircle, 
  Video, 
  Shield,
  User,
  PlusCircle,
  Search
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: () => boolean
  badge?: string
}

export function PermissionBasedNav() {
  const permissions = usePermissions()

  const navItems: NavItem[] = [
    {
      label: 'Home',
      href: '/home',
      icon: Home,
      permission: () => permissions.isAuthenticated()
    },
    {
      label: 'Create Post',
      href: '/create-post',
      icon: PlusCircle,
      permission: () => permissions.canCreatePost(),
      badge: permissions.isStudent() ? 'Student' : undefined
    },
    {
      label: 'Find Tutors',
      href: '/tutors',
      icon: Search,
      permission: () => permissions.isStudent() && permissions.isVerified() && permissions.isActive()
    },
    {
      label: 'Browse Posts',
      href: '/posts',
      icon: BookOpen,
      permission: () => permissions.canViewPosts()
    },
    {
      label: 'My Chats',
      href: '/chats',
      icon: MessageCircle,
      permission: () => permissions.canChat()
    },
    {
      label: 'Meetings',
      href: '/meetings',
      icon: Video,
      permission: () => permissions.canCreateMeeting()
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: User,
      permission: () => permissions.isAuthenticated()
    },
    {
      label: 'Admin Dashboard',
      href: '/dashboard',
      icon: Shield,
      permission: () => permissions.canAccessDashboard(),
      badge: 'Admin'
    }
  ]

  // Filter nav items based on permissions
  const allowedNavItems = navItems.filter(item => 
    !item.permission || item.permission()
  )

  return (
    <nav className="flex space-x-4">
      {allowedNavItems.map((item) => (
        <NavLink key={item.href} item={item} />
      ))}
    </nav>
  )
}

function NavLink({ item }: { item: NavItem }) {
  const Icon = item.icon
  
  return (
    <Link 
      href={item.href}
      className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
    >
      <Icon className="w-4 h-4" />
      <span>{item.label}</span>
      {item.badge && (
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

// Mobile navigation with permissions
export function MobilePermissionNav() {
  const permissions = usePermissions()

  const mobileNavItems: NavItem[] = [
    {
      label: 'Home',
      href: '/home',
      icon: Home,
      permission: () => permissions.isAuthenticated()
    },
    {
      label: 'Posts',
      href: '/posts',
      icon: BookOpen,
      permission: () => permissions.canViewPosts()
    },
    {
      label: 'Chat',
      href: '/chats',
      icon: MessageCircle,
      permission: () => permissions.canChat()
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: User,
      permission: () => permissions.isAuthenticated()
    },
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: Shield,
      permission: () => permissions.canAccessDashboard()
    }
  ]

  const allowedItems = mobileNavItems.filter(item => 
    !item.permission || item.permission()
  )

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
      <div className="flex justify-around py-2">
        {allowedItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
