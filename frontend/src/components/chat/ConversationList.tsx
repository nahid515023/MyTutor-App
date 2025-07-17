import { FC } from 'react'
import Image from 'next/image'
import { ConnectedUser } from '@/types/chat'
import { getProfileImageUrl } from '@/utils/chat/helpers'
import dynamic from 'next/dynamic'
import { formatDistanceToNow } from 'date-fns'
import LoadingState from '../LoadingState'

const TimeDisplay = dynamic(
  () =>
    Promise.resolve(({ timestamp }: { timestamp: string }) => {
      try {
        const date = new Date(timestamp)
        return <span>{formatDistanceToNow(date, { addSuffix: true })}</span>
      } catch {
        return <span>Invalid time</span>
      }
    }),
  { ssr: false }
)

interface ConversationListProps {
  conversations: ConnectedUser[]
  currentConversation: string
  userId: string
  searchTerm: string
  isLoading: boolean
  error: string | null
  messages: { senderId: string; status: string; connectedId: string; type: string; message: string; createdAt: string }[]
  onlineUsers: string[]
  onConversationClick: (id: string) => void
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const ConversationList: FC<ConversationListProps> = ({
  conversations,
  currentConversation,
  userId,
  searchTerm,
  isLoading,
  error,
  messages,
  onlineUsers,
  onConversationClick,
  onSearchChange
}) => {
  const filteredConversations = conversations.filter(convo => {
    const isCurrentUser = userId === convo.userId
    const displayName = isCurrentUser ? convo.ContactUser.name : convo.User.name
    return displayName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const isUserOnline = (userId: string) => onlineUsers.includes(userId)

  return (
    <div className='w-full md:w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-[calc(100vh-16rem)]'>
      <div className='p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10'>
        <div className='relative'>
          <input
            type='text'
            placeholder='Search conversations...'
            value={searchTerm}
            onChange={onSearchChange}
            className='w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <svg
            className='absolute left-3 top-2.5 h-5 w-5 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        </div>
      </div>
      <div className='flex-1 overflow-y-auto'>
        {isLoading ? (
          <LoadingState
            title='Loading Conversations'
            message='Fetching your conversations...'
            size='medium'
            className='h-full flex items-center justify-center'
          />
        ) : error ? (
          <div className='flex justify-center items-center h-full'>
            <p className='text-red-500 dark:text-red-400'>{error}</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className='flex flex-col justify-center items-center h-full text-center p-4'>
            <svg
              className='h-16 w-16 text-gray-400 mb-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
              />
            </svg>
            <p className='text-gray-600 dark:text-gray-300 mb-2'>
              No conversations yet
            </p>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Start a new conversation by connecting with other users
            </p>
          </div>
        ) : (
          <div className='divide-y divide-gray-200 dark:divide-gray-700'>
            {filteredConversations.map(convo => {
              const isCurrentUser = userId === convo.userId
              const displayName = isCurrentUser
                ? convo.ContactUser.name
                : convo.User.name
              const profileImage = isCurrentUser
                ? convo.ContactUser.profileImage
                : convo.User.profileImage
              const isOnline = isUserOnline(
                isCurrentUser ? convo.contactUserId : convo.userId
              )
              const unreadCount = messages.filter(
                msg =>
                  msg.senderId !== userId &&
                  msg.status !== 'read' &&
                  msg.connectedId === convo.id
              ).length

              return (
                <div
                  key={convo.id}
                  onClick={() => onConversationClick(convo.id)}
                  className={`p-4 cursor-pointer transition-colors duration-200 ${
                    currentConversation === convo.id
                      ? 'bg-blue-50 dark:bg-blue-900/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <div className='relative'>
                      <div className='w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600'>
                        <Image
                          src={getProfileImageUrl(profileImage)}
                          alt={displayName}
                          width={48}
                          height={48}
                          className='object-cover w-full h-full'
                        />
                      </div>
                      {isOnline && (
                        <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800'></div>
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex justify-between items-start'>
                        <h3 className='text-sm font-semibold text-gray-900 dark:text-gray-100 truncate'>
                          {displayName}
                        </h3>
                        <div className='flex items-center gap-2'>
                          {unreadCount > 0 && (
                            <span className='bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full'>
                              {unreadCount}
                            </span>
                          )}
                          {convo.lastMessage && (
                            <span className='text-xs text-gray-500 dark:text-gray-400'>
                              <TimeDisplay
                                timestamp={convo.lastMessage.createdAt}
                              />
                            </span>
                          )}
                        </div>
                      </div>
                      {convo.lastMessage && (
                        <p className='text-sm text-gray-600 dark:text-gray-300 truncate'>
                          {convo.lastMessage.type === 'image'
                            ? '📷 Image'
                            : convo.lastMessage.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationList
