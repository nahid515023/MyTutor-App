'use client'
import { LandingPage } from '../components/LandingPage'
import { useTheme } from 'next-themes'  
import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import { FooterPage } from '../components/FooterPage'
export default function Home() {
  const {setTheme } = useTheme()
  useEffect(() => {
    setTheme('light')
  }, [setTheme])

  return(
    <div>
      <Navbar />
      <LandingPage />
      <FooterPage />
    </div>
  )
}
