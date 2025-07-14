'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Calendar,
  Clock,
  Video,
  Loader2,
  Check,
  AlertTriangle,
  Star,
  ExternalLink,
  RefreshCw,
  X,
  Users,
  Activity,
  TrendingUp,
  Filter,
  Trash2,
  Mail
} from 'lucide-react'
import { api } from '@/_lib/api'

// Enhanced interfaces with better typing
interface Meeting {
  id: string
  userId: string
  teacherId: string
  postId: string
  title: string
  start: string
  end: string
  link: string
  date: string
  createdAt: string
  updatedAt: string
  User: {
    id: string
    name: string
    email: string
  }
  Teacher: {
    id: string
    name: string
    email: string
  }
  Post: {
    id: string
    subject: string
    Class: string
    medium: string
    description: string
    fees: string
  }
  Rating: Array<{
    id: string
    rating: number
    review: string
    ratingBy: string
    ratingTo: string
  }>
}

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface LoadingStates {
  fetchingMeetings: boolean
  updatingMeeting: string | null
  deletingMeeting: string | null
}

export default function MeetingPage () {
  // Enhanced state management
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [subjectFilter, setSubjectFilter] = useState<string>('')
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    fetchingMeetings: true,
    updatingMeeting: null,
    deletingMeeting: null
  })

  // Enhanced toast management
  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = Date.now().toString()
      const newToast: Toast = { id, message, type }

      setToasts(prev => [...prev, newToast])

      // Auto-remove toast after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
      }, 5000)
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Helper function to determine meeting status
  const getMeetingStatus = (meeting: Meeting) => {
    const now = new Date()
    const meetingStart = new Date(meeting.start)
    const meetingEnd = new Date(meeting.end)

    if (now < meetingStart) {
      return 'upcoming'
    } else if (now >= meetingStart && now <= meetingEnd) {
      return 'ongoing'
    } else {
      return 'completed'
    }
  }

  // Memoized filtered meetings to prevent unnecessary recalculations
  const filteredMeetings = useMemo(() => {
    let result = [...meetings]

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      result = result.filter(
        meeting =>
          meeting.title.toLowerCase().includes(searchLower) ||
          meeting.User.name.toLowerCase().includes(searchLower) ||
          meeting.Teacher.name.toLowerCase().includes(searchLower) ||
          meeting.Post.subject.toLowerCase().includes(searchLower) ||
          meeting.User.email.toLowerCase().includes(searchLower) ||
          meeting.Teacher.email.toLowerCase().includes(searchLower)
      )
    }

    if (statusFilter) {
      result = result.filter(
        meeting => getMeetingStatus(meeting) === statusFilter
      )
    }

    if (subjectFilter) {
      result = result.filter(meeting =>
        meeting.Post.subject.toLowerCase().includes(subjectFilter.toLowerCase())
      )
    }

    if (dateRangeFilter) {
      const today = new Date()
      const filterDate = new Date(today)

      switch (dateRangeFilter) {
        case 'today':
          filterDate.setHours(23, 59, 59, 999)
          result = result.filter(meeting => {
            const meetingDate = new Date(meeting.date)
            return meetingDate >= today && meetingDate <= filterDate
          })
          break
        case 'this_week':
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - today.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          weekEnd.setHours(23, 59, 59, 999)
          result = result.filter(meeting => {
            const meetingDate = new Date(meeting.date)
            return meetingDate >= weekStart && meetingDate <= weekEnd
          })
          break
        case 'this_month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
          const monthEnd = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
          )
          monthEnd.setHours(23, 59, 59, 999)
          result = result.filter(meeting => {
            const meetingDate = new Date(meeting.date)
            return meetingDate >= monthStart && meetingDate <= monthEnd
          })
          break
      }
    }

    return result
  }, [meetings, searchTerm, statusFilter, subjectFilter, dateRangeFilter])

  // Enhanced error handling
  const handleApiError = useCallback(
    (error: unknown, defaultMessage: string) => {
      console.error('API Error:', error)
      const message = error instanceof Error ? error.message : defaultMessage
      showToast(message, 'error')
    },
    [showToast]
  )

  // Meetings fetching function
  const fetchMeetings = useCallback(async () => {
    try {
      setLoadingStates(prev => ({ ...prev, fetchingMeetings: true }))
      const response = await api.get('/dashboard/meetings')
      const data = response.data as Meeting[]

      // Validate data structure
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from server')
      }

      setMeetings(data)
      console.log('Fetched meetings:', data)
    } catch (error) {
      handleApiError(error, 'Failed to fetch meetings')
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchingMeetings: false }))
    }
  }, [handleApiError])

  // Initial data fetching with proper error handling
  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  // Enhanced delete functionality with confirmation
  const deleteMeeting = useCallback(
    async (meetingId: string) => {
      try {
        setLoadingStates(prev => ({ ...prev, deletingMeeting: meetingId }))

        await api.delete(`/dashboard/meetings/${meetingId}`)

        setMeetings(prev => prev.filter(meeting => meeting.id !== meetingId))
        showToast('Meeting deleted successfully')
        setIsDeleteDialogOpen(false)
        setMeetingToDelete(null)
      } catch (error) {
        handleApiError(error, 'Failed to delete meeting')
      } finally {
        setLoadingStates(prev => ({ ...prev, deletingMeeting: null }))
      }
    },
    [handleApiError, showToast]
  )

  // Dialog helpers
  const openDeleteDialog = useCallback((meeting: Meeting) => {
    setMeetingToDelete(meeting)
    setIsDeleteDialogOpen(true)
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false)
    setMeetingToDelete(null)
  }, [])

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setStatusFilter('')
    setSubjectFilter('')
    setDateRangeFilter('')
  }, [])

  // Format date and time helpers
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const upcomingMeetings = filteredMeetings.filter(
      m => getMeetingStatus(m) === 'upcoming'
    )
    const ongoingMeetings = filteredMeetings.filter(
      m => getMeetingStatus(m) === 'ongoing'
    )
    const completedMeetings = filteredMeetings.filter(
      m => getMeetingStatus(m) === 'completed'
    )
    const ratedMeetings = completedMeetings.filter(m => m.Rating.length > 0)

    return {
      total: filteredMeetings.length,
      active: upcomingMeetings.length + ongoingMeetings.length,
      upcoming: upcomingMeetings.length,
      ongoing: ongoingMeetings.length,
      completed: completedMeetings.length,
      rated: ratedMeetings.length
    }
  }, [filteredMeetings])

  // Average rating calculation
  const getAverageRating = (meeting: Meeting) => {
    if (meeting.Rating.length === 0) return 0
    const sum = meeting.Rating.reduce((acc, rating) => acc + rating.rating, 0)
    return (sum / meeting.Rating.length).toFixed(1)
  }

  // Enhanced toast styling with solid backgrounds
  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-600 border-emerald-300'
      case 'error':
        return 'bg-red-600 border-red-300'
      case 'info':
        return 'bg-blue-600 border-blue-300'
      default:
        return 'bg-slate-600 border-slate-300'
    }
  }

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <Check className='h-5 w-5 text-white drop-shadow-sm' />
      case 'error':
        return <AlertTriangle className='h-5 w-5 text-white drop-shadow-sm' />
      case 'info':
        return <Video className='h-5 w-5 text-white drop-shadow-sm' />
      default:
        return <Check className='h-5 w-5 text-white drop-shadow-sm' />
    }
  }

  // Show loading state during initial fetch
  if (loadingStates.fetchingMeetings) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='p-8 bg-white rounded-2xl shadow-xl border border-blue-300'>
            <Loader2 className='h-16 w-16 animate-spin mx-auto mb-6 text-blue-600' />
            <p className='text-slate-600 text-xl font-medium'>
              Loading meetings...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='p-6 lg:p-8'>
        {/* Enhanced Header with Interactive Elements */}
        <header className='mb-8 bg-white p-8 rounded-2xl shadow-lg border border-blue-300'>
          <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6'>
            <div className='flex-1'>
              <div className='flex items-center gap-4 mb-4'>
                <div className='p-3 bg-blue-600 rounded-2xl shadow-lg'>
                  <Video className='h-8 w-8 text-white' />
                </div>
                <div>
                  <h1 className='text-4xl lg:text-6xl font-bold text-blue-700'>
                    Meeting Management
                  </h1>
                  <div className='flex items-center gap-2 mt-2'>
                    <div className='h-2 w-2 bg-emerald-600 rounded-full animate-pulse'></div>
                    <span className='text-sm text-emerald-700 font-medium'>
                      System Online
                    </span>
                  </div>
                </div>
              </div>
              <p className='text-slate-600 text-lg lg:text-xl max-w-2xl'>
                Manage all tutoring sessions and meetings on the platform (
                {meetings.length} total meetings)
              </p>
            </div>
            <div className='flex gap-3'>
              <Button
                onClick={clearFilters}
                variant='outline'
                className='flex items-center gap-2 hover:shadow-lg transition-all duration-300 bg-white border-blue-300 text-blue-700 hover:bg-blue-50'
              >
                <Filter className='h-5 w-5' />
                Clear Filters
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant='outline'
                className='flex items-center gap-2 bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-700 hover:-translate-y-1'
              >
                <RefreshCw className='h-5 w-5' />
                Refresh Data
              </Button>
            </div>
          </div>
        </header>

        {/* Enhanced Summary Cards */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8'>
          <Card className='group hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 border border-blue-300 rounded-2xl'>
            <CardContent className='p-8'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-4 rounded-2xl bg-blue-50 group-hover:scale-105 transition-all duration-300 shadow-md'>
                  <Calendar className='h-8 w-8 text-blue-600' />
                </div>
                <div className='text-right'>
                  <div className='h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg'>
                    <TrendingUp className='h-4 w-4 text-white' />
                  </div>
                </div>
              </div>
              <div className='space-y-2'>
                <p className='text-sm font-bold text-slate-600 uppercase tracking-wider'>
                  Upcoming
                </p>
                <h3 className='text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300'>
                  {summaryStats.upcoming}
                </h3>{' '}
                <p className='text-sm font-semibold text-blue-700 flex items-center gap-1'>
                  <Calendar className='h-3 w-3' />
                  Scheduled meetings
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className='group hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 border border-emerald-300 rounded-2xl'>
            <CardContent className='p-8'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-4 rounded-2xl bg-emerald-50 group-hover:scale-105 transition-all duration-300 shadow-md'>
                  <Video className='h-8 w-8 text-emerald-600' />
                </div>
                <div className='text-right'>
                  <div className='h-8 w-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg'>
                    <Video className='h-4 w-4 text-white' />
                  </div>
                </div>
              </div>
              <div className='space-y-2'>
                <p className='text-sm font-bold text-slate-600 uppercase tracking-wider'>
                  Ongoing
                </p>
                <h3 className='text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300'>
                  {summaryStats.ongoing}
                </h3>{' '}
                <p className='text-sm font-semibold text-emerald-700 flex items-center gap-1'>
                  <Video className='h-3 w-3' />
                  Live sessions
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className='group hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 border border-purple-300 rounded-2xl'>
            <CardContent className='p-8'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-4 rounded-2xl bg-purple-50 group-hover:scale-105 transition-all duration-300 shadow-md'>
                  <Check className='h-8 w-8 text-purple-600' />
                </div>
                <div className='text-right'>
                  <div className='h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg'>
                    <Check className='h-4 w-4 text-white' />
                  </div>
                </div>
              </div>
              <div className='space-y-2'>
                <p className='text-sm font-bold text-slate-600 uppercase tracking-wider'>
                  Completed
                </p>
                <h3 className='text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300'>
                  {summaryStats.completed}
                </h3>{' '}
                <p className='text-sm font-semibold text-purple-700 flex items-center gap-1'>
                  <Check className='h-3 w-3' />
                  Finished sessions
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className='group hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 border border-amber-300 rounded-2xl'>
            <CardContent className='p-8'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-4 rounded-2xl bg-amber-50 group-hover:scale-105 transition-all duration-300 shadow-md'>
                  <Star className='h-8 w-8 text-amber-600' />
                </div>
                <div className='text-right'>
                  <div className='h-8 w-8 bg-amber-600 rounded-full flex items-center justify-center shadow-lg'>
                    <Star className='h-4 w-4 text-white' />
                  </div>
                </div>
              </div>
              <div className='space-y-2'>
                <p className='text-sm font-bold text-slate-600 uppercase tracking-wider'>
                  Rated
                </p>
                <h3 className='text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300'>
                  {summaryStats.rated}
                </h3>{' '}
                <p className='text-sm font-semibold text-amber-700 flex items-center gap-1'>
                  <Star className='h-3 w-3' />
                  With feedback
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Table Card */}
        <Card className='group shadow-xl border border-blue-300 bg-white hover:-translate-y-1 transition-all duration-300 rounded-2xl'>
          <CardHeader className='border-b border-slate-200 pb-6'>
            <CardTitle className='text-xl font-bold text-slate-800'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <div className='p-3 rounded-2xl bg-blue-600 mr-3 shadow-lg'>
                    <Video className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <h3 className='text-lg font-bold'>All Meetings</h3>
                    <p className='text-sm text-slate-600'>
                      {filteredMeetings.length !== meetings.length
                        ? `${filteredMeetings.length} filtered from ${meetings.length} total`
                        : `${meetings.length} total meetings`}
                    </p>
                  </div>
                </div>
                <Badge className='bg-blue-50 text-blue-800 border-blue-300'>
                  <Activity className='h-3 w-3 mr-1' />
                  Live Data
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className='p-8'>
            {/* Enhanced Filter Section */}
            <Card className='shadow-lg border border-indigo-300 bg-white rounded-2xl mb-6'>
              <CardContent className='p-6'>
                <h3 className='text-lg font-bold text-slate-800 mb-2'>
                  Filter Meetings
                </h3>
                <p className='text-slate-600 text-sm mb-6'>
                  Use the filters below to find specific meetings
                </p>

                <div className='flex gap-4 flex-wrap'>
                  <div className='relative max-w-xs'>
                    <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
                    <Input
                      className='pl-8 max-w-xs bg-white border-slate-300 focus:border-blue-500 transition-all duration-300'
                      placeholder='Search by title, student, teacher, subject...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      aria-label='Search meetings'
                    />
                  </div>

                  <select
                    className='h-10 rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 transition-all duration-300'
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    aria-label='Filter by status'
                  >
                    <option value=''>All Status</option>
                    <option value='upcoming'>Upcoming</option>
                    <option value='ongoing'>Ongoing</option>
                    <option value='completed'>Completed</option>
                  </select>

                  <Input
                    className='max-w-xs bg-white border-slate-300 focus:border-blue-500 transition-all duration-300'
                    placeholder='Filter by subject...'
                    value={subjectFilter}
                    onChange={e => setSubjectFilter(e.target.value)}
                    aria-label='Filter by subject'
                  />

                  <select
                    className='h-10 rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 transition-all duration-300'
                    value={dateRangeFilter}
                    onChange={e => setDateRangeFilter(e.target.value)}
                    aria-label='Filter by date range'
                  >
                    <option value=''>All Dates</option>
                    <option value='today'>Today</option>
                    <option value='this_week'>This Week</option>
                    <option value='this_month'>This Month</option>
                  </select>

                  {(searchTerm ||
                    statusFilter ||
                    subjectFilter ||
                    dateRangeFilter) && (
                    <Button
                      variant='outline'
                      onClick={clearFilters}
                      className='text-slate-600 bg-white border-slate-300 hover:bg-slate-50 transition-all duration-300'
                    >
                      <Filter className='h-4 w-4 mr-2' />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Table Content */}
            {loadingStates.fetchingMeetings ? (
              <div className='flex items-center justify-center h-64'>
                <div className='text-center'>
                  <Loader2 className='h-16 w-16 animate-spin mx-auto mb-4 text-blue-600' />
                  <p className='text-slate-600 font-medium'>
                    Loading meetings...
                  </p>
                </div>
              </div>
            ) : filteredMeetings.length > 0 ? (
              <div className='overflow-x-auto rounded-2xl shadow-lg'>
                <Table className='relative'>
                  <TableHeader className='bg-slate-50 border-b border-slate-200'>
                    <TableRow className='hover:bg-slate-100 transition-all duration-300'>
                      <TableHead className='font-bold text-slate-800 py-4 px-6'>
                        <div className='flex items-center gap-2'>
                          <Video className='h-4 w-4 text-slate-600' />
                          Meeting Details
                        </div>
                      </TableHead>
                      <TableHead className='font-bold text-slate-800 py-4 px-6'>
                        <div className='flex items-center gap-2'>
                          <Users className='h-4 w-4 text-slate-600' />
                          Participants
                        </div>
                      </TableHead>
                      <TableHead className='font-bold text-slate-800 py-4 px-6'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4 text-slate-600' />
                          Schedule
                        </div>
                      </TableHead>
                      <TableHead className='font-bold text-slate-800 py-4 px-6'>
                        <div className='flex items-center gap-2'>
                          <Activity className='h-4 w-4 text-slate-600' />
                          Status
                        </div>
                      </TableHead>
                      <TableHead className='font-bold text-slate-800 py-4 px-6'>
                        <div className='flex items-center gap-2'>
                          <Star className='h-4 w-4 text-slate-600' />
                          Rating
                        </div>
                      </TableHead>
                      <TableHead className='font-bold text-slate-800 py-4 px-6'>
                        <div className='flex items-center gap-2'>
                          <ExternalLink className='h-4 w-4 text-slate-600' />
                          Link
                        </div>
                      </TableHead>
                      <TableHead className='font-bold text-slate-800 py-4 px-6 text-right'>
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className='bg-white'>
                    {filteredMeetings.map((meeting, index) => {
                      const status = getMeetingStatus(meeting)
                      const averageRating = getAverageRating(meeting)
                      const duration = Math.round(
                        (new Date(meeting.end).getTime() -
                          new Date(meeting.start).getTime()) /
                          (1000 * 60)
                      )

                      return (
                        <TableRow
                          key={meeting.id}
                          className='hover:bg-blue-50 transition-all duration-300 hover:shadow-md border-b border-slate-100 group'
                          style={{
                            animationDelay: `${index * 50}ms`,
                            animation: 'fadeInUp 0.5s ease-out forwards'
                          }}
                        >
                          <TableCell className='py-6 px-6'>
                            <div className='space-y-2'>
                              <div className='font-semibold text-slate-900 text-lg'>
                                {meeting.title}
                              </div>
                              <div className='text-sm text-slate-600'>
                                <div className='flex items-center gap-2 mb-1'>
                                  <div className='p-1 bg-blue-600 rounded text-white'>
                                    <Video className='h-3 w-3' />
                                  </div>
                                  {meeting.Post.subject} - Class{' '}
                                  {meeting.Post.Class}
                                </div>
                                <div className='text-xs text-slate-500'>
                                  ID: {meeting.id.slice(0, 8)}... |{' '}
                                  {meeting.Post.medium} | ₹{meeting.Post.fees}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className='py-6 px-6'>
                            <div className='space-y-3'>
                              <div className='flex items-center gap-3'>
                                <div className='p-2 bg-blue-600 rounded-lg shadow-sm'>
                                  <Users className='h-4 w-4 text-white' />
                                </div>
                                <div>
                                  <div className='font-medium text-slate-900'>
                                    {meeting.User.name}
                                  </div>
                                  <div className='text-xs text-slate-500 flex items-center gap-1'>
                                    <Mail className='h-3 w-3' />
                                    {meeting.User.email}
                                  </div>
                                </div>
                              </div>
                              <div className='flex items-center gap-3'>
                                <div className='p-2 bg-purple-600 rounded-lg shadow-sm'>
                                  <Users className='h-4 w-4 text-white' />
                                </div>
                                <div>
                                  <div className='font-medium text-slate-900'>
                                    {meeting.Teacher.name}
                                  </div>
                                  <div className='text-xs text-slate-500 flex items-center gap-1'>
                                    <Mail className='h-3 w-3' />
                                    {meeting.Teacher.email}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className='py-6 px-6'>
                            <div className='space-y-2'>
                              <div className='flex items-center gap-2'>
                                <Calendar className='h-4 w-4 text-blue-700' />
                                <span className='font-medium text-slate-900'>
                                  {formatDate(meeting.date)}
                                </span>
                              </div>
                              <div className='flex items-center gap-2 text-sm text-slate-600'>
                                <Clock className='h-3 w-3' />
                                <span>
                                  {formatTime(meeting.start)} -{' '}
                                  {formatTime(meeting.end)}
                                </span>
                              </div>
                              <div className='text-xs text-slate-500'>
                                Duration: {duration} minutes
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className='py-6 px-6'>
                            <Badge
                              className={`shadow-md border-0 text-white ${
                                status === 'ongoing'
                                  ? 'bg-emerald-600'
                                  : status === 'upcoming'
                                  ? 'bg-blue-600'
                                  : 'bg-slate-600'
                              }`}
                            >
                              {status === 'ongoing' && (
                                <Video className='h-3 w-3 mr-1' />
                              )}
                              {status === 'upcoming' && (
                                <Calendar className='h-3 w-3 mr-1' />
                              )}
                              {status === 'completed' && (
                                <Check className='h-3 w-3 mr-1' />
                              )}
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className='py-6 px-6'>
                            {meeting.Rating.length > 0 ? (
                              <div className='flex items-center gap-2'>
                                {' '}
                                <div className='flex items-center gap-1'>
                                  <Star className='h-4 w-4 text-amber-600 fill-current' />
                                  <span className='font-medium text-slate-900'>
                                    {averageRating}
                                  </span>
                                </div>
                                <span className='text-sm text-slate-500'>
                                  ({meeting.Rating.length})
                                </span>
                              </div>
                            ) : (
                              <span className='text-sm text-slate-400'>
                                No ratings
                              </span>
                            )}
                          </TableCell>
                          <TableCell className='py-6 px-6'>
                            {meeting.link ? (
                              <a
                                href={meeting.link}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex items-center gap-2 text-blue-700 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg'
                              >
                                <ExternalLink className='h-4 w-4' />
                                <span className='text-sm font-medium'>
                                  Join Meeting
                                </span>
                              </a>
                            ) : (
                              <span className='text-sm text-slate-400'>
                                No link available
                              </span>
                            )}
                          </TableCell>
                          <TableCell className='py-6 px-6'>
                            <div className='flex gap-2 justify-end'>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => openDeleteDialog(meeting)}
                                disabled={
                                  loadingStates.deletingMeeting === meeting.id
                                }
                                className='text-red-700 hover:text-red-800 border-red-300 hover:border-red-400 transition-all duration-300 hover:scale-105 hover:shadow-md bg-white'
                                aria-label={`Delete meeting ${meeting.title}`}
                              >
                                {loadingStates.deletingMeeting ===
                                meeting.id ? (
                                  <Loader2 className='h-4 w-4 animate-spin' />
                                ) : (
                                  <>
                                    <Trash2 className='h-4 w-4 mr-1' />
                                    Delete
                                  </>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className='py-16 text-center'>
                <div className='mb-8'>
                  <div className='p-6 bg-blue-600 rounded-3xl shadow-2xl mx-auto w-fit'>
                    <Video className='h-16 w-16 text-white' />
                  </div>
                </div>
                <h3 className='text-2xl font-bold text-slate-800 mb-3'>
                  No meetings found
                </h3>
                <p className='text-slate-600 text-lg max-w-md mx-auto mb-6'>
                  {searchTerm ||
                  statusFilter ||
                  subjectFilter ||
                  dateRangeFilter
                    ? 'No meetings match your current search criteria'
                    : 'No meetings available to display'}
                </p>
                {(searchTerm ||
                  statusFilter ||
                  subjectFilter ||
                  dateRangeFilter) && (
                  <Button
                    variant='outline'
                    onClick={clearFilters}
                    className='bg-white border-slate-300 hover:bg-slate-50 transition-all duration-300 hover:scale-105'
                  >
                    <Filter className='h-4 w-4 mr-2' />
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Toast Notifications */}
      <div className='fixed top-6 right-6 z-50 space-y-3 max-w-sm'>
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={`group relative p-5 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20 transform transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-3xl ${getToastStyles(
              toast.type
            )}`}
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
            role='alert'
            aria-live='polite'
          >
            <div className='absolute inset-0 rounded-2xl bg-white/10 opacity-50 group-hover:opacity-70 transition-opacity duration-300'></div>

            <div className='absolute top-2 right-2 w-2 h-2 bg-white/30 rounded-full animate-pulse'></div>
            <div className='absolute bottom-3 left-3 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse delay-700'></div>

            <div className='relative flex items-start justify-between gap-3'>
              <div className='flex items-start gap-3 flex-1'>
                <div className='flex-shrink-0 p-2 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110'>
                  {getToastIcon(toast.type)}
                </div>
                <div className='flex-1 pt-1'>
                  <p className='text-sm font-semibold leading-relaxed text-white drop-shadow-sm'>
                    {toast.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className='flex-shrink-0 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 opacity-70 hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95'
                aria-label='Close notification'
              >
                <X className='h-4 w-4 text-white drop-shadow-sm' />
              </button>
            </div>

            <div className='absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden'>
              <div
                className='h-full bg-white/40 rounded-b-2xl transition-all duration-[5000ms] ease-linear'
                style={{ width: '0%' }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Delete Confirmation Dialog */}
      {isDeleteDialogOpen && meetingToDelete && (
        <div
          className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'
          onClick={closeDeleteDialog}
          role='dialog'
          aria-modal='true'
          aria-labelledby='delete-dialog-title'
        >
          <div
            className='bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-red-300'
            onClick={e => e.stopPropagation()}
          >
            <div className='flex items-center mb-6'>
              <div className='p-3 bg-red-600 rounded-2xl mr-4 shadow-lg'>
                <AlertTriangle className='h-6 w-6 text-white' />
              </div>
              <div>
                <h3
                  id='delete-dialog-title'
                  className='text-xl font-bold text-slate-900'
                >
                  Delete Meeting
                </h3>
                <p className='text-sm text-slate-600'>
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className='text-slate-700 mb-8 leading-relaxed'>
              Are you sure you want to delete the meeting{' '}
              <strong>&ldquo;{meetingToDelete.title}&rdquo;</strong> scheduled
              for <strong>{formatDateTime(meetingToDelete.start)}</strong>? This
              will permanently remove the meeting and all associated data.
            </p>
            <div className='flex justify-end gap-3'>
              <Button
                variant='outline'
                onClick={closeDeleteDialog}
                disabled={loadingStates.deletingMeeting === meetingToDelete.id}
                className='bg-white border-slate-300 hover:bg-slate-50 transition-all duration-300'
              >
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={() => deleteMeeting(meetingToDelete.id)}
                disabled={loadingStates.deletingMeeting === meetingToDelete.id}
                className='bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-105'
              >
                {loadingStates.deletingMeeting === meetingToDelete.id ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className='h-4 w-4 mr-2' />
                    Delete Meeting
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
