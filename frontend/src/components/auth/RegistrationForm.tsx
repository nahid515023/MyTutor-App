'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaUser, FaEnvelope, FaLock, FaEyeSlash, FaEye } from 'react-icons/fa6'
import Link from 'next/link'
import { api } from '@/_lib/api'
import { showToast } from '@/utils/toastService'
import GoogleAuth from '@/components/auth/GoogleAuth'
import Image from 'next/image'


// Reusable Error Message Component
const ErrorMessage = ({ message }: { message: string }) => (
  <p className="text-red-500 dark:text-red-400 text-sm mt-1 text-center animate-fadeIn">{`${message}. Please try again.`}</p>
)

interface RegistrationFormProps {
  role: 'STUDENT' | 'TEACHER'
  title?: string
  subtitle?: string
}

export default function RegistrationForm({ 
  role, 
  title = 'Create Account', 
  subtitle = 'Please fill in your details to register' 
}: RegistrationFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string>('')
  const [isIncorrectInput, setIsIncorrectInput] = useState(false)
  const [showError, setShowError] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleError = (err: any) => {
    if (err.response && err.response.data) {
      setShowError(err.response.data.message || 'Registration failed')
      setIsIncorrectInput(true)
    } else if (err.request) {
      showToast('error', 'No Response from Server!')
    } else {
      showToast('error', 'Unexpected Error!')
    }
  }

  const handleRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('role', role)
      if (profileImage) {
        formData.append('profileImage', profileImage)
      }

      const response = await api.post<{ message: string }>('auth/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      if(response.status === 201) {
        router.push('/verifiedEmail')
        setIsIncorrectInput(false)
      }
      else{
        showToast('error', response.data.message || 'Registration Failed!')
      }
    } catch (err) {
      handleError(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center px-4 py-4 bg-gray-50 dark:bg-gray-900'>
      <div className='w-full max-w-md'>
        <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden'>
          <div className='px-8 pt-8 pb-3'>
            <div className='text-center'>
              <h2 className='text-3xl font-bold mb-2 text-blue-500 dark:text-blue-400'>{title}</h2>
              <p className='text-gray-600 dark:text-gray-300 text-sm'>{subtitle}</p>
            </div>
          </div>

          <div className='px-8'>
            <form className='space-y-6' onSubmit={handleRegistration}>
              <div className='space-y-3'>
                <div className='flex flex-col items-center space-y-4'>
                  <div className='relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600'>
                    {profilePreview ? (
                      <Image
                        src={profilePreview}
                        alt="Profile Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className='w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center'>
                        <FaUser className='w-12 h-12 text-gray-400 dark:text-gray-500' />
                      </div>
                    )}
                  </div>
                  <input
                    type='file'
                    id='profileImage'
                    accept='image/*'
                    className='hidden'
                    onChange={handleImageChange}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor='profileImage'
                    className='cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300'
                  >
                    Upload Profile Picture
                  </label>
                </div>

                {/* Name Input */}
                <div className='space-y-2'>
                  <label htmlFor='name' className='block text-sm font-semibold text-gray-700 dark:text-gray-300'>
                    Full Name
                  </label>
                  <div className='relative group'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <FaUser className='h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors' />
                    </div>
                    <input
                      id='name'
                      type='text'
                      required
                      className='w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/50 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                      placeholder='Enter your full name'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className='space-y-2'>
                  <label htmlFor='email' className='block text-sm font-semibold text-gray-700 dark:text-gray-300'>
                    Email Address
                  </label>
                  <div className='relative group'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <FaEnvelope className='h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors' />
                    </div>
                    <input
                      id='email'
                      type='email'
                      required
                      className='w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/50 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                      placeholder='Enter your email address'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>


                {/* Password Input */}
                <div className='space-y-2'>
                  <label htmlFor='password' className='block text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  Password
                  </label>
                  <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <FaLock className='h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors' />
                  </div>
                  <input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    required
                    className='w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/50 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    placeholder='Create a password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                    <FaEyeSlash className='h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300' />
                    ) : (
                    <FaEye className='h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300' />
                    )}
                  </button>
                  </div>
                </div>
              </div>

              {isIncorrectInput && <ErrorMessage message={showError} />}

              <button
                type='submit'
                disabled={isLoading}
                className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              >
                {isLoading ? (
                  <div className='flex items-center justify-center'>
                    <svg
                      className='animate-spin h-5 w-5 mr-3'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Registering...
                  </div>
                ) : (
                  'Register'
                )}
              </button>

              <div className='relative my-8'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-200 dark:border-gray-600'></div>
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium'>
                    Or continue with
                  </span>
                </div>
              </div>

              <div className='space-y-3'>
                <GoogleAuth role={role} />
              </div>
            </form>
          </div>

          <div className='px-8 py-6 mt-8 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600'>
            <p className='text-center text-sm text-gray-600 dark:text-gray-300'>
              Already have an account?{' '}
              <Link
                href={`/${role === 'STUDENT' ? 'student' : 'teacher'}/signin`}
                className='font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors'
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className='mt-6 text-center'>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            By registering, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}