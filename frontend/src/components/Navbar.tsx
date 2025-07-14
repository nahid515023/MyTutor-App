import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { FaGraduationCap, FaChevronDown } from 'react-icons/fa'
import { HiMenu, HiX } from 'react-icons/hi'

type DropdownType = 'signin' | 'signup' | null

export default function Navbar () {
  const router = useRouter()
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const signInRef = useRef<HTMLDivElement>(null)
  const signUpRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        signInRef.current &&
        !signInRef.current.contains(event.target as Node) &&
        signUpRef.current &&
        !signUpRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [])

  const toggleDropdown = (dropdown: DropdownType) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  const closeDropdowns = () => {
    setActiveDropdown(null)
  }

  const handleSignUpTeacher = () => {
    router.push(`/teacher/signup`)
    closeDropdowns()
  }

  const handleSignUpStudent = () => {
    router.push(`/student/signup`)
    closeDropdowns()
  }

  const handleSignIn = (type: 'student' | 'teacher') => {
    if (type === 'student') {
      router.push('/student/signin')
    } else {
      router.push('/teacher/signin')
    }
    closeDropdowns()
  }

  return (
    <nav className='shadow-lg border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-20'>
          <div
            className='flex-shrink-0 flex items-center gap-1 cursor-pointer'
            onClick={() => router.push('/')}
          >
            <FaGraduationCap className='text-3xl font-semibold text-blue-600' />
            <span className='text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 transition-all duration-300'>
              MyTutor
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className='hidden md:flex items-center gap-3'>
            <div className='relative' ref={signInRef}>
              <button
                onClick={() => toggleDropdown('signin')}
                className='bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 flex items-center gap-2'
                aria-expanded={activeDropdown === 'signin'}
                aria-haspopup="true"
              >
                Sign In
                <FaChevronDown className={`text-xs transition-transform duration-200 ${activeDropdown === 'signin' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'signin' && (
                <div className='absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200'>
                  <button
                    onClick={() => handleSignIn('student')}
                    className='w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-600 transition-colors duration-150'
                  >
                    Login as Student
                  </button>
                  <button
                    onClick={() => handleSignIn('teacher')}
                    className='w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-600 transition-colors duration-150'
                  >
                    Login as Teacher
                  </button>
                </div>
              )}
            </div>

            <div className='relative' ref={signUpRef}>
              <button
                onClick={() => toggleDropdown('signup')}
                className='bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/30 flex items-center gap-2'
                aria-expanded={activeDropdown === 'signup'}
                aria-haspopup="true"
              >
                Sign Up
                <FaChevronDown className={`text-xs transition-transform duration-200 ${activeDropdown === 'signup' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'signup' && (
                <div className='absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200'>
                  <button
                    onClick={() => handleSignUpStudent()}
                    className='w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 hover:text-violet-600 transition-colors duration-150'
                  >
                    Join as Student
                  </button>
                  <button
                    onClick={() => handleSignUpTeacher()}
                    className='w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 hover:text-violet-600 transition-colors duration-150'
                  >
                    Join as Teacher
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className='md:hidden'>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500'
              aria-expanded={isMobileMenuOpen}
            >
              <span className='sr-only'>{isMobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMobileMenuOpen ? (
                <HiX className='block h-6 w-6' aria-hidden='true' />
              ) : (
                <HiMenu className='block h-6 w-6' aria-hidden='true' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className='px-2 pt-2 pb-3 space-y-1 border-t border-gray-200'>
            <button
              onClick={() => {
                handleSignIn('student')
                setIsMobileMenuOpen(false)
              }}
              className='w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-600 transition-colors duration-150 rounded-lg'
            >
              Login as Student
            </button>
            <button
              onClick={() => {
                handleSignIn('teacher')
                setIsMobileMenuOpen(false)
              }}
              className='w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-600 transition-colors duration-150 rounded-lg'
            >
              Login as Teacher
            </button>
            <div className='border-t border-gray-200 my-2' />
            <button
              onClick={() => {
                handleSignUpStudent()
                setIsMobileMenuOpen(false)
              }}
              className='w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 hover:text-violet-600 transition-colors duration-150 rounded-lg'
            >
              Join as Student
            </button>
            <button
              onClick={() => {
                handleSignUpTeacher()
                setIsMobileMenuOpen(false)
              }}
              className='w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 hover:text-violet-600 transition-colors duration-150 rounded-lg'
            >
              Join as Teacher
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
