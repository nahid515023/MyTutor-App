'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Menu, User, Settings, LogOut } from 'lucide-react'
import Image from 'next/image'
import { getUserData } from '@/utils/cookiesUserData'
import { getProfileImageUrl } from '@/utils/getProfileImage'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  profileImage?: string
}

export default function AdminHeader() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const notifications = 0 // Placeholder for future implementation

  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setAdminUser(userData)
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.profile-dropdown')) {
        setShowProfileMenu(false)
      }
    }

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfileMenu])

  const handleProfileMenuToggle = () => {
    setShowProfileMenu(!showProfileMenu)
  }

  const handleLogout = () => {
    // Add logout functionality here
    localStorage.removeItem('mytutor_auth_token')
    localStorage.removeItem('mytutor_user_data')
    window.location.href = '/auth/login'
  }

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40 w-full">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Left side - Menu button and Website name */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden transition-colors duration-200"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Website Name/Logo */}
          <div className="flex items-center">
            <div className="hidden sm:block px-10">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                MyTutor
              </h1>
              <p className="text-xs text-gray-500 font-medium">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Right side - Notifications and Profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <Bell className="h-6 w-6" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </button>

          {/* Admin Profile Dropdown */}
          <div className="relative profile-dropdown">
            <button 
              onClick={handleProfileMenuToggle}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {adminUser?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 font-medium">Administrator</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg ring-2 ring-white">
                {adminUser?.profileImage ? (
                  <Image
                    src={getProfileImageUrl(adminUser.profileImage)}
                    alt="Admin Profile"
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-white" />
                )}
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{adminUser?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500">{adminUser?.email || 'admin@mytutor.com'}</p>
                </div>
                
                <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                  <Settings className="h-4 w-4 mr-3 text-gray-500" />
                  Settings
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
