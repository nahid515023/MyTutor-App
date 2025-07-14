'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import RegistrationForm from '@/components/auth/RegistrationForm'
import Navbar from '@/components/Navbar'
import { FooterPage } from '@/components/FooterPage'
export default function StudentSignupPage() {
  const { setTheme } = useTheme()

  // Set light theme on component mount
  useEffect(() => {
    setTheme('light')
  }, [setTheme])

  return (  
    <>
      <Navbar />
      <RegistrationForm 
        role="STUDENT"
        title="Sign Up"
        subtitle="Create your account as a Student!"
      />
      <FooterPage />
    </>
  )
}
