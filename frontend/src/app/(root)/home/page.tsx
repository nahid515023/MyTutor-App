'use client'

import { useEffect, useState } from 'react'
import { api } from '@/_lib/api'
import { useSearchParams, useRouter } from 'next/navigation'
import PostCard from '@/components/postCard'
import FilterOptions from '@/components/FilterOptions'
import Pagination from '@/components/pagination'
import { Post } from '@/types/post'
import LoadingState from '@/components/loading/LoadingState'


export default function HomePage () {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterClass, setFilterClass] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterMedium, setFilterMedium] = useState('')
  const router = useRouter()
  const postsPerPage = 8

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get<{ posts: Post[]; total: number }>(
          `/posts?page=${currentPage}&limit=${postsPerPage}&search=${searchQuery || ''}&class=${filterClass}&subject=${filterSubject}&medium=${filterMedium}`
        )
        
        if (response.data && Array.isArray(response.data.posts)) {
          setPosts(response.data.posts)
          setTotalPages(Math.ceil(response.data.total / postsPerPage))
        } else {
          setPosts([])
          setTotalPages(1)
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
        setError('Failed to load posts. Please try again later.')
        setPosts([])
        setTotalPages(1)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [currentPage, searchQuery, filterClass, filterSubject, filterMedium])

  // Handle filter changes and reset pagination
  const handleFilterChange = (
    filterName: 'class' | 'subject' | 'medium',
    value: string
  ) => {
    if (filterName === 'class') {
      setFilterClass(value)
    } else if (filterName === 'subject') {
      setFilterSubject(value)
    } else if (filterName === 'medium') {
      setFilterMedium(value)
    }
    setCurrentPage(1)
  }

  // If a search query exists, filter posts based on it;
  // otherwise, use the dropdown filter values.
  const filtebluePosts = searchQuery
    ? posts.filter(post => {
        const searchLower = searchQuery.toLowerCase()
        return (
          (post.description && post.description.toLowerCase().includes(searchLower)) ||
          (post.subject && post.subject.toLowerCase().includes(searchLower)) ||
          (post.User?.name && post.User.name.toLowerCase().includes(searchLower)) ||
          (post.User?.education && post.User.education.toLowerCase().includes(searchLower)) ||
          (post.medium && post.medium.toLowerCase().includes(searchLower)) ||
          (post.Class && post.Class.toLowerCase().includes(searchLower)) ||
          (post.fees && post.fees.toLowerCase().includes(searchLower)) ||
          (post.preferableTime && post.preferableTime.toLowerCase().includes(searchLower))
        )
      })
    : posts.filter(post => {
        return (
          (!filterClass || (post.Class && post.Class === filterClass)) &&
          (!filterSubject || (post.subject && post.subject === filterSubject)) &&
          (!filterMedium || (post.medium && post.medium === filterMedium))
        )
      })

  // Calculate pagination values
  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = Array.isArray(filtebluePosts) ? filtebluePosts.slice(indexOfFirstPost, indexOfLastPost) : []

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Helper function to format post creation date
  function getDateInPost (date: string) {
    if (!date) return 'Unknown'
    
    try {
      const postDate = new Date(date)
      if (isNaN(postDate.getTime())) return 'Unknown'
      
      const currentDate = new Date()
      const diff = currentDate.getTime() - postDate.getTime()
      const days = diff / (1000 * 60 * 60 * 24)
      
      if (days >= 1) {
        return Math.floor(days) + ' days ago'
      } else if (days * 24 >= 1) {
        return Math.floor(days * 24) + ' hours ago'
      } else if (days * 24 * 60 >= 1) {
        return Math.floor(days * 24 * 60) + ' minutes ago'
      } else {
        return 'Just now'
      }
    } catch (error) {
      console.error('Error parsing date:', error)
      return 'Unknown'
    }
  }

  const clearAllFilters = () => {
    setFilterClass('')
    setFilterSubject('')
    setFilterMedium('')
    setCurrentPage(1)
  }

  const clearSearch = () => {
    router.push('/home')
  }

  return (
    <div>
      <div className='min-h-screen px-4 sm:px-6 lg:px-8'> 
        <div className='container mx-auto max-w-screen-xl'> 
          {searchQuery && (<div className='mb-10 text-center'> 
            <h2 className='text-5xl sm:text-6xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 mt-12 mb-3'> {/* Enhanced title style */}
              Find Your Perfect Tutor
            </h2>
            {searchQuery ? (
              <div className='flex items-center justify-center gap-2.5 mt-2'> 
                <p className='text-gray-700 dark:text-gray-300 text-xl sm:text-2xl'>
                  Search results for &quot;{searchQuery}&quot;
                </p>
                <button
                  onClick={clearSearch}
                  className='inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-700 dark:bg-opacity-30 dark:hover:bg-blue-600 dark:hover:bg-opacity-40 transition-colors duration-200 shadow-sm' // Enhanced button style
                >
                  <span>Clear</span>
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <p className='text-gray-600 dark:text-gray-400 text-base sm:text-lg'> {/* Increased text size */}
                Browse available tutor listings or filter by your preferences
              </p>
            )}
          </div>)}

          {/* Main content with filters */}
          <div className='flex flex-col lg:flex-row gap-8'> 
            <div className='w-full  mt-3 lg:w-4/12 xl:w-3/12'> 
              <div className='bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] overflow-y-auto'> 
                <h3 className='text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3'> 
                  <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-lg'>
                    <svg className='w-5 h-5 text-blue-600 dark:text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z' />
                    </svg>
                  </div>
                  <span>Filter Posts</span>
                </h3>
                <FilterOptions
                  filterClass={filterClass}
                  filterSubject={filterSubject}
                  filterMedium={filterMedium}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearAllFilters}
                />
              </div>
            </div>
            
            {/* Posts section - responsive width */}
            <div className='w-full lg:w-8/12 xl:w-9/12'>
              {/* Error state */}
              {error && (
                <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6'>
                  <div className='flex items-center'>
                    <svg className='w-6 h-6 text-red-500 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    <p className='text-red-700 dark:text-red-300 font-medium'>{error}</p>
                  </div>
                </div>
              )}
              
              {/* Loading state */}
              {loading ? (
                <LoadingState
                  title="Loading Posts"
                  message="Fetching the latest tutor posts for you..."
                  size="large"
                />
              ) : (
                <>
                  {/* Posts Listed Row by Row */}
                  <div className='flex flex-col gap-8 m-3'> {/* Increased gap */}
                    {currentPosts.length > 0 ? (
                      currentPosts
                        .filter(post => post && post.id) // Filter out any null/undefined posts
                        .map(post => (
                          <PostCard
                            key={post.id}
                            post={post}
                            booked={post.booked || false}
                            getDateInPost={getDateInPost}
                          />
                        ))
                    ) : (
                      <div className='bg-white dark:bg-gray-800 shadow-xl rounded-xl p-10 text-center'> {/* Enhanced card style */}
                        <svg className='mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
                          <path vectorEffect='non-scaling-stroke' strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z' />
                        </svg>
                        <h3 className='text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2'>
                          No Posts Found
                        </h3>
                        <p className='text-gray-600 dark:text-gray-400 text-base mb-6'>
                          We couldn&apos;t find any posts matching your current filters or search query.
                        </p>
                        <button
                          onClick={searchQuery ? clearSearch : clearAllFilters}
                          className='px-6 py-2.5 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
                        >
                          {searchQuery ? 'Clear Search Query' : 'Clear All Filters'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  {Array.isArray(filtebluePosts) && filtebluePosts.length > postsPerPage && !loading && !error && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onNext={nextPage}
                      onPrev={prevPage}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
