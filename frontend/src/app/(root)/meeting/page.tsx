'use client'

import { useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'
import { api } from '@/_lib/api'
import { showToast } from '@/utils/toastService'
import Link from 'next/link'
import { LoadingState } from '@/components/loading'

interface Meeting {
  id: number
  title: string
  start: string
  end: string
  postId: string
  link: string
  userId: string
  teacherId: string
  Rating: { rating: number }[]
}

interface User {
  id: string
  role: string
}

interface ReviewData {
  rating: number
  comment: string
}

export default function MeetingPage () {
  const [activeTab, setActiveTab] = useState(1)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [editMeeting, setEditMeeting] = useState<Meeting | null>(null)
  const [meetingToReview, setMeetingToReview] = useState<Meeting | null>(null)
  const [reviewData, setReviewData] = useState<ReviewData>({
    rating: 5,
    comment: ''
  })
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null)
  // Check for upcoming meetings that need notifications
  const checkUpcomingMeetings = useCallback(async () => {
    if (!user) return

    try {
      const response = await api.get<Meeting[]>(`/meeting/upcoming/${user.id}`)
      if (response.status === 200) {
        // Show notification toast for meetings within 30 minutes
        if (response.data.length > 0) {
          response.data.forEach(meeting => {
            const meetingTime = new Date(meeting.start)
            const now = new Date()
            const minutesUntilMeeting = Math.floor(
              (meetingTime.getTime() - now.getTime()) / (1000 * 60)
            )

            if (minutesUntilMeeting <= 30 && minutesUntilMeeting > 0) {
              showToast(
                'warning',
                `Meeting "${meeting.title}" starts in ${minutesUntilMeeting} minutes!`
              )
            }
          })
        }
      }
    } catch (error) {
      console.error('Error checking upcoming meetings:', error)
    }
  }, [user])

  // Send email notifications for upcoming meetings
  const sendMeetingNotifications = useCallback(async () => {
    try {
      const response = await api.post('/meeting/send-notifications')
      if (response.status === 200) {
        console.log('Meeting notifications sent successfully')
      }
    } catch (error) {
      console.error('Error sending meeting notifications:', error)
    }
  }, [])

  useEffect(() => {
    const fetchMeetings = async () => {
      setIsLoading(true)
      try {
        const userCookie = Cookies.get('user')
        if (!userCookie) {
          throw new Error('User not found')
        }
        const userData = JSON.parse(userCookie)
        setUser(userData)
        const response = await api.get<Meeting[]>(
          `/meeting/get/${userData.id}/${userData.role}`
        )
        if (response.status !== 200) {
          throw new Error('Failed to fetch meetings')
        }
        const sortedMeetings = response.data.sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        )
        setMeetings(sortedMeetings)
      } catch (error) {
        console.error('Error fetching meetings:', error)
        showToast('error', 'Failed to load meetings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeetings()
  }, [])

  // Check for upcoming meetings every minute
  useEffect(() => {
    if (user) {
      checkUpcomingMeetings() // Initial check

      const interval = setInterval(() => {
        checkUpcomingMeetings()
        sendMeetingNotifications() // Send email notifications
      }, 60000) // Check every minute

      return () => clearInterval(interval)
    }
  }, [user, checkUpcomingMeetings, sendMeetingNotifications])

  // Helper function to check if a meeting is starting soon (within 30 minutes)
  const isMeetingStartingSoon = (meetingStart: string) => {
    const meetingTime = new Date(meetingStart)
    const now = new Date()
    const timeDiff = meetingTime.getTime() - now.getTime()
    const minutesUntilMeeting = Math.floor(timeDiff / (1000 * 60))
    return minutesUntilMeeting <= 30 && minutesUntilMeeting > 0
  }

  // Helper function to get minutes until meeting
  const getMinutesUntilMeeting = (meetingStart: string) => {
    const meetingTime = new Date(meetingStart)
    const now = new Date()
    const timeDiff = meetingTime.getTime() - now.getTime()
    return Math.floor(timeDiff / (1000 * 60))
  }

  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([])
  const [completedMeetings, setCompletedMeetings] = useState<Meeting[]>([])

  useEffect(() => {
    const now = new Date()
    
    // Filter upcoming meetings - those whose end time is still in the future
    // JavaScript Date constructor automatically handles UTC to local time conversion
    setUpcomingMeetings(
      meetings.filter(meeting => {
        const meetingEndTime = new Date(meeting.end)
        return meetingEndTime > now
      })
    )
    
    // Filter completed meetings - those whose end time has passed
    setCompletedMeetings(
      meetings.filter(meeting => {
        const meetingEndTime = new Date(meeting.end)
        return meetingEndTime <= now
      })
    )
  }, [meetings])

  const handleDeleteMeeting = async (meeting: Meeting) => {
    setMeetingToDelete(meeting)
  }

  const confirmDeleteMeeting = async () => {
    if (!meetingToDelete) return

    try {
      const response = await api.delete<{ message: string }>(
        `/meeting/${meetingToDelete.postId}`
      )

      if (response.status === 200) {
        setMeetings(prevMeetings =>
          prevMeetings.filter(m => m.id !== meetingToDelete.id)
        )
        showToast('success', response.data.message)
      } else {
        showToast('error', response.data.message || 'Failed to delete meeting')
      }
    } catch (error) {
      showToast('error', 'Something went wrong!')
      console.error('Error deleting meeting:', error)
    } finally {
      setMeetingToDelete(null)
    }
  }

  // Edit meeting details
  const handleEditMeeting = (meeting: Meeting) => {
    setEditMeeting({
      ...meeting,
      start: new Date(meeting.start).toISOString().slice(0, 16),
      end: new Date(meeting.end).toISOString().slice(0, 16)
    })
  }

  // Update meeting after editing
  const updateMeeting = async (updatedMeeting: Meeting) => {
    try {
      const response = await api.put<{ message: string }>(
        `/meeting/${updatedMeeting.id}`,
        updatedMeeting
      )

      if (response.status === 200) {
        // Update meeting in state
        setMeetings(prevMeetings =>
          prevMeetings.map(m =>
            m.id === updatedMeeting.id ? updatedMeeting : m
          )
        )
        showToast(
          'success',
          response.data.message || 'Meeting updated successfully'
        )
        setEditMeeting(null)
      } else {
        showToast('error', response.data.message || 'Failed to update meeting')
      }
    } catch (error) {
      console.error('Error updating meeting:', error)
      showToast('error', 'Something went wrong!')
    }
  }

  // Handle rating change
  const handleRatingChange = (rating: number) => {
    setReviewData(prev => ({ ...prev, rating }))
  }

  // Handle comment change
  const handleCommentChange = (comment: string) => {
    setReviewData(prev => ({ ...prev, comment }))
  }

  // Submit review
  const submitReview = async () => {
    if (!meetingToReview) return

    try {
      const reviews = {
        rating: reviewData.rating,
        review: reviewData.comment,
        postId: meetingToReview.postId,
        ratingBy: meetingToReview.userId,
        ratingTo: meetingToReview.teacherId,
        meetingId: meetingToReview.id
      }

      const response = await api.post<{ message: string }>(
        `/rating/review/`,
        reviews
      )

      if (response.status === 200 || response.status === 201) {
        showToast(
          'success',
          response.data.message || 'Review submitted successfully'
        )
        setMeetingToReview(null)
        // Reset review data
        setReviewData({
          rating: 5,
          comment: ''
        })
        setMeetings(prevMeetings =>
          prevMeetings.map(m =>
            m.id === meetingToReview.id
              ? { ...m, Rating: [...m.Rating, { rating: reviews.rating }] }
              : m
          )
        )
      } else {
        showToast('error', response.data.message || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      showToast('error', 'Something went wrong!')
    }
  }

  // Function to format the date and time in local timezone (converts from UTC)
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      }),
      time: date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  return (
    <div className='min-h-[calc(100vh-76px)]'>
      {/* Notification Banner for upcoming meetings */}
      {upcomingMeetings.some(meeting =>
        isMeetingStartingSoon(meeting.start)
      ) && (
        <div className='bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 mb-6 rounded-xl shadow-lg border-l-4 border-white/30'>
          <div className='flex items-center justify-center gap-3'>
            <div className='flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center'>
              <div className='w-4 h-4 bg-white rounded-full animate-pulse'></div>
            </div>
            <div className='text-center'>
              <h3 className='font-bold text-lg'>Meeting Alert!</h3>
              <p className='text-sm opacity-90'>
                {upcomingMeetings
                  .filter(meeting => isMeetingStartingSoon(meeting.start))
                  .map(meeting => {
                    const minutes = getMinutesUntilMeeting(meeting.start)
                    return `"${meeting.title}" starts in ${
                      minutes > 0 ? `${minutes} minutes` : 'now'
                    }!`
                  })
                  .join(' • ')}
              </p>
            </div>
          </div>
        </div>
      )}

  <div className='flex justify-center mt-6 px-4'>
        <div className='w-full max-w-4xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-[0_8px_40px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] overflow-hidden border border-gray-200/50 dark:border-gray-700/50'>
          {/* Header / Tab Buttons */}
          <div className='flex border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50'>
            <button
              onClick={() => setActiveTab(1)}
              className={`w-1/2 py-6 text-center font-semibold text-lg transition-all duration-300 focus:outline-none relative group ${
                activeTab === 1
                  ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className='relative z-10 flex items-center justify-center gap-2'>
                <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  activeTab === 1 ? 'bg-blue-500' : 'bg-gray-400 group-hover:bg-gray-500'
                }`}></div>
                Upcoming Meetings
                {upcomingMeetings.length > 0 && (
                  <span className='ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full'>
                    {upcomingMeetings.length}
                  </span>
                )}
              </span>
              {activeTab === 1 && (
                <div className='absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500' />
              )}
            </button>
            <button
              onClick={() => setActiveTab(2)}
              className={`w-1/2 py-6 text-center font-semibold text-lg transition-all duration-300 focus:outline-none relative group ${
                activeTab === 2
                  ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className='relative z-10 flex items-center justify-center gap-2'>
                <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  activeTab === 2 ? 'bg-blue-500' : 'bg-gray-400 group-hover:bg-gray-500'
                }`}></div>
                Completed Meetings
                {completedMeetings.length > 0 && (
                  <span className='ml-2 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full'>
                    {completedMeetings.length}
                  </span>
                )}
              </span>
              {activeTab === 2 && (
                <div className='absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500' />
              )}
            </button>
          </div>

          {/* Meeting List */}
          <div className='p-8 space-y-6 overflow-y-auto max-h-[700px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent'>
            {isLoading ? (
              <LoadingState
                title='Loading Meetings...'
                message='Please wait while we fetch your meetings'
                size='medium'
                className='h-96'
              />
            ) : (
              <>
                {activeTab === 1 && upcomingMeetings.length === 0 && (
                  <div className='text-center py-16 text-gray-500 dark:text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600'>
                    <div className='w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center'>
                      <div className='w-8 h-8 border-2 border-gray-400 dark:border-gray-500 rounded border-dashed'></div>
                    </div>
                    <p className='text-xl font-medium mb-2'>No upcoming meetings scheduled</p>
                    <p className='text-sm text-gray-400 dark:text-gray-500'>
                      Your schedule is clear for now
                    </p>
                  </div>
                )}

                {activeTab === 2 && completedMeetings.length === 0 && (
                  <div className='text-center py-16 text-gray-500 dark:text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600'>
                    <div className='w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center'>
                      <div className='w-8 h-8 border-2 border-gray-400 dark:border-gray-500 rounded'></div>
                    </div>
                    <p className='text-xl font-medium mb-2'>No completed meetings found</p>
                    <p className='text-sm text-gray-400 dark:text-gray-500'>
                      Your meeting history is empty
                    </p>
                  </div>
                )}

                {activeTab === 1 &&
                  upcomingMeetings.map(meeting => {
                    const { date, time: startTime } = formatDateTime(
                      meeting.start
                    )
                    const { time: endTime } = formatDateTime(meeting.end)
                    const isStartingSoon = isMeetingStartingSoon(meeting.start)
                    const minutesUntil = getMinutesUntilMeeting(meeting.start)

                    return (
                      <div
                        key={meeting.id}
                        className={`group flex justify-between items-center p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 border ${
                          isStartingSoon
                            ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-400 dark:border-amber-600 shadow-amber-200/50 dark:shadow-amber-900/20'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                        }`}
                      >
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-3 mb-3'>
                            <h3 className='text-xl font-bold text-gray-800 dark:text-gray-100 truncate'>
                              {meeting.title}
                            </h3>
                            {isStartingSoon && (
                              <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 bg-amber-500 rounded-full animate-pulse'></div>
                                <span className='bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium'>
                                  {minutesUntil > 0
                                    ? `Starts in ${minutesUntil}m`
                                    : 'Starting now!'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className='space-y-2 text-sm text-gray-600 dark:text-gray-300'>
                            <div className='flex items-center gap-2'>
                              <div className='w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center'>
                                <div className='w-2 h-2 bg-blue-500 rounded'></div>
                              </div>
                              <span>{date}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <div className='w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center'>
                                <div className='w-2 h-2 bg-green-500 rounded'></div>
                              </div>
                              <span>{startTime} to {endTime}</span>
                            </div>
                          </div>
                          {meeting.link && (
                            <Link
                              href={meeting.link}
                              target='_blank'
                              rel='noopener noreferrer'
                              className={`text-sm mt-4 inline-flex items-center gap-2 font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
                                isStartingSoon
                                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                              }`}
                            >
                              <div className='w-3 h-3 bg-current rounded-full opacity-70'></div>
                              Join Meeting
                            </Link>
                          )}
                        </div>
                        <div className='flex items-center space-x-3 ml-6'>
                          <button
                            onClick={() => handleEditMeeting(meeting)}
                            className='p-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors duration-200 border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700'
                            title='Edit Meeting'
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteMeeting(meeting)}
                            className='p-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors duration-200 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700'
                            title='Delete Meeting'
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}

                {activeTab === 2 &&
                  completedMeetings
                    .slice()
                    .reverse()
                    .map(meeting => {
                      const { date, time: startTime } = formatDateTime(
                        meeting.start
                      )
                      const { time: endTime } = formatDateTime(meeting.end)

                      return (
                        <div
                          key={meeting.id}
                          className='flex justify-between items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 border-green-400 dark:border-green-600 border'
                        >
                          <div className='flex-1'>
                            <h3 className='text-xl font-bold text-gray-800 dark:text-gray-100 mb-3'>
                              {meeting.title}
                            </h3>
                            <div className='space-y-2 text-sm text-gray-600 dark:text-gray-300'>
                              <div className='flex items-center gap-2'>
                                <div className='w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center'>
                                  <div className='w-2 h-2 bg-blue-500 rounded'></div>
                                </div>
                                <span>{date}</span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <div className='w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center'>
                                  <div className='w-2 h-2 bg-green-500 rounded'></div>
                                </div>
                                <span>{startTime} to {endTime}</span>
                              </div>
                            </div>
                          </div>
                          <div className='ml-6'>
                            {meeting.Rating.length < 1 &&
                            user?.role === 'STUDENT' ? (
                              <button
                                onClick={() => setMeetingToReview(meeting)}
                                className='px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm flex items-center gap-2 font-medium'
                              >
                                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                </svg>
                                <span>Rate & Review</span>
                              </button>
                            ) : (
                              <div className='flex items-center gap-1'>
                                {[...Array(5)].map((_, index) => (
                                  <svg
                                    key={index}
                                    className={`w-5 h-5 ${
                                      index < meeting.Rating[0].rating
                                        ? 'text-yellow-400'
                                        : 'text-gray-300 dark:text-gray-600'
                                    }`}
                                    fill='currentColor'
                                    viewBox='0 0 20 20'
                                  >
                                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                  </svg>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal for editing meeting details */}
      {editMeeting && (
        <div className='fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50'>
          <div className='bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full mx-4 border border-gray-200 dark:border-gray-700'>
            <div className='text-center mb-6'>
              <div className='w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center'>
                <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                </svg>
              </div>
              <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
                Edit Meeting
              </h2>
              <p className='text-gray-500 dark:text-gray-400 mt-2'>
                Update your meeting details
              </p>
            </div>
            <div className='space-y-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                  Meeting Title
                </label>
                <input
                  type='text'
                  value={editMeeting.title}
                  onChange={e =>
                    setEditMeeting({
                      ...editMeeting,
                      title: e.target.value
                    })
                  }
                  className='w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200'
                  placeholder='Enter meeting title'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                  Meeting Link
                </label>
                <input
                  type='text'
                  value={editMeeting.link || ''}
                  onChange={e =>
                    setEditMeeting({
                      ...editMeeting,
                      link: e.target.value
                    })
                  }
                  className='w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200'
                  placeholder='https://example.com/meeting'
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                    Start Time
                  </label>
                  <input
                    type='datetime-local'
                    value={editMeeting.start}
                    onChange={e =>
                      setEditMeeting({
                        ...editMeeting,
                        start: e.target.value
                      })
                    }
                    className='w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                    End Time
                  </label>
                  <input
                    type='datetime-local'
                    value={editMeeting.end}
                    onChange={e =>
                      setEditMeeting({
                        ...editMeeting,
                        end: e.target.value
                      })
                    }
                    className='w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200'
                  />
                </div>
              </div>
            </div>
            <div className='flex justify-end space-x-4 mt-8'>
              <button
                onClick={() => setEditMeeting(null)}
                className='px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium'
              >
                Cancel
              </button>
              <button
                onClick={() => updateMeeting(editMeeting)}
                className='px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 transition-all duration-200 shadow-sm font-medium'
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for reviewing a meeting */}
      {meetingToReview && (
        <div className='fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50'>
          <div className='bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700'>
            <div className='text-center mb-6'>
              <div className='w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center'>
                <svg className='w-8 h-8 text-white' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                </svg>
              </div>
              <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
                Rate & Review Meeting
              </h2>
              <p className='text-gray-500 dark:text-gray-400 mt-2'>
                Share your experience with this meeting
              </p>
            </div>
            <div className='space-y-6'>
              <div>
                <p className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-4'>
                  How would you rate this meeting?
                </p>
                <div className='flex justify-center space-x-2'>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(star)}
                      className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                        reviewData.rating >= star
                          ? 'bg-yellow-400 text-white scale-110'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 hover:bg-yellow-300 dark:hover:bg-yellow-600'
                      }`}
                    >
                      <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                  Your Review
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={e => handleCommentChange(e.target.value)}
                  className='w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none'
                  rows={4}
                  placeholder='Share your thoughts about the meeting...'
                />
              </div>
            </div>
            <div className='flex justify-end space-x-3 mt-8'>
              <button
                onClick={() => setMeetingToReview(null)}
                className='px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium'
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className='px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm font-medium'
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deleting Meeting */}
      {meetingToDelete && (
        <div className='fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50'>
          <div className='bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700'>
            <div className='text-center'>
              <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6'>
                <svg className='w-8 h-8 text-red-600 dark:text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z' />
                </svg>
              </div>
              <h2 className='text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100'>
                Delete Meeting
              </h2>
              <p className='text-gray-600 dark:text-gray-300 mb-8 leading-relaxed'>
                Are you sure you want to delete &ldquo;<span className='font-semibold text-gray-800 dark:text-gray-200'>{meetingToDelete.title}</span>&rdquo;? This action cannot be undone.
              </p>
              <div className='flex justify-center space-x-4'>
                <button
                  onClick={() => setMeetingToDelete(null)}
                  className='px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium'
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteMeeting}
                  className='px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm font-medium'
                >
                  Delete Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
