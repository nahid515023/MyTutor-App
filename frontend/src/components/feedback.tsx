'use client'
import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { FaStar, FaRegStar } from 'react-icons/fa'
import { api } from '@/_lib/api'
import Link from 'next/link'

interface Review {
  id: string
  rating: number
  review: string
  updatedAt: string
  postId: string
  ratingByUser: {
    name: string
    profileImage?: string
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  profileImage: string
  coverImage: string
  bio: string
  createdAt: string
  updatedAt: string
  gender: string
  phone: string
  location: string
  grade: string
  education: string[]
}

interface ProgressBarProps {
  label: string
  value: number
  count?: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, value, count }) => (
  <div className='flex items-center w-full gap-2 text-sm'>
    <span className='w-24 flex-shrink-0 font-semibold text-gray-700 dark:text-gray-300'>
      {label}
    </span>
    <div className='flex-grow flex items-center gap-3'>
      <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3'>
        <div
          className='bg-orange-400 dark:bg-orange-500 h-3 rounded-full transition-all duration-500 ease-out'
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
    {count !== undefined && (
      <span className='text-sm text-gray-500 dark:text-gray-400 w-8 flex-shrink-0 text-right'>
        {count}
      </span>
    )}
  </div>
)

interface ReviewCardProps {
  name: string
  rating: number
  time: string
  text: string
  imageUrl: string
  postId: string
}

