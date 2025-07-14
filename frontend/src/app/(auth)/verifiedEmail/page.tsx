'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/_lib/api'
import { showToast } from '@/utils/toastService'
import { FooterPage } from '@/components/FooterPage'
import Navbar from '@/components/Navbar'
const EmailVerificationTemplate = () => {
  const [otp, setOtp] = useState(['', '', '', ''])
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const router = useRouter()

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!/^\d?$/.test(value)) return // Ensure only digits

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyEmail = async () => {
    const otpCode = otp.join('')
    console.log(otpCode)
    try {
      await api.put('/auth/verify', { otpCode })
      router.push('/home')
    } catch (e) {
      showToast('error', 'Invalid OTP. Please try again.')
      console.log(e)
    }
  }

  return (
    <>
    <Navbar />
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4'>
      <div className='w-full max-w-md bg-white p-8 rounded-2xl shadow-lg transform transition-all duration-300 hover:shadow-xl'>
        <h1 className='text-3xl font-bold text-center text-blue-600 mb-6 font-sans'>Verify Your Email</h1>
        <p className='text-gray-600 text-center mb-8 text-lg'>Enter the 4-digit OTP sent to your email.</p>

        <div className='flex justify-center gap-4 mb-8'>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => {
                inputRefs.current[index] = el;
              }}
              maxLength={1}
              value={digit}
              onChange={e => handleChange(index, e)}
              onKeyDown={e => handleKeyDown(index, e)}
              className='w-14 h-14 text-center text-2xl border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50'
            />
          ))}
        </div>

        <button
          onClick={handleVerifyEmail}
          className='w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg'
        >
          Verify Email
        </button>
      </div>
    </div>
    <FooterPage />
    </>
  )
}

export default EmailVerificationTemplate
