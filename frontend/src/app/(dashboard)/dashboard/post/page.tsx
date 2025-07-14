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
  User,
  BookOpen,
  Loader2,
  Check,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Shield,
  Clock3,
  Activity,
  Mail,
  Trash2,
  Filter,
  Monitor,
  Settings
} from 'lucide-react'
import { api } from '@/_lib/api'
import { dashboardStyles } from '@/styles/dashboard'
import { toast } from 'react-hot-toast'

// Enhanced interfaces with better typing
interface Post {
  id: string
  medium: string
  Class: string
  subject: string
  fees: string
  description: string
  preferableTime?: string
  preferableDate?: string
  booked: boolean
  createdAt: string
  updatedAt: string
  userId: string
  User: {
    id: string
    name: string
    email: string
  }
  TutorRequest: Array<{
    id: string
    userId: string
    User: {
      id: string
      name: string
      email: string
    }
  }>
  Rating: Array<{
    id: string
    rating: number
    ratingByUser: {
      id: string
      name: string
      email: string
    }
  }>
  Meeting: Array<{
    id: string
    title: string
    start: string
    end: string
  }>
  Payment: Array<{
    id: string
    amount: string
  }>
}

interface LoadingStates {
  fetchingPosts: boolean
  updatingPost: string | null
  deletingPost: string | null
}

