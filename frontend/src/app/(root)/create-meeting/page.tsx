'use client'
import { useState, useEffect } from 'react'
import { api } from '@/_lib/api'
import { useRouter, useSearchParams } from 'next/navigation'
import { showToast } from '@/utils/toastService'
import { randomID } from '@/utils/randomIDGenerator'
import {
  HiOutlineLink,
  HiOutlineCalendar,
  HiOutlineClock
} from 'react-icons/hi'
import { MdOutlineTitle } from 'react-icons/md'
import { BsFillInfoCircleFill } from 'react-icons/bs'

type Meeting = {
  userId: string
  teacherId: string
  postId: string
  start: string
  end: string
  link: string
  date: string
  title: string
}

type Post = {
  id: string
  userId: string
  booked: boolean
  preferableDate?: string
  preferableTime?: string
}

export default function CreateMeeting () {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  // Get parameters from URL query params
  const postId = searchParams.get('postId')
  const userId = searchParams.get('userId')
  const teacherId = searchParams.get('teacherId')

  // Create state for the post and teacher
  const [post, setPost] = useState<Post>({
    id: postId || '',
    userId: userId || '',
    booked: false
  })

  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingLink, setMeetingLink] = useState(generateRandomMeetingLink())
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingStartTime, setMeetingStartTime] = useState('')
  const [meetingEndTime, setMeetingEndTime] = useState('')



  function generateRandomMeetingLink (): string {
    const roomID = randomID(8)
    return (
      window.location.protocol +
      '//' +
      window.location.host +
      '/meeting-room' +
      '/' +
      roomID
    )
  }

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (postId) {
        try {
          const response = await api.get<Post>(`/posts/${postId}`)
          if (response.data) {
            setPost(response.data)
            console.log('Post details fetched:', response.data)
            
            // Set meeting date from post's preferableDate
            if (response.data.preferableDate) {
              setMeetingDate(response.data.preferableDate)
              console.log('Meeting date set to:', response.data.preferableDate)
            }
            
            // Parse and set meeting times from post's preferableTime
            if (response.data.preferableTime) {
              const timeRange = response.data.preferableTime.trim().split(' - ')
              console.log('Time range parsed:', timeRange)
              if (timeRange.length === 2) {
                const startTime = timeRange[0].trim()
                const endTime = timeRange[1].trim()
                setMeetingStartTime(startTime)
                setMeetingEndTime(endTime)
                console.log('Meeting times set - Start:', startTime, 'End:', endTime)
              }
            }
          } else {
            showToast('error', 'Post not found')
          }
        } catch (error) {
          console.error('Error fetching post details:', error)
          showToast('error', 'Error fetching post details')
        }
      }
    }
    fetchPostDetails()
  }, [postId])

  const handleCreateMeeting = async () => {
    try {
      setIsLoading(true)
      // Validation
      if (
        !meetingTitle ||
        !meetingLink ||
        !meetingDate ||
        !meetingStartTime ||
        !meetingEndTime
      ) {
        showToast('error', 'Please fill in all fields')
        setIsLoading(false)
        return
      }

      const meetingData: Meeting = {
        userId: userId || post.userId,
        teacherId: teacherId || ' ',
        postId: postId || post.id,
        title: meetingTitle,
        start: meetingStartTime,
        end: meetingEndTime,
        link: meetingLink,
        date: meetingDate
      }
      const res = await api.post<{ message: string }>(
        `/meeting/create`,
        meetingData
      )
      if (res.data.message && res.status === 200) {
        await api.put<{ message: string }>(`/posts/booked/${postId  || post.id}`)
        setPost({ ...post, booked: true })
        setMeetingLink('')
        setMeetingDate('')
        setMeetingStartTime('')
        setMeetingEndTime('')
        showToast('success', res.data.message)
        // Optionally redirect to meetings page
        router.push(`/post/${postId}`)
      } else {
        showToast('error', res.data.message)
      }
    } catch (error) {
      showToast('error', 'Error creating meeting!')
      console.error('Error creating meeting:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex mx-auto min-h-screen justify-center items-start mt-16 p-8'>
      <div className='modal-box bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 max-w-md w-full transform transition-all duration-300 hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20 backdrop-blur-sm'>
        <div className='bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-xl -mt-5 -mx-5 mb-6 py-6 px-6 relative overflow-hidden'>
          <div className='absolute inset-0 opacity-10'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='100%'
              height='100%'
              viewBox='0 0 100 100'
            >
              <defs>
                <pattern
                  id='grid'
                  width='10'
                  height='10'
                  patternUnits='userSpaceOnUse'
                >
                  <path
                    d='M 10 0 L 0 0 0 10'
                    fill='none'
                    stroke='white'
                    strokeWidth='0.5'
                  />
                </pattern>
              </defs>
              <rect width='100%' height='100%' fill='url(#grid)' />
            </svg>
          </div>
          <div className='absolute -right-5 -top-5 w-20 h-20 bg-white bg-opacity-10 rounded-full'></div>
          <div className='absolute -left-10 -bottom-10 w-32 h-32 bg-white bg-opacity-10 rounded-full'></div>
          <h3 className='font-bold text-2xl text-white relative z-10'>
            Create Meeting
          </h3>
          <p className='text-blue-100 text-sm mt-1 relative z-10'>
            Schedule a session with your student
          </p>
        </div>
        <div className='flex flex-col gap-5 mt-8 px-2'>
          <div className='relative'>
            <label
              htmlFor='meetingTitle'
              className='block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'
            >
              Meeting Title
            </label>
            <div className='relative'>
              <input
                type='text'
                id='meetingTitle'
                className='px-4 py-3 pl-10 w-full text-gray-700 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all duration-200 dark:text-gray-200 hover:border-blue-300 dark:hover:border-blue-700'
                placeholder='Enter a descriptive title'
                value={meetingTitle}
                onChange={e => setMeetingTitle(e.target.value)}
                required
              />
              <div className='text-xs text-gray-500 dark:text-gray-400 mt-1 ml-2'>
                <span className='flex gap-1 items-center'>
                  <BsFillInfoCircleFill className='text-blue-500' size={12} />A
                  clear title helps your student identify the meeting
                </span>
              </div>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-blue-500'>
                <MdOutlineTitle size={20} />
              </span>
            </div>
          </div>
          <div className='relative'>
            <label
              htmlFor='meetingLink'
              className='block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'
            >
              Meeting Link
            </label>
            <div className='relative'>
              <input
                type='text'
                id='meetingLink'
                className='px-4 py-3 pl-10 w-full text-gray-700 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all duration-200 dark:text-gray-200'
                placeholder='https://meet.google.com/...'
                value={meetingLink}
                onChange={e => setMeetingLink(e.target.value)}
                required
              />
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-blue-500'>
                <HiOutlineLink size={20} />
              </span>
            </div>
          </div>
          <div className='relative'>
            <label
              htmlFor='meetingDate'
              className='block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'
            >
              Meeting Date
              {post.preferableDate && (
                <span className='ml-2 text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded'>
                  Pre-filled from post
                </span>
              )}
            </label>
            <div className='relative'>
              <input
                type='date'
                id='meetingDate'
                className='px-4 py-3 pl-10 w-full text-gray-700 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all duration-200 dark:text-gray-200'
                value={meetingDate}
                onChange={e => setMeetingDate(e.target.value)}
                required
              />
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-blue-500'>
                <HiOutlineCalendar size={20} />
              </span>
            </div>
          </div>
          <div className='relative'>
            <label
              htmlFor='meetingTime'
              className='block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'
            >
              Meeting Time
              {post.preferableTime && (
                <span className='ml-2 text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded'>
                  Pre-filled from post
                </span>
              )}
            </label>
            <div className='flex gap-4 items-center'>
              <div className='relative flex-1'>
                <input
                  type='time'
                  id='meetingStartTime'
                  className='px-4 py-3 pl-10 w-full text-gray-700 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all duration-200 dark:text-gray-200'
                  value={meetingStartTime}
                  onChange={e => setMeetingStartTime(e.target.value)}
                  required
                />
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-blue-500'>
                  <HiOutlineClock size={20} />
                </span>
              </div>
              <span className='text-gray-500 dark:text-gray-400 font-medium px-1'>
                to
              </span>
              <div className='relative flex-1'>
                <input
                  type='time'
                  id='meetingEndTime'
                  className='px-4 py-3 pl-10 w-full text-gray-700 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all duration-200 dark:text-gray-200'
                  value={meetingEndTime}
                  onChange={e => setMeetingEndTime(e.target.value)}
                  required
                />
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-blue-500'>
                  <HiOutlineClock size={20} />
                </span>
              </div>
            </div>
          </div>
          <button
            type='button'
            onClick={handleCreateMeeting}
            disabled={isLoading}
            className='w-full px-6 py-4 mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none'
          >
            <span className='absolute right-0 -mt-12 h-32 w-8 top-2/4 bg-white opacity-10 transform rotate-12 transition-all duration-1000 origin-bottom group-hover:-translate-x-96'></span>

            {isLoading ? (
              <>
                <svg
                  className='animate-spin -ml-1 mr-2 h-5 w-5 text-white'
                  xmlns='http://www.w3.org/2000/svg'
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
                Processing...
              </>
            ) : (
              <>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M12 20h9'></path>
                  <path d='M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'></path>
                </svg>
                Schedule Meeting
              </>
            )}
          </button>

          <div className='text-center mt-6 mb-2 text-gray-500 dark:text-gray-400 text-sm border-t border-gray-100 dark:border-gray-700 pt-4'>
            <div className='flex items-center justify-center gap-2'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='text-blue-500'
              >
                <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'></path>
                <path d='M13.73 21a2 2 0 0 1-3.46 0'></path>
              </svg>
              <p>
                Both you and your student will receive a notification once
                scheduled
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
