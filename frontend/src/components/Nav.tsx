'use client'

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import { FaGraduationCap } from 'react-icons/fa'
import { getUserData } from '@/utils/cookiesUserData'
import { getProfileImageUrl } from '@/utils/getProfileImage'
import { APP_CONFIG } from '@/config'
import { API_ENDPOINTS } from '../config/index'
import { api } from '@/_lib/api'

interface User {
  id: string
  profileImage?: string
  name: string
  role?: string
}

export default function Nav () {
  const pathname = usePathname()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Fetch user data from cookies
    const fetchUserData = () => {
      const userData = getUserData()
      if (userData) {
        setUser(userData)
      } else {
        setUser(null)
      }
    }
    const intervalId = setInterval(fetchUserData, 1000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    document.body.style.paddingTop = '76px'
    return () => {
      document.body.style.paddingTop = '0'
    }
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsSearchOpen(false)
  }, [pathname])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isMobileMenuOpen && !target.closest('[data-mobile-menu]')) {
        setIsMobileMenuOpen(false)
      }
      if (isSearchOpen && !target.closest('[data-mobile-search]')) {
        setIsSearchOpen(false)
      }
    }

    if (isMobileMenuOpen || isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isMobileMenuOpen, isSearchOpen])

  const handleLogout = async (): Promise<void> => {
    try {
      await api.get(API_ENDPOINTS.AUTH.LOGOUT)
      Cookies.remove('theme')

      // Reset states
      setUser(null)
      setIsSearchOpen(false)

      window.location.href = '/'
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/home?search=${encodeURIComponent(searchTerm.trim())}`)
      setSearchTerm('')
      setIsSearchOpen(false)
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  if (!user) {
    return (
      <nav className='fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-gray-900 dark:via-slate-800 dark:to-neutral-900 text-blue-800 dark:text-blue-300 shadow-lg'>
        <div className='container max-w-screen-xl mx-auto flex items-center justify-between px-4 py-3'>
          <div className='flex items-center gap-2 text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 transition-all duration-300'>
            <FaGraduationCap className='text-2xl text-blue-600' />
            MyTutor
          </div>
          <div className='flex items-center gap-3'>
            <ThemeToggle />
            <div className='h-10 w-10 rounded-full bg-blue-200 dark:bg-blue-800 animate-pulse'></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-blue-100 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-slate-800 dark:to-neutral-900 backdrop-blur-lg text-gray-800 dark:text-gray-100 shadow-lg border-b border-gray-200/80 dark:border-gray-800/80'>
      <div className='container max-w-screen-xl mx-auto flex items-center justify-between px-4 py-3'>
        <div className='flex items-center gap-4'>
          {/* Logo */}
          <Link
            href='/home'
            className='text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 py-2 flex items-center gap-2'
          >
            <FaGraduationCap className='text-2xl text-blue-600' />
            MyTutor
          </Link>
        </div>

        {/* Mobile Right Section */}
        <div className='flex items-center gap-3 lg:hidden'>
          {/* Theme Toggle Mobile */}
          <ThemeToggle className='p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg' />

          <button
            data-mobile-search
            className='rounded-lg p-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:ring-opacity-50'
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label='Toggle search'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </button>

          {/* Hamburger Menu Button */}
          <button
            data-mobile-menu
            className='rounded-lg p-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:ring-opacity-50'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label='Toggle menu'
          >
            <svg
              className={`w-6 h-6 transition-transform duration-300 ${
                isMobileMenuOpen ? 'rotate-90' : ''
              }`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M6 18L18 6M6 6l12 12'
                />
              ) : (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M4 6h16M4 12h16M4 18h16'
                />
              )}
            </svg>
          </button>

          <Link
            href={`/profile/${user.id}`}
            className='flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 transform hover:scale-105 active:scale-95'
          >
            <Image
              src={getProfileImageUrl(user.profileImage ?? '')}
              alt='User Avatar'
              width={40}
              height={40}
              className='rounded-full w-10 h-10 object-cover object-center'
            />
          </Link>
        </div>

        {/* Mobile Search Bar - Appears when search is clicked */}
        {isSearchOpen && (
          <div
            data-mobile-search
            className='fixed top-16 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg p-4 lg:hidden z-30 shadow-lg border-b border-gray-200/80 dark:border-gray-700/80 animate-slideDown origin-top'
          >
            <form onSubmit={handleSearch} className='relative'>
              <input
                type='text'
                placeholder='Search...'
                className='w-full px-4 py-3.5 pr-20 rounded-xl text-gray-800 dark:text-gray-200 bg-gray-50/90 dark:bg-gray-800/90 border-2 border-gray-200/80 dark:border-gray-700/80 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none shadow-md hover:shadow-lg transition-all duration-300'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
              />
              {searchTerm && (
                <button
                  type='button'
                  onClick={clearSearch}
                  className='absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'
                  aria-label='Clear search'
                >
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              )}
              <button
                type='submit'
                className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'
                aria-label='Search'
              >
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu - Appears when hamburger is clicked */}
        {isMobileMenuOpen && (
          <div
            data-mobile-menu
            className='fixed top-16 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg lg:hidden z-30 shadow-lg border-b border-gray-200/80 dark:border-gray-700/80 animate-slideDown origin-top'
          >
            <div className='px-4 py-6 space-y-1'>
              {/* Mobile Navigation Links */}
              {[
                { href: '/home', label: 'Home' },
                { href: '/tutors', label: 'Tutors' },
                { href: '/meeting', label: 'Meeting' },
                { href: '/chats', label: 'Chats' },
                ...(user?.role !== 'TEACHER'
                  ? [{ href: '/create-post', label: 'Create Post' }]
                  : [])
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                    pathname === item.href
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Divider */}
              <div className='border-t border-gray-200 dark:border-gray-700 my-4'></div>

              {/* User Info Section */}
              <div className='px-4 py-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200/80 dark:border-gray-700/80'>
                <div className='flex items-center space-x-3 mb-4'>
                  <div className='h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 p-0.5 shadow-md'>
                    <Image
                      src={getProfileImageUrl(user.profileImage ?? '')}
                      alt={user.name}
                      width={48}
                      height={48}
                      className='h-full w-full rounded-full object-cover'
                    />
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>
                      {user.name}
                    </p>
                    <p className='text-xs text-gray-600 dark:text-gray-400 font-medium truncate'>
                      {user.role || 'User'}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className='space-y-2'>
                  <Link
                    href={`/profile/${user.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className='flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 mr-3 text-gray-500 dark:text-gray-500'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                    </svg>
                    View Profile
                  </Link>

                  <Link
                    href='/change-password'
                    onClick={() => setIsMobileMenuOpen(false)}
                    className='flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 mr-3 text-gray-500 dark:text-gray-500'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                      />
                    </svg>
                    Change Password
                  </Link>

                  <Link
                    href='/change-email'
                    onClick={() => setIsMobileMenuOpen(false)}
                    className='flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 mr-3 text-gray-500 dark:text-gray-500'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      />
                    </svg>
                    Change Email
                  </Link>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className='w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 mr-3 text-red-500'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Navigation */}
        <div className='hidden lg:flex items-center space-x-8'>
          {/* Main Navigation */}
          <ul className='flex space-x-2'>
            {[
              { href: '/home', label: 'Home' },
              { href: '/tutors', label: 'Tutors' },
              { href: '/meeting', label: 'Meeting' },
              { href: '/chats', label: 'Chats' },
              ...(user?.role !== 'TEACHER'
                ? [{ href: '/create-post', label: 'Create Post' }]
                : [])
            ].map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`px-4 py-2.5 rounded-lg inline-block transition-all duration-300 relative ${
                    pathname === item.href
                      ? ' font-semibold shadow-lg scale-105 text-blue-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-gray-100 hover:scale-105'
                  }`}
                >
                  {item.label}
                  {pathname === item.href && (
                    <span className='absolute bottom-0 left-0 right-0 h-1 bg-blue-400 dark:bg-blue-500 rounded-b-lg'></span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Search Form */}
          <div className='relative group'>
            <form onSubmit={handleSearch} className='relative'>
              <input
                type='text'
                placeholder='Search...'
                className='w-72 px-4 py-2.5 pr-20 rounded-xl text-gray-800 dark:text-gray-200 bg-gray-50/90 dark:bg-gray-800/90 border-2 border-gray-200/80 dark:border-gray-700/80 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type='button'
                  onClick={clearSearch}
                  className='absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200'
                  aria-label='Clear search'
                >
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              )}
              <button
                type='submit'
                className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200'
                aria-label='Search'
              >
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </form>
          </div>

          {/* Theme Toggle Desktop */}
          <ThemeToggle />

          {/* Profile Dropdown */}
          <div className='relative group'>
            <button
              className='flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 transform group-hover:scale-110 border-2 border-blue-300 dark:border-gray-600/80 hover:border-gray-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:ring-opacity-50 shadow-md'
              aria-label='User menu'
            >
              <Image
                src={getProfileImageUrl(user.profileImage ?? '')}
                alt='User Avatar'
                width={44}
                height={44}
                className='h-full w-full rounded-full object-cover'
                onError={e => {
                  const target = e.target as HTMLImageElement
                  target.src = APP_CONFIG.DEFAULT_AVATAR
                }}
              />
            </button>

            <div className='absolute right-0 mt-3 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right -translate-y-2 group-hover:translate-y-0 z-50'>
              <div className='py-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-200/80 dark:border-gray-700/80 ring-1 ring-black/5 overflow-hidden'>
                <div className='px-4 py-3 border-b border-gray-200/80 dark:border-gray-700/80 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center space-x-3'>
                  <div className='h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 p-0.5 shadow-md'>
                    <Image
                      src={getProfileImageUrl(user.profileImage ?? '')}
                      alt={user.name}
                      width={48}
                      height={48}
                      className='h-full w-full rounded-full object-cover'
                    />
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>
                      {user.name}
                    </p>
                    <p className='text-xs text-gray-600 dark:text-gray-400 font-medium truncate'>
                      {user.role || 'User'}
                    </p>
                  </div>
                </div>

                <div className='py-1'>
                  <Link
                    href={`/profile/${user.id}`}
                    className='flex px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors items-center group/item'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5 mr-3 text-gray-500 dark:text-gray-500 group-hover:item:text-gray-700 dark:group-hover/item:text-gray-300 transition-colors'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                    </svg>
                    Profile
                  </Link>

                  <Link
                    href='/change-password'
                    className='flex px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors items-center group/item'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5 mr-3 text-gray-500 dark:text-gray-500 group-hover:item:text-gray-700 dark:group-hover/item:text-gray-300 transition-colors'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                      />
                    </svg>
                    Change password
                  </Link>

                  <Link
                    href='/change-email'
                    className='flex px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors items-center group/item'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5 mr-3 text-gray-500 dark:text-gray-500 group-hover:item:text-gray-700 dark:group-hover/item:text-gray-300 transition-colors'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      />
                    </svg>
                    Change email
                  </Link>
                </div>

                <div className='border-t border-gray-200 dark:border-gray-700 my-1'></div>

                <button
                  onClick={handleLogout}
                  className='w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center group/item'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5 mr-3 text-red-500 group-hover:item:text-red-600 transition-colors'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