export default function PostPage () {
  // Enhanced state management
  const [posts, setPosts] = useState<Post[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [mediumFilter, setMediumFilter] = useState<string>('')
  const [classFilter, setClassFilter] = useState<string>('')
  const [subjectFilter, setSubjectFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [postToDelete, setPostToDelete] = useState<Post | null>(null)
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    fetchingPosts: true,
    updatingPost: null,
    deletingPost: null
  })

  // Memoized filtered posts to prevent unnecessary recalculations
  const filteredPosts = useMemo(() => {
    let result = [...posts]

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      result = result.filter(
        post =>
          post.subject.toLowerCase().includes(searchLower) ||
          post.description.toLowerCase().includes(searchLower) ||
          post.User.name.toLowerCase().includes(searchLower) ||
          post.User.email.toLowerCase().includes(searchLower)
      )
    }

    if (mediumFilter) {
      result = result.filter(post => post.medium === mediumFilter)
    }

    if (classFilter) {
      result = result.filter(post => post.Class === classFilter)
    }

    if (subjectFilter) {
      result = result.filter(post =>
        post.subject.toLowerCase().includes(subjectFilter.toLowerCase())
      )
    }

    if (statusFilter) {
      result = result.filter(post =>
        statusFilter === 'booked' ? post.booked : !post.booked
      )
    }

    return result
  }, [
    posts,
    searchTerm,
    mediumFilter,
    classFilter,
    subjectFilter,
    statusFilter
  ])

  // Enhanced error handling
  const handleApiError = useCallback(
    (error: unknown, defaultMessage: string) => {
      console.error('API Error:', error)
      const message = error instanceof Error ? error.message : defaultMessage
      toast.error(message)
    },
    []
  )

  // Posts fetching function
  const fetchPosts = useCallback(async () => {
    try {
      setLoadingStates(prev => ({ ...prev, fetchingPosts: true }))
      const response = await api.get('/dashboard/posts')
      const data = response.data as Post[]

      // Validate data structure
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from server')
      }

      setPosts(data)
      console.log('Fetched posts:', data)
    } catch (error) {
      handleApiError(error, 'Failed to fetch posts')
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchingPosts: false }))
    }
  }, [handleApiError])

  // Initial data fetching with proper error handling
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Enhanced delete functionality with confirmation
  const deletePost = useCallback(
    async (postId: string) => {
      try {
        setLoadingStates(prev => ({ ...prev, deletingPost: postId }))

        await api.delete(`/dashboard/posts/${postId}`)

        setPosts(prev => prev.filter(post => post.id !== postId))
        toast.success('Post deleted successfully')
        setIsDeleteDialogOpen(false)
        setPostToDelete(null)
      } catch (error) {
        handleApiError(error, 'Failed to delete post')
      } finally {
        setLoadingStates(prev => ({ ...prev, deletingPost: null }))
      }
    },
    [handleApiError]
  )

  // Dialog helpers
  const openDeleteDialog = useCallback((post: Post) => {
    setPostToDelete(post)
    setIsDeleteDialogOpen(true)
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false)
    setPostToDelete(null)
  }, [])

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setMediumFilter('')
    setClassFilter('')
    setSubjectFilter('')
    setStatusFilter('')
  }, [])

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className='min-h-screen bg-slate-50 relative overflow-hidden'>
      <div className='relative z-10 p-6 lg:p-8'>
        {/* Enhanced Header */}
        <header className='mb-8 bg-white shadow-lg p-8 rounded-2xl border border-blue-300 hover:shadow-xl transition-all duration-300'>
          <div className='relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6'>
            <div className='flex-1'>
              <div className='flex items-center gap-4 mb-4'>
                <div className='p-3 bg-blue-600 rounded-2xl shadow-lg'>
                  <BookOpen className='h-8 w-8 text-white' />
                </div>
                <div>
                  <h1 className='text-4xl lg:text-6xl font-bold text-blue-700'>
                    Post Management
                  </h1>
                  <div className='flex items-center gap-2 mt-2'>
                    <div className='h-2 w-2 bg-emerald-500 rounded-full animate-pulse'></div>
                    <span className='text-sm text-emerald-700 font-medium'>
                      System Online
                    </span>
                  </div>
                </div>
              </div>
              <p className='text-slate-700 text-lg lg:text-xl max-w-2xl'>
                Manage and monitor all tutoring posts on your platform. Track
                requests, bookings, and student activities.
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
                  <BookOpen className='h-8 w-8 text-blue-600' />
                </div>
                <div className='text-right'>
                  <div className='h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg'>
                    <TrendingUp className='h-4 w-4 text-white' />
                  </div>
                </div>
              </div>
              <div className='space-y-2'>
                <p className='text-sm font-bold text-slate-600 uppercase tracking-wider'>
                  Total Posts
                </p>
                <h3 className='text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300'>
                  {posts.length}
                </h3>
                <p className='text-sm font-semibold text-blue-600 flex items-center gap-1'>
                  <TrendingUp className='h-3 w-3' />
                  All platform posts
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className='group hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 border border-emerald-300 rounded-2xl'>
            <CardContent className='p-8'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-4 rounded-2xl bg-emerald-50 group-hover:scale-105 transition-all duration-300 shadow-md'>
                  <Check className='h-8 w-8 text-emerald-600' />
                </div>
                <div className='text-right'>
                  <div className='h-8 w-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg'>
                    <Check className='h-4 w-4 text-white' />
                  </div>
                </div>
              </div>
              <div className='space-y-2'>
                <p className='text-sm font-bold text-slate-600 uppercase tracking-wider'>
                  Booked Posts
                </p>
                <h3 className='text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300'>
                  {posts.filter(p => p.booked).length}
                </h3>
                <p className='text-sm font-semibold text-emerald-600 flex items-center gap-1'>
                  <Check className='h-3 w-3' />
                  Successfully booked
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className='group hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 border border-orange-300 rounded-2xl'>
            <CardContent className='p-8'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-4 rounded-2xl bg-orange-50 group-hover:scale-105 transition-all duration-300 shadow-md'>
                  <Clock3 className='h-8 w-8 text-orange-600' />
                </div>
                <div className='text-right'>
                  <div className='h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center shadow-lg'>
                    <Clock3 className='h-4 w-4 text-white' />
                  </div>
                </div>
              </div>
              <div className='space-y-2'>
                <p className='text-sm font-bold text-slate-600 uppercase tracking-wider'>
                  Available Posts
                </p>
                <h3 className='text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300'>
                  {posts.filter(p => !p.booked).length}
                </h3>
                <p className='text-sm font-semibold text-orange-600 flex items-center gap-1'>
                  <Shield className='h-3 w-3' />
                  Awaiting tutors
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className='group hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 border border-purple-300 rounded-2xl'>
            <CardContent className='p-8'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-4 rounded-2xl bg-purple-50 group-hover:scale-105 transition-all duration-300 shadow-md'>
                  <User className='h-8 w-8 text-purple-600' />
                </div>
                <div className='text-right'>
                  <div className='h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg'>
                    <User className='h-4 w-4 text-white' />
                  </div>
                </div>
              </div>
              <div className='space-y-2'>
                <p className='text-sm font-bold text-slate-600 uppercase tracking-wider'>
                  Total Requests
                </p>
                <h3 className='text-4xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300'>
                  {posts.reduce(
                    (sum, post) => sum + post.TutorRequest.length,
                    0
                  )}
                </h3>
                <p className='text-sm font-semibold text-purple-600 flex items-center gap-1'>
                  <User className='h-3 w-3' />
                  Tutor applications
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
                    <BookOpen className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <h3 className='text-lg font-bold'>All Posts</h3>
                    <p className='text-sm text-slate-600'>
                      {filteredPosts.length !== posts.length
                        ? `${filteredPosts.length} filtered from ${posts.length} total`
                        : `${posts.length} total posts`}
                    </p>
                  </div>
                </div>
                <Badge className='bg-blue-50 text-blue-700 border-blue-300'>
                  <TrendingUp className='h-3 w-3 mr-1' />
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
                  Filter Posts
                </h3>
                <p className='text-slate-600 text-sm mb-6'>
                  Use the filters below to find specific posts
                </p>

                <div className='flex gap-4 flex-wrap'>
                  <div className='relative max-w-xs'>
                    <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
                    <Input
                      className='pl-8 max-w-xs bg-white border-slate-300 focus:border-blue-500 transition-all duration-300'
                      placeholder='Search by subject, description, student...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <select
                    className='h-10 rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 transition-all duration-300'
                    value={mediumFilter}
                    onChange={e => setMediumFilter(e.target.value)}
                  >
                    <option value=''>All Mediums</option>
                    <option value='online'>Online</option>
                    <option value='offline'>Offline</option>
                    <option value='hybrid'>Hybrid</option>
                  </select>

                  <select
                    className='h-10 rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 transition-all duration-300'
                    value={classFilter}
                    onChange={e => setClassFilter(e.target.value)}
                  >
                    <option value=''>All Classes</option>
                    <option value='1'>Class 1</option>
                    <option value='2'>Class 2</option>
                    <option value='3'>Class 3</option>
                    <option value='4'>Class 4</option>
                    <option value='5'>Class 5</option>
                    <option value='6'>Class 6</option>
                    <option value='7'>Class 7</option>
                    <option value='8'>Class 8</option>
                    <option value='9'>Class 9</option>
                    <option value='10'>Class 10</option>
                    <option value='11'>Class 11</option>
                    <option value='12'>Class 12</option>
                  </select>

                  <Input
                    className='max-w-xs bg-white border-slate-300 focus:border-blue-500 transition-all duration-300'
                    placeholder='Filter by subject...'
                    value={subjectFilter}
                    onChange={e => setSubjectFilter(e.target.value)}
                  />

                  <select
                    className='h-10 rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 transition-all duration-300'
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                  >
                    <option value=''>All Status</option>
                    <option value='available'>Available</option>
                    <option value='booked'>Booked</option>
                  </select>

                  {(searchTerm ||
                    mediumFilter ||
                    classFilter ||
                    subjectFilter ||
                    statusFilter) && (
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

            {/* Posts Table */}
            {loadingStates.fetchingPosts ? (
              <div className='flex items-center justify-center h-64'>
                <div className='text-center'>
                  <div
                    className={`${dashboardStyles.loadingSpinner} mb-4`}
                  ></div>
                  <p className='text-slate-600 font-medium'>Loading posts...</p>
                </div>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className='overflow-x-auto rounded-2xl shadow-lg'>
                <Table className='relative'>
                  <TableHeader className='bg-slate-50 border-b border-slate-200'>
                    <TableRow className='hover:bg-slate-100 transition-all duration-300'>
                      <TableHead className='font-bold text-slate-800 py-4 px-6'>
                        <div className='flex items-center gap-2'>
                          <User className='h-4 w-4 text-slate-600' />
                          Student Details
                        </div>
                      </TableHead>
                      <TableHead className='font-bold text-slate-800 py-4 px-6'>
                        <div className='flex items-center gap-2'>
                          <BookOpen className='h-4 w-4 text-slate-600' />
                          Subject & Class
                        </div>
                      </TableHead>
                      <TableHead className='font-bold text-slate-800 py-4 px-6'>
                        <div className='flex items-center gap-2'>
                          <Monitor className='h-4 w-4 text-slate-600' />
                          Fees & Medium
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
                          <TrendingUp className='h-4 w-4 text-slate-600' />
                          Requests
                        </div>
                      </TableHead>
                      <TableHead className='font-bold text-slate-800 py-4 px-6 text-right'>
                        <div className='flex items-center justify-end gap-2'>
                          <Settings className='h-4 w-4 text-slate-600' />
                          Actions
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className='bg-white'>
                    {filteredPosts.map((post, index) => (
                      <TableRow
                        key={post.id}
                        className='hover:bg-blue-50 transition-all duration-300 hover:shadow-md border-b border-slate-100 group'
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animation: 'fadeInUp 0.5s ease-out forwards'
                        }}
                      >
                        <TableCell className='py-6 px-6'>
                          <div className='flex items-center gap-4'>
                            <div className='relative'>
                              <div className='p-3 bg-blue-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300'>
                                <User className='h-5 w-5 text-white' />
                              </div>
                              <div className='absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm'></div>
                            </div>
                            <div className='space-y-1'>
                              <div className='font-semibold text-slate-900 text-lg'>
                                {post.User.name}
                              </div>
                              <div className='text-sm text-slate-600 flex items-center gap-2'>
                                <Mail className='h-3 w-3 text-slate-500' />
                                {post.User.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='py-6 px-6'>
                          <div className='space-y-2'>
                            <div className='font-semibold text-slate-800 text-lg'>
                              {post.subject}
                            </div>
                            <div className='flex items-center gap-2'>
                              <Badge className='bg-blue-600 text-white border-0 shadow-md'>
                                Class {post.Class}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='py-6 px-6'>
                          <div className='space-y-2'>
                            <div className='text-xl text-slate-800 font-medium'>
                              ৳{post.fees}
                            </div>
                            <Badge
                              className={`shadow-md border-0 ${
                                post.medium === 'online'
                                  ? 'bg-emerald-600 text-white'
                                  : post.medium === 'offline'
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-purple-600 text-white'
                              }`}
                            >
                              <Monitor className='h-3 w-3 mr-1' />
                              {post.medium}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className='py-6 px-6'>
                          <div className='space-y-2'>
                            <div className='flex items-center gap-2 text-sm text-slate-700'>
                              <Calendar className='h-4 w-4 text-blue-600' />
                              <span className='font-medium'>
                                {post.preferableTime || 'Flexible'}
                              </span>
                            </div>
                            <div className='text-sm text-slate-600'>
                              {post.preferableDate
                                ? formatDate(post.preferableDate)
                                : 'Flexible'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='py-6 px-6'>
                          <Badge
                            className={`shadow-md border-0 text-white ${
                              post.booked ? 'bg-red-600' : 'bg-emerald-600'
                            }`}
                          >
                            {post.booked ? (
                              <AlertTriangle className='h-3 w-3 mr-1' />
                            ) : (
                              <Check className='h-3 w-3 mr-1' />
                            )}
                            {post.booked ? 'Booked' : 'Available'}
                          </Badge>
                        </TableCell>
                        <TableCell className='py-6 px-6'>
                          <div className='flex items-center gap-2'>
                            <div className='p-2 bg-purple-600 rounded-xl shadow-md'>
                              <TrendingUp className='h-4 w-4 text-white' />
                            </div>
                            <div>
                              <div className='font-semibold text-slate-800 text-lg'>
                                {post.TutorRequest.length}
                              </div>
                              <div className='text-sm text-slate-500'>
                                request
                                {post.TutorRequest.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='py-6 px-6'>
                          <div className='flex gap-2 justify-end'>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => openDeleteDialog(post)}
                              disabled={loadingStates.deletingPost === post.id}
                              className='text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 transition-all duration-300 hover:scale-105 hover:shadow-md bg-white'
                            >
                              {loadingStates.deletingPost === post.id ? (
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className='py-16 text-center'>
                <div className='mb-8'>
                  <div className='p-6 bg-blue-600 rounded-3xl shadow-2xl mx-auto w-fit'>
                    <BookOpen className='h-16 w-16 text-white' />
                  </div>
                </div>
                <h3 className='text-2xl font-bold text-slate-800 mb-3'>
                  No posts found
                </h3>
                <p className='text-slate-600 text-lg max-w-md mx-auto mb-6'>
                  {searchTerm ||
                  mediumFilter ||
                  classFilter ||
                  subjectFilter ||
                  statusFilter
                    ? 'No posts match your current search criteria'
                    : 'No posts available to display'}
                </p>
                {(searchTerm ||
                  mediumFilter ||
                  classFilter ||
                  subjectFilter ||
                  statusFilter) && (
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

      {/* Enhanced Delete Confirmation Modal */}
      {isDeleteDialogOpen && postToDelete && (
        <div
          className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300'
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
                  Delete Post
                </h3>
                <p className='text-sm text-slate-600'>
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className='bg-slate-50 p-4 rounded-lg mb-6'>
              <p className='text-slate-700 mb-2 leading-relaxed'>
                Are you sure you want to delete this post?
              </p>
              <div className='text-sm text-slate-600 space-y-1'>
                <div>
                  <strong>Subject:</strong> {postToDelete.subject}
                </div>
                <div>
                  <strong>Student:</strong> {postToDelete.User.name}
                </div>
                <div>
                  <strong>Class:</strong> {postToDelete.Class}
                </div>
              </div>
            </div>

            <div className='flex justify-end gap-3'>
              <Button
                variant='outline'
                onClick={closeDeleteDialog}
                disabled={loadingStates.deletingPost === postToDelete.id}
                className='bg-white border-slate-300 hover:bg-slate-50 transition-all duration-300'
              >
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={() => deletePost(postToDelete.id)}
                disabled={loadingStates.deletingPost === postToDelete.id}
                className='bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-105'
              >
                {loadingStates.deletingPost === postToDelete.id ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className='h-4 w-4 mr-2' />
                    Delete Post
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
