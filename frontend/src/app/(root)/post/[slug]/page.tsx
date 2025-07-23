'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Cookies from 'js-cookie'

import { api } from '@/_lib/api'
import { showToast } from '@/utils/toastService'
import { Post, User, TutorRequest, MeetingData } from '@/types/post'
import { subjectOptions, classLevels } from '@/lib/subjectAndClass'
import { getProfileImageUrl } from '@/utils/getProfileImage'

// Type definitions
interface FormData {
  medium: string
  selectedClass: string
  subject: string
  fees: string
  description: string
  preferableStartTime: string
  preferableEndTime: string
  duration: string
  preferableDate: string
}

interface ChangeEvent {
  target: {
    name: string
    value: string
  }
}

export default function PostPage() {
  // Hooks
  const params = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  // State management
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [interested, setInterested] = useState(false)
  const [requestData, setRequestData] = useState<TutorRequest[]>([])
  const [userData, setUserData] = useState<User>()
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    medium: '',
    selectedClass: '',
    subject: '',
    fees: '',
    description: '',
    preferableStartTime: '',
    preferableEndTime: '',
    duration: '',
    preferableDate: ''
  })

    // Data fetching effects
  useEffect(() => {
    const cookies = Cookies.get('user')
    if (cookies) {
      setUserData(JSON.parse(cookies))
    }
  }, [])


  const [meetingData, setMeetingData] = useState<MeetingData>()

  useEffect(() => {
    const fetchMeetingData = async () => {
        const response = await api.get<MeetingData>(`/meeting/${params.slug}`)
        setMeetingData(response.data)
    }
    fetchMeetingData()
  }, [params.slug])


  // Payment status handling
  useEffect(() => {
    if (searchParams.get('status') === 'failed') {
      showToast('error', 'Payment failed. Please try again.')
    }
    if (searchParams.get('status') === 'cancelled') {
      showToast('info', 'Payment cancelled.')
    }
  }, [searchParams])

  // Utility functions
  const getDateInPost = (date: string): string => {
    const postDate = new Date(date)
    const diff = Date.now() - postDate.getTime()
    const days = diff / (1000 * 60 * 60 * 24)
    
    if (days >= 1) return `${Math.floor(days)} days ago`
    if (days * 24 >= 1) return `${Math.floor(days * 24)} hours ago`
    if (days * 24 * 60 >= 1) return `${Math.floor(days * 24 * 60)} minutes ago`
    return `${Math.floor(days * 24 * 60 * 60)} seconds ago`
  }

  const calculateEndTime = (startTime: string, duration: string): string => {
    if (!startTime || !duration) return ''

    const [hours, minutes] = startTime.split(':').map(Number)
    const durationMinutes = parseInt(duration)

    // Calculate total minutes
    const totalMinutes = hours * 60 + minutes + durationMinutes

    // Convert back to hours and minutes
    const newHours = Math.floor(totalMinutes / 60) % 24
    const newMinutes = totalMinutes % 60

    // Format as HH:MM
    return `${newHours.toString().padStart(2, '0')}:${newMinutes
      .toString()
      .padStart(2, '0')}`
  }

  // Form event handlers
  const handleChange = (e: ChangeEvent) => {
    const { name, value } = e.target
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTimeOrDurationChange = (e: ChangeEvent) => {
    const { name, value } = e.target

    setFormData((prev: FormData) => {
      const updatedData = { ...prev, [name]: value }

      // If either start time or duration changed, recalculate end time
      if (
        (name === 'preferableStartTime' || name === 'duration') &&
        updatedData.preferableStartTime &&
        updatedData.duration
      ) {
        updatedData.preferableEndTime = calculateEndTime(
          updatedData.preferableStartTime,
          updatedData.duration
        )
      }

      return updatedData
    })
  }

  // API handlers
  const handleSubmit = async () => {
    const {
      medium,
      selectedClass,
      subject,
      fees,
      description,
      preferableStartTime,
      preferableEndTime,
      duration,
      preferableDate
    } = formData

    setIsSubmitting(true)

    try {
      const response = await api.put(`/posts/updatePost/${post?.id}`, {
        medium,
        selectedClass,
        subject,
        fees,
        description,
        preferableTime: `${preferableStartTime} - ${preferableEndTime}`,
        duration,
        preferableDate
      })
      
      if (response.status !== 200) {
        showToast('error', 'Failed to edit post')
      } else {
        showToast('success', 'Post Edited Successfully!')
      }
    } catch (err) {
      showToast('error', 'Failed to edit post. Please try again!')
      console.error(err)
    } finally {
      setIsSubmitting(false)
      const modal = document.getElementById('edit1') as HTMLDialogElement
      if (modal) modal.close()
    }
  }

  const handleInterested = async () => {
    if (!post) return
    
    try {
      const response = await api.post<{ message: string }>(
        `posts/request/${post.id}`,
        { comment }
      )
      if (response.data.message && response.status === 200) {
        showToast('success', response.data.message)
        setInterested(true)
      } else {
        showToast('error', response.data.message)
      }
    } catch (error) {
      showToast('error', 'Error requesting post!')
      console.error('Error requesting post:', error)
    }
  }

  const handleRemoveInterested = async () => {
    if (!post) return
    
    try {
      const response = await api.delete<{ message: string }>(
        `posts/request/${post.id}`
      )
      if (response.data.message && response.status === 200) {
        showToast('success', response.data.message)
        setInterested(false)
      } else {
        showToast('error', response.data.message)
      }
    } catch (error) {
      showToast('error', 'Error removing interest!')
      console.error('Error removing interest:', error)
    }
  }

  const handleChat = async (contactUserId: string) => {
    try {
      const res = await api.post<{ message: string }>(
        `/chat/users/connect/${contactUserId}`
      )
      if (res.status === 201 || res.status === 202) {
        router.push('/chats')
      } else {
        showToast('error', res.data.message)
      }
    } catch (error) {
      showToast('error', 'Error connecting chat!')
      console.error('Error connecting chat:', error)
    }
  }

  const handleDeleteMeeting = async (postId: string, onSuccess: () => void) => {
    try {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete this meeting?'
      )
      if (!confirmDelete) return

      const response = await api.delete(`/meeting/${postId}`)

      if (response.status === 200) {
        showToast('success', 'Meeting deleted successfully!')
        onSuccess()
      } else {
        showToast('error', 'Failed to delete meeting.')
      }
    } catch (error) {
      console.error('Error deleting meeting:', error)
      showToast('error', 'Something went wrong!')
    }
  }

  const handleDeletePost = async () => {
    try {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete this post?'
      )
      if (!confirmDelete) return

      const response = await api.delete(`/posts/${post?.id}`)

      if (response.status === 200) {
        showToast('success', 'Post deleted successfully!')
        router.push('/home')
      } else {
        showToast('error', 'Failed to delete post.')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      showToast('error', 'Something went wrong!')
    }
  }

  const handlePayment = async (teacherId: string) => {
    if (!post) return
    
    try {
      const response = await api.post<{
        message: string
        paymentId: string
        GatewayPageURL: string
      }>(`/payment/create`, {
        amount: post.fees,
        postId: post.id,
        teacherId,
        userId: post.userId
      })

      if (response.status === 200) {
        const { GatewayPageURL } = response.data
        if (GatewayPageURL) {
          window.location.href = GatewayPageURL
        } else {
          showToast('error', 'Payment gateway URL not found.')
        }
      } else {
        showToast('error', response.data.message || 'Failed to create payment.')
      }
    } catch (error) {
      showToast('error', 'Error creating payment!')
      console.error('Error creating payment:', error)
    }
  }


  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const { data: postData } = await api.get<{
          post: Post
          interested: boolean
        }>(`/posts/${params.slug}`)
        setPost(postData.post)

        const [startTime, endTime] = postData.post.preferableTime?.split('-') || ['', '']
        setFormData({
          medium: postData.post.medium || '',
          selectedClass: postData.post.Class || '',
          subject: postData.post.subject || '',
          fees: postData.post.fees || '',
          description: postData.post.description || '',
          preferableStartTime: startTime?.trim() || '',
          preferableEndTime: endTime?.trim() || '',
          duration: '',
          preferableDate: postData.post.preferableDate || ''
        })

        // Fetch tutor requests
        const { data: requestData } = await api.get<{
          allRequest: TutorRequest[]
        }>(`/posts/request/${params.slug}`)
        setRequestData(requestData.allRequest)

        if (
          requestData.allRequest.length > 0 &&
          requestData.allRequest.find(
            request => request.userId === userData?.id
          )
        ) {
          setInterested(true)
        }
      } catch (error) {
        console.error('Error fetching post data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPostData()
  }, [params.slug, userData?.id])

  // Early returns
  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <p>Loading...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <p>Post not found</p>
      </div>
    )
  }

  // Computed values
  const isVerified = post.User?.id === userData?.id

  return (
    <div className='min-h-screen'>
      {/* Remove Interest Modal */}
      <dialog id='my_modal_1' className='modal backdrop-blur-sm'>
        <div className='modal-box bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6'>
          <form method='dialog'>
            <button
              type='button'
              className='btn btn-sm btn-circle btn-ghost absolute right-3 top-3 hover:bg-blue-50 hover:text-blue-500 transition-colors duration-200'
              onClick={() => {
                const modal = document.getElementById('my_modal_1') as HTMLDialogElement
                if (modal) modal.close()
              }}
            >
              ✕
            </button>
          </form>
          <p className='py-6 font-bold text-xl text-gray-800 dark:text-gray-100 text-center'>
            Are you sure you want to remove your interest?
          </p>
          <div className='flex justify-center mt-2'>
            <button
              type='button'
              className='btn bg-amber-500 hover:bg-amber-600 text-white font-medium px-8 py-2 rounded-xl hover:shadow-lg transition-all duration-200'
              onClick={() => {
                handleRemoveInterested()
                const modal = document.getElementById('my_modal_1') as HTMLDialogElement
                if (modal) modal.close()
              }}
            >
              Remove
            </button>
          </div>
        </div>
        <form method='dialog' className='modal-backdrop'>
          <button>close</button>
        </form>
      </dialog>

      {/* Interested / Comment Modal */}
      <dialog id='my_modal_2' className='modal backdrop-blur-sm'>
        <div className='modal-box bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-11/12 max-w-md'>
          <form method='dialog'>
            <button
              type='button'
              className='btn btn-sm btn-circle btn-ghost absolute right-3 top-3 hover:bg-blue-50 hover:text-blue-500 transition-colors duration-200'
              onClick={() => {
                const modal = document.getElementById('my_modal_2') as HTMLDialogElement
                if (modal) modal.close()
              }}
            >
              ✕
            </button>
          </form>
          <p className='py-4 font-bold text-xl text-gray-800 dark:text-gray-100 mb-2'>
            Write a Comment
          </p>
          <textarea
            onChange={e => setComment(e.target.value)}
            value={comment}
            className='textarea w-full h-28 border-2 bg-gray-100 text-gray-800 border-gray-300 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 p-4'
            placeholder="Share why you're interested in this tutoring opportunity..."
          />
          <div className='flex justify-end mt-5'>
            <button
              type='button'
              className='btn bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-2 rounded-xl shadow-lg hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/30 transition-all duration-200'
              onClick={() => {
                handleInterested()
                const modal = document.getElementById('my_modal_2') as HTMLDialogElement
                if (modal) modal.close()
              }}
            >
              Interested
            </button>
          </div>
        </div>
        <form method='dialog' className='modal-backdrop'>
          <button>close</button>
        </form>
      </dialog>

      {/* Main Content */}
      <div className='grid grid-cols-1 gap-6 justify-center mx-auto max-w-4xl px-4 min-h-screen mb-6'>
        <div className='card bg-white dark:bg-gray-800 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 ease-in-out border border-gray-100 dark:border-gray-700'>
          <div className='card-body p-6 sm:p-8'>
            {/* User Info Header */}
            <div className='flex flex-col sm:flex-row items-center gap-4'>
              <div className='w-16 h-16 rounded-full overflow-hidden ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-750'>
                <Image
                  src={getProfileImageUrl(post.User.profileImage)}
                  alt={post.User.name}
                  width={64}
                  height={64}
                  className='object-cover w-full h-full'
                />
              </div>
              <div className='flex flex-col text-center sm:text-left'>
                <Link href={`/profile/${post.User.id}`}>
                  <span className='text-lg font-bold text-gray-900 dark:text-gray-50 hover:text-blue-600 dark:hover:text-blue-500 transition-colors duration-200'>
                    {post.User.name}
                  </span>
                </Link>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  {post.User.education && post.User.education.split('#')[0]}
                </span>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  {getDateInPost(post.createdAt)}
                </span>
              </div>
              <div className='flex-1 flex items-center justify-end gap-2'>
                {isVerified ? (
                  <div className='dropdown dropdown-end'>
                    <div
                      tabIndex={0}
                      role='button'
                      className='btn btn-sm bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 m-1 text-center transition-colors duration-200 rounded-xl shadow-sm'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={1.5}
                        stroke='currentColor'
                        className='w-5 h-5'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M6.75 12a.75.75 0 110-1.5h10.5a.75.75 0 110 1.5H6.75zm0 4.5a.75.75 0 110-1.5h10.5a.75.75 0 110 1.5H6.75zm0-9a.75.75 0 110-1.5h10.5a.75.75 0 110 1.5H6.75z'
                        />
                      </svg>
                    </div>
                    <ul
                      tabIndex={0}
                      className='dropdown-content menu bg-white dark:bg-gray-800 rounded-xl z-10 w-40 p-2 shadow-xl border border-gray-200 dark:border-gray-700'
                    >
                      <li>
                        <button
                          onClick={() => {
                            const modal = document.getElementById('edit1') as HTMLDialogElement
                            if (modal) modal.showModal()
                          }}
                          className='text-center text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-700 transition-colors duration-200 font-medium'
                        >
                          Edit
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={handleDeletePost}
                          className='text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200 font-medium'
                        >
                          Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : post.booked ? (
                  <div className='inline-block bg-green-100 dark:bg-green-900/70 text-green-800 dark:text-green-200 font-semibold px-5 py-2.5 rounded-full text-sm shadow-inner'>
                    ✓ Booked
                  </div>
                ) : (
                  <div className='inline-block bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200 font-semibold px-5 py-2.5 rounded-full text-sm shadow-inner'>
                    {post.TutorRequest.length}{' '}
                    {post.TutorRequest.length === 1 ? 'tutor' : 'tutors'} requested
                  </div>
                )}
              </div>
            </div>

            {/* Post Tags */}
            <div className='flex flex-wrap gap-3 justify-center sm:justify-start mt-2'>
              <div className='px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'>
                Online
              </div>
              {post.medium && (
                <div className='px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'>
                  {post.medium}
                </div>
              )}
              {post.Class && (
                <div className='px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'>
                  Class {post.Class}
                </div>
              )}
              {post.subject && (
                <div className='px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'>
                  {post.subject}
                </div>
              )}
              {post.fees && (
                <div className='px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'>
                  {post.fees} BDT/Class
                </div>
              )}
              {post.preferableDate && (
                <div className='px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'>
                  {new Date(post.preferableDate).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              )}
              {post.preferableTime && (
                <>
                  {(() => {
                    const [start, end] = post.preferableTime.split('-')
                    const preferableStartTime = new Date(
                      `${post.preferableDate} ${start}`
                    ).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })
                    const preferableEndTime = new Date(
                      `${post.preferableDate} ${end}`
                    ).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })
                    return (
                      <div className='px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'>
                        {preferableStartTime} - {preferableEndTime}
                      </div>
                    )
                  })()}
                </>
              )}
            </div>

            <div className='divider my-2 before:bg-gradient-to-r before:from-transparent before:via-gray-300 before:to-transparent after:bg-gradient-to-r after:from-transparent after:via-gray-300 after:to-transparent dark:before:via-gray-600 dark:after:via-gray-600' />

            {/* Post Description */}
            <div className='min-h-60 p-6 sm:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-slate-800 dark:to-gray-700 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 ease-in-out'>
              <p className='text-md sm:text-lg leading-relaxed text-center sm:text-left text-gray-700 dark:text-gray-200 font-normal tracking-normal'>
                {post.description}
              </p>
            </div>

            {/* Interest Button or Tutor Requests */}
            {userData && userData.role !== 'STUDENT' ? (
              <div className='flex mt-8 justify-center sm:justify-start'>
                <p className='font-bold text-lg flex flex-wrap items-center gap-3'>
                  <span className='text-gray-700 dark:text-gray-300'>
                    If you are interested in this tuition, then press
                  </span>
                  {interested ? (
                    <button
                      type='button'
                      onClick={() =>
                        (
                          document.getElementById('my_modal_1') as HTMLDialogElement
                        )?.showModal()
                      }
                      className='btn btn-error rounded-full text-white font-semibold shadow-lg hover:opacity-90 hover:shadow-xl focus:ring focus:ring-blue-300 transition-all duration-200 px-6'
                    >
                      Interested
                    </button>
                  ) : (
                    <button
                      type='button'
                      onClick={() =>
                        (
                          document.getElementById('my_modal_2') as HTMLDialogElement
                        )?.showModal()
                      }
                      className='btn btn-outline btn-error rounded-full font-semibold hover:text-white hover:bg-error focus:ring focus:ring-blue-300 transition-all duration-200 px-6 shadow-md'
                    >
                      Interested
                    </button>
                  )}
                </p>
              </div>
            ) : (
              <div>
                {requestData.length > 0 && post.userId == userData?.id && (
                  <p className='text-md font-bold mt-8 mb-6 text-gray-800 dark:text-gray-100 border-b-2 border-blue-500 dark:border-blue-700 pb-2 tracking-wide'>
                    Requested Tutors List:
                  </p>
                )}
                {post.userId == userData?.id &&
                  requestData.map(request => (
                    <div
                      key={request.id}
                      className='bg-blue-50 dark:bg-slate-800 rounded-xl p-6 mb-3 shadow hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1'
                    >
                      <div className='flex flex-col md:flex-row items-start md:items-center gap-6'>
                        <div className='flex-shrink-0 flex items-center gap-4'>
                          <div className='w-16 h-16 rounded-full overflow-hidden ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-750'>
                            <Image
                              src={
                                getProfileImageUrl(request.User?.profileImage || '')
                              }
                              alt={request.User?.name || 'Profile Image'}
                              width={64}
                              height={64}
                              className='object-cover w-full h-full'
                            />
                          </div>
                          <div className='flex flex-col'>
                            <Link href={`/profile/${request.User?.id}`}>
                              <span className='text-lg font-semibold text-slate-800 dark:text-slate-100 hover:text-sky-500 dark:hover:text-sky-400 transition-colors duration-200'>
                                {request.User?.name}
                              </span>
                            </Link>
                            <span className='text-sm text-slate-500 dark:text-slate-400'>
                              {request.User?.education &&
                                request.User?.education.split('#')[0]}
                            </span>
                            <span className='text-sm text-slate-500 dark:text-slate-400'>
                              {getDateInPost(request.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className='flex-1 flex flex-col md:flex-row items-stretch md:items-center justify-start md:justify-end gap-4 mt-4 md:mt-0 w-full md:w-auto'>
                          <button
                            type='button'
                            onClick={() => handleChat(request.userId)}
                            className='btn bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-5 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 w-full md:w-auto flex items-center gap-2'
                          >
                            Let&apos;s Chat
                          </button>
                          {(meetingData?.teacherId!==request.userId) ? (
                            <button
                              type='button'
                              onClick={() => {
                                handlePayment(request.userId)
                              }}
                              className='btn bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 w-full md:w-auto'
                            >
                              Create Meeting
                            </button>
                          ) : (
                            <button
                              type='button'
                              onClick={() =>
                                handleDeleteMeeting(request.postId, () => {
                                  setPost(prev =>
                                    prev ? { ...prev, booked: false } : null
                                  )
                                })
                              }
                              className='btn bg-red-600 hover:bg-red-700 text-white rounded-lg px-5 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 w-full md:w-auto'
                            >
                              Cancel Meeting
                            </button>
                          )}
                        </div>
                      </div>
                      {request.comment && (
                        <>
                          <div className='my-5 border-t border-slate-300 dark:border-slate-600'></div>
                          <div className='mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600'>
                            <p className='leading-relaxed text-sm text-slate-600 dark:text-slate-300'>
                              {request.comment}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Post Modal */}
      <dialog id='edit1' className='modal backdrop-blur-sm'>
        <div className='modal-box bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl p-0 overflow-hidden'>
          {/* Header */}
          <div className='bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 p-6 relative'>
            <form method='dialog'>
              <button className='btn btn-sm btn-circle absolute right-4 top-4 bg-white/20 hover:bg-white/30 border-none text-white transition-all duration-200 hover:rotate-90'>
                ✕
              </button>
            </form>
            <h3 className='font-bold text-2xl text-white mb-1'>Edit Post</h3>
            <p className='text-blue-100 text-sm'>
              Update your tutoring requirements
            </p>
          </div>

          <div className='p-6 max-h-[70vh] overflow-y-auto custom-scrollbar'>
            <div className='space-y-7'>
              {/* Medium Selection */}
              <div className='form-group'>
                <label className='text-base font-semibold text-slate-800 dark:text-slate-200 mb-3 block'>
                  Medium <span className='text-red-500'>*</span>
                </label>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                  {['Bangla version', 'English version', 'English medium'].map(
                    option => (
                      <label
                        key={option}
                        className={`flex items-center justify-center cursor-pointer group h-12 rounded-xl transition-all duration-300 border-2 
                        ${
                          formData.medium === option
                            ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-500 shadow-md transform scale-[1.02]'
                            : 'border-slate-200 text-slate-600 dark:text-slate-400 dark:border-slate-700 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:border-blue-600 dark:hover:bg-blue-900/20'
                        }`}
                      >
                        <input
                          type='radio'
                          name='medium'
                          value={option}
                          onChange={handleChange}
                          checked={formData.medium === option}
                          className='sr-only'
                        />
                        <span className='font-medium'>{option}</span>
                        {formData.medium === option && (
                          <svg
                            className='w-4 h-4 ml-2 text-blue-600 dark:text-blue-400'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M5 13l4 4L19 7'
                            />
                          </svg>
                        )}
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Class and Subject */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                <div className='form-group'>
                  <label
                    htmlFor='selectedClass'
                    className='text-base font-semibold text-slate-800 dark:text-slate-200 mb-2 block'
                  >
                    Class Level <span className='text-red-500'>*</span>
                  </label>
                  <div className='relative'>
                    <select
                      id='selectedClass'
                      name='selectedClass'
                      className='w-full appearance-none border-2 text-slate-700 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-xl p-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all hover:border-blue-300 dark:hover:border-blue-700'
                      value={formData.selectedClass}
                      onChange={handleChange}
                      required
                    >
                      <option disabled value=''>
                        Select Class
                      </option>
                      {classLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                    <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400'>
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 9l-7 7-7-7'
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className='form-group'>
                  <label
                    htmlFor='subject'
                    className='text-base font-semibold text-slate-800 dark:text-slate-200 mb-2 block'
                  >
                    Subject <span className='text-red-500'>*</span>
                  </label>
                  <div className='relative'>
                    <select
                      id='subject'
                      name='subject'
                      className='w-full appearance-none text-slate-700 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-xl p-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all hover:border-blue-300 dark:hover:border-blue-700'
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option disabled value=''>
                        Select Subject
                      </option>
                      {subjectOptions.map(subject => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                    <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400'>
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 9l-7 7-7-7'
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fees */}
              <div className='form-group'>
                <label
                  htmlFor='fees'
                  className='text-base font-semibold text-slate-800 dark:text-slate-200 mb-2 block'
                >
                  Fees per Class (BDT) <span className='text-red-500'>*</span>
                </label>
                <div className='relative text-slate-700'>
                  <div className='absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none'>
                    <span className='text-slate-500 dark:text-slate-400 font-medium'>
                      ৳
                    </span>
                  </div>
                  <input
                    type='number'
                    id='fees'
                    name='fees'
                    className='w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-xl py-3 pl-8 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all placeholder:text-slate-400'
                    placeholder='Enter amount'
                    value={formData.fees}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Preferable Date */}
              <div className='form-group'>
                <label
                  htmlFor='preferableDate'
                  className='text-base font-semibold text-slate-800 dark:text-slate-200 mb-2 block'
                >
                  Preferable Date <span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-slate-500 dark:text-slate-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                  </div>
                  <input
                    type='date'
                    id='preferableDate'
                    name='preferableDate'
                    className='w-full pl-11 text-slate-700 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all'
                    value={formData.preferableDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Time and Duration */}
              <div className='form-group bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800/70 dark:to-slate-700/70 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner'>
                <label className='text-base font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center'>
                  <svg
                    className='w-4 h-4 mr-2 text-blue-500'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  Preferable Time <span className='text-red-500'>*</span>
                </label>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-700'>
                  <div className='relative'>
                    <label
                      htmlFor='preferableStartTime'
                      className='text-sm text-slate-600 dark:text-slate-400 mb-1.5 block'
                    >
                      Start Time
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                        <svg
                          className='w-4 h-4 text-slate-500 dark:text-slate-400'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                          />
                        </svg>
                      </div>
                      <input
                        type='time'
                        id='preferableStartTime'
                        name='preferableStartTime'
                        className='w-full border-2 pl-9 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all'
                        value={formData.preferableStartTime}
                        onChange={handleTimeOrDurationChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor='duration'
                      className='text-sm text-slate-600 dark:text-slate-400 mb-1.5 block'
                    >
                      Duration
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                        <svg
                          className='w-4 h-4 text-slate-500 dark:text-slate-400'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                          />
                        </svg>
                      </div>
                      <select
                        id='duration'
                        name='duration'
                        className='w-full border-2 pl-9 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all appearance-none'
                        value={formData.duration}
                        onChange={handleTimeOrDurationChange}
                        required
                      >
                        <option value='' disabled>
                          Select duration
                        </option>
                        {[30, 45, 60, 90, 120, 150].map(minutes => (
                          <option key={minutes} value={minutes}>
                            {minutes} minutes
                          </option>
                        ))}
                      </select>
                      <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor='preferableEndTime'
                      className='text-sm text-slate-600 dark:text-slate-400 mb-1.5 block'
                    >
                      End Time (Auto)
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                        <svg
                          className='w-4 h-4 text-slate-500 dark:text-slate-400'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                          />
                        </svg>
                      </div>
                      <input
                        type='time'
                        id='preferableEndTime'
                        name='preferableEndTime'
                        className='w-full border-2 pl-9 border-slate-200 dark:border-slate-700 dark:text-slate-300 rounded-xl p-2.5 focus:outline-none shadow-sm transition-all bg-blue-50/50 dark:bg-slate-700/80'
                        value={formData.preferableEndTime}
                        readOnly
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className='form-group mt-3'>
                <label
                  htmlFor='description'
                  className='text-base font-semibold text-slate-800 dark:text-slate-200 mb-2 block'
                >
                  Description <span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <textarea
                    id='description'
                    name='description'
                    className='w-full text-slate-700 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-all h-36 shadow-sm resize-none'
                    placeholder='Provide details about your tuition requirements...'
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                  <span className='absolute bottom-3 right-3 text-xs text-slate-500 dark:text-slate-400'>
                    {formData.description.length} characters
                  </span>
                </div>
                <p className='mt-2 text-sm text-slate-500 dark:text-slate-400 flex items-start'>
                  <svg
                    className='w-4 h-4 mr-1 mt-0.5 text-blue-500'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <span>
                    Include details like specific topics, teaching preferences,
                    and student requirements for better matches.
                  </span>
                </p>
              </div>

              {/* Submit Button */}
              <button
                className={`w-full mt-4 py-4 px-5 rounded-xl font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300/50 
                  ${
                    isSubmitting
                      ? 'bg-blue-500 cursor-not-allowed opacity-90'
                      : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 hover:from-blue-600 hover:via-indigo-600 hover:to-indigo-700 active:from-blue-700 active:to-indigo-800 hover:shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-0.5'
                  }`}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className='flex items-center justify-center'>
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
                    Saving Changes...
                  </div>
                ) : (
                  <div className='flex items-center justify-center'>
                    <svg
                      className='w-5 h-5 mr-2'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
                      />
                    </svg>
                    Save Changes
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
        <form method='dialog' className='modal-backdrop'>
          <button>close</button>
        </form>
      </dialog>
    </div>
  )
}
