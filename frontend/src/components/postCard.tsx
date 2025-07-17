import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Post } from '@/types/post'
import { getProfileImageUrl } from '@/utils/getProfileImage'

interface PostCardProps {
  post: Post
  booked: boolean
  getDateInPost: (date: string) => string
}

const PostCard = ({ post, booked, getDateInPost }: PostCardProps) => {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-blue-500 dark:border-blue-600'>
      <div className='flex justify-between items-center p-5 bg-gray-50 dark:bg-gray-750 dark:bg-gray-700/50'>
        <div className='flex items-center gap-4'>
          <div className='relative'>
            <div className='w-16 h-16 rounded-full overflow-hidden ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-700'>
              <Image
                src={getProfileImageUrl(post.User.profileImage)}
                alt={post.User.name}
                width={64}
                height={64}
                className='object-cover w-full h-full'
              />
            </div>
          </div>
          <div>
            <Link href={`/profile/${post.User.id}`}>
              <h3 className='text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors'>
                {post.User.name}
              </h3>
            </Link>
            {post.User.education && (
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                {post.User.education.split('#')[0]}
              </p>
            )}
          </div>
        </div>
        
        <div className='flex flex-col items-end'>
          <span className='text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center'>
            <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clipRule='evenodd' />
            </svg>
            {getDateInPost(post.createdAt)} ago
          </span>
          {booked ? (
            <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200'>
              <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
              </svg>
              Booked
            </span>
          ) : (
            <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'>
              <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M10 12a2 2 0 100-4 2 2 0 000 4z' />
                <path fillRule='evenodd' d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z' clipRule='evenodd' />
              </svg>
              {post.TutorRequest.length} {post.TutorRequest.length === 1 ? 'request' : 'requests'}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='p-5'>
        {/* Tags/Badges Section */}
        <div className='flex flex-wrap gap-2 mb-4'>
          <span className='px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'>Online</span>
          {post.medium && (
            <span className='px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'>{post.medium}</span>
          )}
          {post.Class && (
            <span className='px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'>{post.Class}</span>
          )}
          {post.subject && (
            <span className='px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'>{post.subject}</span>
          )}
          {post.fees && (
            <span className='px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'>{post.fees} BDT/Class</span>
          )}
        </div>

        {/* Description */}
        <div className='text-gray-700 dark:text-gray-300 mt-4'>
          {post.description.length > 250 ? (
            <p className='text-md leading-relaxed whitespace-pre-wrap'>
              {post.description.slice(0, 250)}...
            </p>
          ) : (
            <p className='text-md leading-relaxed whitespace-pre-wrap'>{post.description}</p>
          )}
        </div>
      </div>

      {/* Footer with time preferences and action button */}
      <div className='bg-gray-50 dark:bg-gray-700/40 p-4 flex flex-wrap gap-3 items-center justify-between border-t border-gray-100 dark:border-gray-700'>
        <div className='flex flex-wrap gap-2'>
          {post.preferableDate && (
            <span className='inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 rounded'>
              <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
              </svg>
              {new Date(post.preferableDate).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
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
                  <span className='inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 rounded'>
                    <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    {preferableStartTime} - {preferableEndTime}
                  </span>
                )
              })()}
            </>
          )}
        </div>
        
        <Link
          href={`/post/${post.id}`}
          className='inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-md transition-colors shadow-sm'
        >
          View Details
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14 5l7 7m0 0l-7 7m7-7H3' />
          </svg>
        </Link>
      </div>
    </div>
  )
}

export default PostCard
