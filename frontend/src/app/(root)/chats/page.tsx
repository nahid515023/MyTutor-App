'use client'
import { useChat } from '@/hooks/chat/useChat'
import ConversationList from '@/components/chat/ConversationList'
import { ChatArea } from '@/components/chat/ChatArea'
import { ChatInput } from '@/components/chat/ChatInput'
import { useRef, useEffect } from 'react'
import { getUserData } from '@/utils/cookiesUserData'
import { useState } from 'react'
import { User } from '@/types/post'

export default function MessagePage() {
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const messageContainerRef = useRef<HTMLDivElement | null>(null)
  const [user, setUser] = useState<User | null>(null)

  const {
    conversations,
    messages,
    inputValue,
    currentConversation,
    isTyping,
    isLoading,
    error,
    searchTerm,
    messageSearchTerm,
    onlineUsers,
    isUploading,
    handleImageUpload,
    handleSend,
    handleRetryMessage,
    handleDeleteMessage,
    handleInputChange,
    handleMessageSearch,
    handleSearchChange,
    handleKeyDown,
    handleConversationClick,
    getCurrentConversationName,
    getCurrentConversationImage,
    getCurrentConversationUserId,
    isUserOnline
  } = useChat()

  useEffect(() => {
    setUser(getUserData())
  }, [])

  return (
    <div className='min-h-screen'>
      <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {error && (
          <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <div className='flex items-center'>
              <svg className='w-5 h-5 text-red-500 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              <p className='text-red-700 text-sm'>{error}</p>
            </div>
          </div>
        )}
        
        <div className='flex flex-col md:flex-row gap-4 h-[calc(100vh-12rem)]'>
          <ConversationList
            conversations={conversations}
            currentConversation={currentConversation}
            userId={user?.id || ''}
            searchTerm={searchTerm}
            isLoading={isLoading}
            error={error}
            messages={messages}
            onlineUsers={onlineUsers}
            onConversationClick={handleConversationClick}
            onSearchChange={handleSearchChange}
          />

          <div className='w-full md:w-2/3 flex flex-col'>
            <ChatArea
              currentConversation={currentConversation}
              messages={messages}
              messageSearchTerm={messageSearchTerm}
              isTyping={isTyping}
              userId={user?.id || ''}
              onMessageSearch={handleMessageSearch}
              onRetryMessage={handleRetryMessage}
              onDeleteMessage={handleDeleteMessage}
              chatEndRef={chatEndRef}
              messageContainerRef={messageContainerRef}
              getCurrentConversationName={getCurrentConversationName}
              getCurrentConversationImage={getCurrentConversationImage}
              getCurrentConversationUserId={getCurrentConversationUserId}
              isUserOnline={isUserOnline}
            />

            {currentConversation && (
              <ChatInput
                inputValue={inputValue}
                onInputChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onSend={handleSend}
                onImageUpload={handleImageUpload}
                isUploading={isUploading}
                inputRef={inputRef}
                fileInputRef={fileInputRef}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}