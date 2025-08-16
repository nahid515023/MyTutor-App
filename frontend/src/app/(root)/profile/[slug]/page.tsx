'use client'
import AboutComponent from '@/components/about'
import FeedbackComponent from '@/components/feedback'
import CoverAndProfilePic from '@/components/coverAndProfilePic'
import MyPost from '@/components/mypost'
import { api } from '@/_lib/api'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { useParams } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role: string
  profileImage: string
  coverImage: string
  bio: string
  createdAt: string
  updatedAt: string
  gender: string
  phone: string
  location: string
  grade: string
  education: string[]
}

export default function ProfilePage() {
  // Get the slug from params using the useParams hook
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  
  const [user, setUser] = useState<User | null>(null)
  const [isUserProfile, setIsUserProfile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const cookies = Cookies.get('user')
    if (cookies) {
      const user = JSON.parse(cookies)
      setIsUserProfile(user.id === slug)
    }
  }, [slug])

  // Fetch user data based on the slug
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true)
        const response = await api.get<{ user: User }>(`/profile/${slug}`)
        setUser(response.data.user)
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [slug])

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const role = user?.role;

  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center'>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:text-slate-200 transition-colors duration-300'>
      <div className='flex flex-col w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8'>
        {user && (
          <CoverAndProfilePic userData={user} isUserProfile={isUserProfile} />
        )}
        <div className='mt-4 transform duration-200 ease-in-out flex flex-col lg:flex-row gap-4 h-full'>
          {user && (
            <AboutComponent userData={user} isUserProfile={isUserProfile} />
          )}
          {user && role === 'TEACHER' ? (
            <FeedbackComponent userData={user} isUserProfile={isUserProfile} />
          ) : (
            user && <MyPost userData={user} isUserProfile={isUserProfile} />
          )}
        </div>
      </div>
    </div>
  )
}
