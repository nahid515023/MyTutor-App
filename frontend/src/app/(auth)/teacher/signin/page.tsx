'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import LoginForm from '@/components/auth/LoginForm'
import Navbar from '@/components/Navbar'
import { FooterPage } from '@/components/FooterPage'
export default function TeacherLoginPage() {
  const { setTheme } = useTheme()

  // Set light theme on component mount
  useEffect(() => {
    setTheme('light')
  }, [setTheme])

  return (
    <>
      <Navbar />
      <LoginForm 
        role="TEACHER"
        title="Sign In"
        subtitle="Welcome Back Teacher!"
      />
      <FooterPage />
    </>
  )
}
