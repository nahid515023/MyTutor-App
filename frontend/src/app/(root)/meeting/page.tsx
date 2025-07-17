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
                `🔔 Meeting "${meeting.title}" starts in ${minutesUntilMeeting} minutes!`
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
    const currentTime = new Date()
    setUpcomingMeetings(
      meetings.filter(meeting => new Date(meeting.end) > currentTime)
    )
    setCompletedMeetings(
      meetings.filter(meeting => new Date(meeting.end) <= currentTime)
    )
  }, [meetings])

  const handleDeleteMeeting = async (meeting: Meeting) => {
    try {
      const response = await api.delete<{ message: string }>(
        `/meeting/${meeting.postId}`
      )

      if (response.status === 200) {
        setMeetings(prevMeetings =>
          prevMeetings.filter(m => m.id !== meeting.id)
        )
        showToast('success', response.data.message)
      } else {
        showToast('error', response.data.message || 'Failed to delete meeting')
      }
    } catch (error) {
      showToast('error', 'Something went wrong!')
      console.error('Error deleting meeting:', error)
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

  // Function to format the date and time with the correct timezone
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
      })
    }
  }

  return (
    <div className='min-h-screen'>
      {/* Notification Banner for upcoming meetings */}
      {upcomingMeetings.some(meeting =>
        isMeetingStartingSoon(meeting.start)
      ) && (
        <div className='bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 mb-4 rounded-lg shadow-lg animate-pulse'>
          <div className='flex items-center justify-center gap-2'>
            <span className='text-2xl animate-bounce'>🔔</span>
            <div className='text-center'>
              <h3 className='font-bold text-lg'>Meeting Alert!</h3>
              <p className='text-sm'>
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

      <div className='min-h-[860px] flex justify-center mt-3'>
        <div className='w-full max-w-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden border border-gray-200/50 dark:border-gray-700/50'>
          {/* Header / Tab Buttons */}
          <div className='flex border-b border-gray-200 dark:border-gray-700'>
            <button
              onClick={() => setActiveTab(1)}
              className={`w-1/2 py-5 text-center font-semibold text-lg transition-all duration-300 focus:outline-none relative ${
                activeTab === 1
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <span className='relative z-10 flex items-center justify-center'>
                Upcoming Meetings
              </span>
              {activeTab === 1 && (
                <div className='absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500' />
              )}
            </button>
            <button
              onClick={() => setActiveTab(2)}
              className={`w-1/2 py-5 text-center font-semibold text-lg transition-all duration-300 focus:outline-none relative ${
                activeTab === 2
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <span className='relative z-10 flex items-center justify-center'>
                Completed Meetings
              </span>
              {activeTab === 2 && (
                <div className='absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500' />
              )}
            </button>
          </div>

          {/* Meeting List */}
          <div className='p-6 space-y-4 overflow-y-auto max-h-[700px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent'>
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
                  <div className='text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-xl'>
                    <p className='text-lg'>No upcoming meetings scheduled</p>
                    <p className='text-sm mt-2 text-gray-400 dark:text-gray-500'>
                      Your schedule is clear for now
                    </p>
                  </div>
                )}

                {activeTab === 2 && completedMeetings.length === 0 && (
                  <div className='text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-xl'>
                    <p className='text-lg'>No completed meetings found</p>
                    <p className='text-sm mt-2 text-gray-400 dark:text-gray-500'>
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
                        className={`group flex justify-between items-center p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border ${
                          isStartingSoon
                            ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800 animate-pulse'
                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-100 dark:hover:border-blue-900/30'
                        }`}
                      >
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2'>
                            <h3 className='text-xl font-bold text-gray-800 dark:text-gray-100 truncate'>
                              {meeting.title}
                            </h3>
                            {isStartingSoon && (
                              <div className='flex items-center gap-1'>
                                <span className='animate-bounce text-lg'>
                                  🔔
                                </span>
                                <span className='bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium'>
                                  {minutesUntil > 0
                                    ? `${minutesUntil}m`
                                    : 'Starting now!'}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className='text-sm text-gray-500 dark:text-gray-400 mt-2 space-y-1'>
                            <span className='inline-flex items-center'>
                              <span className='mr-2 opacity-70'>📅</span> {date}
                            </span>
                            <br />
                            <span className='inline-flex items-center'>
                              <span className='mr-2 opacity-70'>⏰</span>{' '}
                              {startTime} to {endTime}
                            </span>
                          </p>
                          {meeting.link && (
                            <Link
                              href={meeting.link}
                              target='_blank'
                              rel='noopener noreferrer'
                              className={`text-sm mt-3 inline-flex items-center font-medium transition-colors duration-200 ${
                                isStartingSoon
                                  ? 'text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300'
                                  : 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                              }`}
                            >
                              <span className='mr-1 opacity-70'>🔗</span> Join
                              Meeting
                            </Link>
                          )}
                        </div>
                        <div className='flex items-center space-x-2 ml-4'>
                          <button
                            onClick={() => handleEditMeeting(meeting)}
                            className='p-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200'
                            title='Edit Meeting'
                          >
                            <span
                              role='img'
                              aria-label='Edit'
                              className='text-xl'
                            >
                              ✏️
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteMeeting(meeting)}
                            className='p-2.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200'
                            title='Delete Meeting'
                          >
                            <span
                              role='img'
                              aria-label='Delete'
                              className='text-xl'
                            >
                              🗑️
                            </span>
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
                          className='flex justify-between items-center p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700'
                        >
                          <div>
                            <h3 className='text-xl font-bold text-gray-800 dark:text-gray-100'>
                              {meeting.title}
                            </h3>
                            <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
                              <span className='inline-flex items-center'>
                                <span className='mr-2'>📅</span> {date}
                              </span>
                              <br />
                              <span className='inline-flex items-center'>
                                <span className='mr-2'>⏰</span> {startTime} to{' '}
                                {endTime}
                              </span>
                            </p>
                          </div>
                          <div>
                            {meeting.Rating.length < 1 &&
                            user?.role === 'STUDENT' ? (
                              <button
                                onClick={() => setMeetingToReview(meeting)}
                                className='px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm flex items-center'
                              >
                                <span className='text-lg mr-1'>⭐</span>
                                <span>Rate & Review</span>
                              </button>
                            ) : (
                              <p className='text-yellow-400 text-xl'>
                                {'⭐'.repeat(meeting.Rating[0].rating)}
                              </p>
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
          <div className='bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4'>
            <h2 className='text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100'>
              Edit Meeting
            </h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Title
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
                  className='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
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
                  className='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200'
                  placeholder='https://example.com/meeting'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
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
                  className='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
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
                  className='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200'
                />
              </div>
            </div>
            <div className='flex justify-end space-x-3 mt-6'>
              <button
                onClick={() => setEditMeeting(null)}
                className='px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200'
              >
                Cancel
              </button>
              <button
                onClick={() => updateMeeting(editMeeting)}
                className='px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 transition-all duration-200 shadow-sm'
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
          <div className='bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4'>
            <h2 className='text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100'>
              Rate & Review Meeting
            </h2>
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-gray-500 dark:text-gray-400 mb-2'>
                  How would you rate this meeting?
                </p>
                <div className='flex space-x-2'>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(star)}
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                        reviewData.rating >= star
                          ? 'bg-yellow-400 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-yellow-300'
                      }`}
                    >
                      <span className='text-xl'>⭐</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Your Review
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={e => handleCommentChange(e.target.value)}
                  className='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200'
                  rows={4}
                  placeholder='Share your thoughts about the meeting...'
                />
              </div>
            </div>
            <div className='flex justify-end space-x-3 mt-6'>
              <button
                onClick={() => setMeetingToReview(null)}
                className='px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200'
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className='px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm'
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
