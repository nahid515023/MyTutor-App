import Image from 'next/image'
import { Chat } from '@/types/chat'
import { getProfileImageUrl, groupMessagesByDate } from '@/utils/chat/helpers'
import dynamic from 'next/dynamic'
import { RefObject, ChangeEvent, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

const TimeDisplay = dynamic(() => Promise.resolve(({ timestamp }: { timestamp: string }) => {
  try {
    const date = new Date(timestamp)
    return <span>{formatDistanceToNow(date, { addSuffix: true })}</span>
  } catch (error) {
    console.log(error)
    return <span>Invalid time</span>
  }
}), { ssr: false })

interface ChatAreaProps {
  currentConversation: string
  messages: Chat[]
  messageSearchTerm: string
  isTyping: boolean
  userId: string
  onMessageSearch: (e: ChangeEvent<HTMLInputElement>) => void
  onRetryMessage: (messageId: string) => void
  onDeleteMessage: (messageId: string) => void
  chatEndRef: RefObject<HTMLDivElement | null>
  messageContainerRef: RefObject<HTMLDivElement | null>
  getCurrentConversationName: () => string
  getCurrentConversationImage: () => string
  getCurrentConversationUserId: () => string
  isUserOnline: (userId: string) => boolean
}

export const ChatArea = ({
  currentConversation,
  messages,
  messageSearchTerm,
  isTyping,
  userId,
  onMessageSearch,
  onRetryMessage,
  onDeleteMessage,
  chatEndRef,
  messageContainerRef,
  getCurrentConversationName,
  getCurrentConversationImage,
  getCurrentConversationUserId,
  isUserOnline
}: ChatAreaProps) => {
  const filteredMessages = messages.filter(msg =>
    msg.message.toLowerCase().includes(messageSearchTerm.toLowerCase())
  )

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatEndRef]);

  return (
    <section className='w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-[calc(100vh-16rem)]'>
      {currentConversation ? (
        <>
          <header className='p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 bg-white dark:bg-gray-800 sticky top-0 z-10'>
            <div className='relative'>
              <div className='w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600'>
                <Image
                  src={getProfileImageUrl(getCurrentConversationImage())}
                  alt={getCurrentConversationName()}
                  width={48}
                  height={48}
                  className='object-cover w-full h-full'
                />
              </div>
              {isUserOnline(getCurrentConversationUserId()) && (
                <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800'></div>
              )}
            </div>
            <div className='flex-1'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                {getCurrentConversationName()}
              </h2>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                {isUserOnline(getCurrentConversationUserId()) ? 'Online' : 'Offline'}
              </p>
            </div>
            <div className="relative">
              <input
                type='text'
                placeholder='Search messages...'
                value={messageSearchTerm}
                onChange={onMessageSearch}
                className='px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </header>

          <div
            ref={messageContainerRef}
            className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900'
          >
            {Object.entries(groupMessagesByDate(filteredMessages)).map(([date, dateMessages]) => (
              <div key={date} className="space-y-4">
                <div className="flex justify-center">
                  <span className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                {dateMessages.map((message, index) => {
                  const isFirstInGroup = index === 0 || dateMessages[index - 1].senderId !== message.senderId
                  const isLastInGroup = index === dateMessages.length - 1 || dateMessages[index + 1].senderId !== message.senderId
                  const canDelete = message.senderId === userId && message.status !== 'error'

                  return (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'} ${
                        isFirstInGroup ? 'mt-4' : 'mt-1'
                      } relative group`}
                    >
                      <div className="flex flex-col max-w-[70%]">
                        <div
                          className={`rounded-lg p-3 ${
                            message.senderId === userId
                              ? 'bg-blue-500 text-white rounded-br-none'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
                          } ${
                            isFirstInGroup ? 'rounded-tl-2xl' : 'rounded-tl-lg'
                          } ${
                            isLastInGroup ? 'rounded-br-2xl' : 'rounded-br-lg'
                          } ${message.status === 'error' ? 'opacity-75' : ''}`}
                        >
                          {message.type === 'image' ? (
                            <div className="max-w-[200px] max-h-[200px]">
                              <Image
                                src={message.message}
                                alt="Shared image"
                                width={200}
                                height={200}
                                className="rounded-lg object-cover"
                                style={{ maxWidth: '100%', maxHeight: '200px' }}
                              />
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                          )}
                        </div>
                        {(isLastInGroup || message.status === 'read') && (
                          <div className={`flex items-center gap-1 mt-1 ${
                            message.senderId === userId ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              <TimeDisplay timestamp={message.createdAt} />
                            </span>
                            {message.senderId === userId && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                {message.status === 'read' ? (
                                  <span className="text-blue-400">✓✓</span>
                                ) : message.status === 'delivered' ? (
                                  <span>✓✓</span>
                                ) : message.status === 'error' ? (
                                  <span className="text-red-500">!</span>
                                ) : (
                                  <span>✓</span>
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {message.status === 'error' && (
                        <button
                          onClick={() => onRetryMessage(message.id)}
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Retry
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onDeleteMessage(message.id)}
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
            {isTyping && (
              <div className='flex justify-start'>
                <div className='bg-white dark:bg-gray-800 rounded-lg p-3 rounded-bl-none'>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-4" />
          </div>
        </>
      ) : (
        <div className='flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
          <p className='text-gray-600 dark:text-gray-300'>
            Select a conversation to start chatting
          </p>
        </div>
      )}
    </section>
  )
} 