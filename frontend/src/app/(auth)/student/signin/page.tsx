'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import LoginForm from '@/components/auth/LoginForm'
import { FooterPage } from '@/components/FooterPage'
import Navbar from '@/components/Navbar'
export default function StudentLoginPage() {
  const { setTheme } = useTheme()

  // Set light theme on component mount
  useEffect(() => {
    setTheme('light')
  }, [setTheme])

  return (
    <>
      <Navbar />
      <LoginForm 
        role="STUDENT"
        title="Sign In"
        subtitle="Welcome Back Student!"
      />
      <FooterPage />
    </>
  )
}
