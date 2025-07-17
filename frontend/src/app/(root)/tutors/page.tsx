'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { api } from '@/_lib/api'
import Cookies from 'js-cookie'
import { showToast } from '@/utils/toastService'
import { getProfileImageUrl } from '@/utils/getProfileImage'

interface Tutor {
  id: number
  name: string
  skills: string
  profileImage: string
  role: string
  totalRating: string
  averageRating: number
}

interface ApiResponse {
  tutors: Tutor[]
}

export default function TutorsPage () {
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [filteredTutors, setfilteredTutors] = useState<Tutor[]>([])
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Extract unique skills from tutors
  const allSkills = Array.from(
    new Set(
      tutors.flatMap(tutor =>
        tutor.skills
          ? tutor.skills.split('#').filter(skill => skill.trim() !== '')
          : []
      )
    )
  )
  // Get logged in user id from cookies
  useEffect(() => {
    const cookies = Cookies.get('user')
    if (cookies) {
      try {
        // Handle the case where cookie might start with 'j:' (some cookie parsers add this)
        const sanitizedCookies = cookies.startsWith('j:')
          ? cookies.substring(2)
          : cookies
        const parsedCookies = JSON.parse(sanitizedCookies)

        // Type guard to ensure the parsed data has the expected structure
        if (
          parsedCookies &&
          typeof parsedCookies === 'object' &&
          'id' in parsedCookies
        ) {
          setCurrentUserId(Number(parsedCookies.id) || null)
        } else {
          console.warn('Invalid user data structure in cookies')
          setCurrentUserId(null)
        }
      } catch (error) {
        console.error('Error parsing user cookie:', error)
        setCurrentUserId(null)
      }
    } else {
      setCurrentUserId(null)
    }
  }, [])

  // Fetch tutors
  useEffect(() => {
    console.log('Fetching tutors...')
    const fetchTutors = async () => {
      setIsLoading(true)
      try {
        const response = await api.get<ApiResponse>('/profile/allTutors')
        console.log(response.data)

        if (response.data && Array.isArray(response.data.tutors)) {
          setTutors(response.data.tutors)
          setfilteredTutors(response.data.tutors)
        }
      } catch (error) {
        console.error('Error fetching tutors:', error)
        showToast('error', 'Failed to load tutors')
      } finally {
        setIsLoading(false)
      }
    }
    fetchTutors()
  }, [])

  // Apply filters when any filter changes
  useEffect(() => {
    let result = [...tutors]

    // Filter by search term
    if (searchTerm) {
      result = result.filter(tutor =>
        tutor.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by skill
    if (selectedSkill) {
      result = result.filter(
        tutor =>
          tutor.skills &&
          tutor.skills
            .split('#')
            .some(skill =>
              skill.toLowerCase().includes(selectedSkill.toLowerCase())
            )
      )
    }

    // Filter by rating
    if (minRating > 0) {
      result = result.filter(tutor => (tutor.averageRating || 0) >= minRating)
    }

    setfilteredTutors(result)
  }, [searchTerm, selectedSkill, minRating, tutors])

  const handleChat = async (contactUserId: number) => {
    try {
      const res = await api.post<{ message: string }>(
        `/chat/users/connect/${contactUserId}`
      )
      if (res.status === 202) {
        router.push('/chats')
      } else if (res.data.message && res.status === 200) {
        router.push('/chats')
      } else {
        showToast('error', res.data.message || 'Failed to start chat')
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || error.message
          : 'Error connecting chat!'
      showToast('error', errorMessage)
      console.error('Error connecting chat:', error)
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedSkill('')
    setMinRating(0)
  }

  return (
    <div className='min-h-screen mt-4'>
      <div className='container mx-auto px-4 max-w-7xl min-h-screen'>
        {/* Filter Section */}
        <div className='bg-white dark:bg-blue-900 rounded-2xl shadow-lg px-8 py-4 mb-4 transform transition-all duration-300 hover:shadow-xl border-t-4 border-blue-500 dark:border-blue-400'>
          <h3 className='text-xl font-semibold text-gray-800 dark:text-blue-200 mb-6 flex items-center'>
            <span className='w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center mr-3'>
              <svg
                className='w-5 h-5 text-blue-500 dark:text-blue-300'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
                />
              </svg>
            </span>
            Filter Tutors
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            {/* Search by name */}
            <div className='relative'>
              <label className='block text-sm font-medium text-gray-700 dark:text-blue-300 mb-2'>
                Search by Name
              </label>
              <div className='relative'>
                <input
                  type='text'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder='Search tutors...'
                  className='w-full px-4 py-3 border border-gray-300 dark:border-blue-600 rounded-xl bg-white dark:bg-blue-800 text-gray-800 dark:text-blue-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all duration-200 shadow-sm hover:shadow-md'
                />
                <svg
                  className='w-5 h-5 text-gray-400 dark:text-blue-500 absolute right-3 top-1/2 transform -translate-y-1/2'
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
              </div>
            </div>

            {/* Filter by skill */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-blue-300 mb-2'>
                Filter by Skill
              </label>
              <select
                value={selectedSkill}
                onChange={e => setSelectedSkill(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 dark:border-blue-600 rounded-xl bg-white dark:bg-blue-800 text-gray-800 dark:text-blue-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all duration-200 shadow-sm hover:shadow-md appearance-none'
              >
                <option value=''>All Skills</option>
                {allSkills.length > 0 &&
                  allSkills.map((skill, index) => (
                    <option key={index} value={skill}>
                      {skill}
                    </option>
                  ))}
              </select>
            </div>

            {/* Filter by rating */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-blue-300 mb-2'>
                Minimum Rating
              </label>
              <select
                value={minRating}
                onChange={e => setMinRating(Number(e.target.value))}
                className='w-full px-4 py-3 border border-gray-300 dark:border-blue-600 rounded-xl bg-white dark:bg-blue-800 text-gray-800 dark:text-blue-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all duration-200 shadow-sm hover:shadow-md appearance-none'
              >
                <option value={0}>Any Rating</option>
                <option value={1}>⭐ and above</option>
                <option value={2}>⭐⭐ and above</option>
                <option value={3}>⭐⭐⭐ and above</option>
                <option value={4}>⭐⭐⭐⭐ and above</option>
                <option value={5}>⭐⭐⭐⭐⭐</option>
              </select>
            </div>

            {/* Reset button */}
            <div className='flex items-end'>
              <button
                onClick={resetFilters}
                className='w-full px-4 py-3 bg-gray-100 dark:bg-blue-800 text-gray-700 dark:text-blue-300 rounded-xl hover:bg-gray-200 dark:hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2'
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                  />
                </svg>
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className='flex justify-between items-center mb-2'>
          <div className='flex items-center'>
            <div className='w-1 h-8 bg-blue-500 dark:bg-blue-600 rounded-r mr-3'></div>
            <p className='text-gray-600 dark:text-gray-400 font-medium'>
              Showing{' '}
              <span className='font-bold text-blue-600 dark:text-blue-400'>
                {filteredTutors.length}
              </span>{' '}
              of <span className='font-bold'>{tutors.length}</span> tutors
            </p>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className='flex flex-col justify-center items-center h-96 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700'>
            <div className='relative'>
              <div className='absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-amber-500 dark:from-blue-600 dark:to-amber-600 blur-xl opacity-20 animate-pulse'></div>
              <div className='relative animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 dark:border-blue-400'></div>
            </div>
            <div className='mt-8 text-center'>
              <h3 className='text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2'>
                Finding Your Tutors
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                We&apos;re matching you with the perfect tutors for your
                needs...
              </p>
            </div>
            <div className='mt-6 flex gap-2'>
              <div
                className='w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce'
                style={{ animationDelay: '0ms' }}
              ></div>
              <div
                className='w-3 h-3 rounded-full bg-amber-500 dark:bg-amber-400 animate-bounce'
                style={{ animationDelay: '150ms' }}
              ></div>
              <div
                className='w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce'
                style={{ animationDelay: '300ms' }}
              ></div>
            </div>
          </div>
        ) : filteredTutors.length === 0 ? (
          <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center transform transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700'>
            <div className='relative w-24 h-24 mx-auto mb-6'>
              <div className='absolute inset-0 bg-amber-500/10 dark:bg-amber-500/20 rounded-full blur-lg'></div>
              <div className='relative w-24 h-24 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center'>
                <svg
                  className='w-12 h-12 text-amber-500 dark:text-amber-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
            </div>
            <h3 className='text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3'>
              No Matching Tutors
            </h3>
            <p className='text-gray-600 dark:text-gray-400 text-lg mb-6 max-w-md mx-auto'>
              We couldn&apos;t find any tutors that match your current filters.
              Try adjusting your search criteria.
            </p>
            <button
              onClick={resetFilters}
              className='px-8 py-3 bg-gradient-to-r from-blue-500 to-amber-500 dark:from-blue-600 dark:to-amber-600 text-white rounded-xl hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
            {filteredTutors.length > 0 &&
              filteredTutors.map(tutor => (
                <div
                  key={tutor.id}
                  className='bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:translate-y-[-5px] border border-gray-200 dark:border-gray-700'
                >
                  <div className='flex flex-col items-center p-6 relative'>
                    <div className='relative mb-4'>
                      <div className='absolute -top-2 -left-2 w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-full opacity-50 blur-md'></div>
                      <div className='relative w-24 h-24 rounded-full overflow-hidden ring-[3px] ring-white dark:ring-gray-800 shadow-xl'>
                        <Image
                          className='w-full h-full object-cover'
                          src={
                            tutor.profileImage.startsWith('http')
                              ? `${tutor.profileImage}`
                              : `${process.env.NEXT_PUBLIC_API_URL_IMAGE}${tutor.profileImage}`
                          }
                          alt={`${tutor.name} profile`}
                          width={96}
                          height={96}
                          priority
                        />
                      </div>
                    </div>

                    <h5
                      className='mb-1 text-xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 text-center'
                      onClick={() => router.push(`/profile/${tutor.id}`)}
                    >
                      {tutor.name}
                    </h5>

                    <div className='flex items-center gap-1 px-3 py-1 rounded-full mb-3'>
                      <span className='text-amber-500 text-lg'>★</span>
                      <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        {tutor.averageRating
                          ? tutor.averageRating.toFixed(1)
                          : '0.0'}
                      </span>
                    </div>

                    {/* Skills */}
                    <div className='flex flex-wrap gap-1.5 justify-center mt-1 mb-4 px-2'>
                      {tutor.skills &&
                        tutor.skills.length > 0 &&
                        tutor.skills
                          .split('#')
                          .filter(skill => skill.trim() !== '')
                          .slice(0, 3)
                          .map((skill, index) => (
                            <span
                              key={index}
                              className='text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-lg'
                            >
                              {skill}
                            </span>
                          ))}
                      {tutor.skills &&
                        tutor.skills
                          .split('#')
                          .filter(skill => skill.trim() !== '').length > 3 && (
                          <span className='text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 px-2 py-0.5 rounded-lg'>
                            +
                            {tutor.skills
                              .split('#')
                              .filter(skill => skill.trim() !== '').length - 3}
                          </span>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className='w-full mt-3 grid grid-cols-2 gap-3'>
                      <button
                        onClick={() => router.push(`/profile/${tutor.id}`)}
                        className='px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-1'
                      >
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                          />
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                          />
                        </svg>
                        Profile
                      </button>
                      {currentUserId !== tutor.id ? (
                        <button
                          onClick={() => handleChat(tutor.id)}
                          className='px-3 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 flex items-center justify-center gap-1'
                        >
                          <svg
                            className='w-4 h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                            />
                          </svg>
                          Message
                        </button>
                      ) : (
                        <div className='px-3 py-2 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center'>
                          <span className='w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse'></span>
                          Your Profile
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
