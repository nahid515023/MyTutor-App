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