'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Menu, Search, User } from 'lucide-react'
import Image from 'next/image'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  profileImage?: string
}

export default function AdminHeader() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const notifications = 0 // Placeholder for future implementation

  useEffect(() => {
    const userData = localStorage.getItem('adminUser')
    if (userData) {
      setAdminUser(JSON.parse(userData))
    }
  }, [])

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            type="button"
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="ml-4 flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-500">
            <Bell className="h-6 w-6" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>

          {/* Admin Profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {adminUser?.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
              {adminUser?.profileImage ? (
                <Image
                  src={adminUser.profileImage}
                  alt="Admin"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <User className="h-5 w-5 text-white" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