// Helper function to format post creation date
function getTimeAgo (date: string): string {
  const postDate = new Date(date)
  const currentDate = new Date()
  const diff = currentDate.getTime() - postDate.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  } else {
    return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`
  }
}

const StarRating: React.FC<{ rating: number; size?: string }> = ({
  rating,
  size = 'text-base'
}) => (
  <div className={`flex text-orange-400 ${size}`}>
    {[...Array(5)].map((_, i) =>
      i < rating ? (
        <FaStar key={i} className='mr-1' />
      ) : (
        <FaRegStar key={i} className='mr-1' />
      )
    )}
  </div>
)

const ReviewCard: React.FC<ReviewCardProps> = ({
  name,
  rating,
  time,
  text,
  imageUrl,
  postId
}) => (
  <div className='bg-gray-50 dark:bg-gray-800 p-5 rounded-lg mt-4 hover:shadow-md transition duration-300 border border-gray-200 dark:border-gray-700'>
    <div className='flex items-center mb-3'>
      <div className='relative h-12 w-12 rounded-full overflow-hidden'>
        <Image
          className='object-cover'
          src={imageUrl}
          alt={name}
          width={48}
          height={48}
          onError={e => {
            // Fallback for broken images
            const target = e.target as HTMLImageElement
            target.src = 'https://via.placeholder.com/48'
          }}
        />
      </div>
      <div className='ml-4 flex justify-between w-full'>
        <div>
          <p className='text-gray-800 dark:text-gray-200 font-semibold'>{name}</p>
          <StarRating rating={rating} />
        </div>
        <div className='text-right'>
          <p className='text-gray-500 dark:text-gray-400 text-sm'>{getTimeAgo(time)}</p>
          <Link
            className='text-blue-600 dark:text-blue-400 text-sm hover:underline'
            href={`/post/${postId}`}
          >
            View Post
          </Link>
        </div>
      </div>
    </div>
    <p className='text-gray-700 dark:text-gray-300 mt-2 leading-relaxed'>{text}</p>
  </div>
)

export default function FeedbackComponent (props: {
  userData: User
  isUserProfile: boolean
}) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get(
          `/rating/allRatingByUser/${props.userData.id}`
        )
        if (response.status !== 200) {
          throw new Error('Error fetching reviews')
        }
        const data = response.data as { ratings: Review[] }
        setReviews(data.ratings)
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchReviews()
  }, [props.userData.id])

  // Calculate overall rating and distribution
  const ratingStats = useMemo(() => {
    if (reviews.length === 0) return { average: 0, counts: [0, 0, 0, 0, 0] }

    const counts = [0, 0, 0, 0, 0] // Index 0 = 1 star, index 4 = 5 stars
    let sum = 0

    reviews.forEach(review => {
      sum += review.rating
      if (review.rating >= 1 && review.rating <= 5) {
        counts[review.rating - 1]++
      }
    })

    return {
      average: parseFloat((sum / reviews.length).toFixed(1)),
      counts
    }
  }, [reviews])

  return (
    <div className='flex flex-col w-full mx-auto h-full shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl'>
      <div className='container bg-white dark:bg-gray-900'>
        <div className='flex justify-between items-center px-6 py-4 h-24 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900'>
          <h2 className='text-gray-800 dark:text-gray-200 text-2xl font-bold flex items-center'>
            Student Feedback
          </h2>
        </div>
        <hr className='border-gray-200 dark:border-gray-700' />
        {/* Rating Overview */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 py-4'>
          <div className='flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 p-6 rounded-lg'>
            <p className='text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2'>
              Overall Rating
            </p>
            <p className='text-6xl font-bold text-gray-800 dark:text-gray-200 mb-2'>
              {ratingStats.average}
            </p>
            <StarRating
              rating={Math.round(ratingStats.average)}
              size='text-2xl'
            />
            <p className='text-lg font-medium text-gray-600 dark:text-gray-400 mt-4'>
              Based on {reviews.length}{' '}
              {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Breakdown */}
          <div className='flex flex-col gap-4 p-4'>
            <ProgressBar
              label='Excellent (5)'
              value={(ratingStats.counts[4] / reviews.length) * 100 || 0}
              count={ratingStats.counts[4]}
            />
            <ProgressBar
              label='Very Good (4)'
              value={(ratingStats.counts[3] / reviews.length) * 100 || 0}
              count={ratingStats.counts[3]}
            />
            <ProgressBar
              label='Good (3)'
              value={(ratingStats.counts[2] / reviews.length) * 100 || 0}
              count={ratingStats.counts[2]}
            />
            <ProgressBar
              label='Fair (2)'
              value={(ratingStats.counts[1] / reviews.length) * 100 || 0}
              count={ratingStats.counts[1]}
            />
            <ProgressBar
              label='Poor (1)'
              value={(ratingStats.counts[0] / reviews.length) * 100 || 0}
              count={ratingStats.counts[0]}
            />
          </div>
        </div>

        {/* Reviews */}
        <div className='px-6 py-4'>
          <h3 className='text-gray-800 dark:text-gray-200 text-xl font-bold mb-4 flex items-center'>
            <span>Reviews</span>
            <span className='ml-2 bg-orange-100 dark:bg-orange-200 text-orange-800 dark:text-orange-900 text-sm font-medium px-2.5 py-0.5 rounded-full'>
              {reviews.length}
            </span>
          </h3>

          {isLoading ? (
            <div className='flex justify-center items-center h-32'>
              <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500'></div>
            </div>
          ) : reviews.length > 0 ? (
            <div className='space-y-4'>
              {reviews.map((review, index) => (
                <ReviewCard
                  key={review.id || index}
                  name={review.ratingByUser?.name || 'Anonymous'}
                  rating={review.rating}
                  time={review.updatedAt}
                  text={review.review}
                  postId={review.postId}
                  imageUrl={
                    review.ratingByUser?.profileImage
                      ? `http://localhost:3001/${review.ratingByUser.profileImage}`
                      : 'https://via.placeholder.com/48'
                  }
                />
              ))}
            </div>
          ) : (
            <div className='text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg'>
              <p className='text-gray-500 dark:text-gray-400 text-lg'>
                No reviews found for this user.
              </p>
              {props.isUserProfile && (
                <p className='text-gray-400 dark:text-gray-500 mt-2'>
                  Reviews will appear here when students rate your posts.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
