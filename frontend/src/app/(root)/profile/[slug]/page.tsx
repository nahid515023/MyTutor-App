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
        const response = await api.get<{ user: User }>(`/profile/${slug}`)
        setUser(response.data.user)
      } catch (error) {
        console.log(error)
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

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300'>
      <div className='flex flex-col w-8/12 mx-auto pt-4 pb-8'>
        {user && (
          <CoverAndProfilePic userData={user} isUserProfile={isUserProfile} />
        )}
        <div className='mt-6 transform duration-200 ease-in-out flex flex-col lg:flex-row gap-6 h-full'>
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
