import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { api } from '@/_lib/api'
import Cookies from 'js-cookie'
import { Chat, ConnectedUser } from '@/types/chat'

export const useChat = () => {
  const [conversations, setConversations] = useState<ConnectedUser[]>([])
  const [messages, setMessages] = useState<Chat[]>([])
  const [inputValue, setInputValue] = useState('')
  const [currentConversation, setCurrentConversation] = useState<string>('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [messageSearchTerm, setMessageSearchTerm] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const messageContainerRef = useRef<HTMLDivElement>(null)
  const isSendingRef = useRef<boolean>(false)

  const conversationsRef = useRef<ConnectedUser[]>([])
  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  const getUserFromCookies = () => {
    try {
      const userCookie = Cookies.get('user')
      if (!userCookie) return null
      return JSON.parse(userCookie)
    } catch (e) {
      console.error('Error parsing user cookie:', e)
      return null
    }
  }

  const user = getUserFromCookies()
  const userId = user?.id

  // Socket initialization
  useEffect(() => {
    if (!userId) return

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    try {
      const newSocket = io(socketUrl, {
        query: { userId },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })


      newSocket.on('onlineUsers', (users: string[]) => {
        if (Array.isArray(users)) {
          setOnlineUsers(users)
        }
      })

      newSocket.on('newMessage', (message: Chat) => {
        if (!message || !message.senderId) return

        setConversations(prev => {
          const updatedConversations = prev.map(convo => {
            if (convo.id === message.connectedId) {
              return {
                ...convo,
                lastMessage: {
                  message: message.message,
                  createdAt: message.createdAt,
                  type: message.type
                }
              }
            }
            return convo
          })
          return updatedConversations.sort((a, b) => {
            const timeA = a.lastMessage?.createdAt || a.updatedAt
            const timeB = b.lastMessage?.createdAt || b.updatedAt
            return new Date(timeB).getTime() - new Date(timeA).getTime()
          })
        })

        if (message.connectedId === currentConversation) {
          setMessages(prev => {
            if (message.senderId === userId) {
              let replaced = false
              return prev.map(msg => {
                if (!replaced && msg.id.startsWith('temp-') && msg.message === message.message) {
                  replaced = true
                  return { ...message, status: 'sent' }
                }
                return msg
              })
            }
            return [...prev, message]
          })
        }
      })

      newSocket.on('messageDeleted', (messageId: string) => {
        setMessages(prev => prev.filter(msg => msg.id !== messageId))
      })

      newSocket.on('userTyping', ({ connectedId, isTyping }: { connectedId: string; isTyping: boolean }) => {
        if (connectedId === currentConversation) {
          setIsTyping(isTyping)
        }
      })

      setSocket(newSocket)
      return () => {
        newSocket.disconnect()
      }
    } catch (error) {
      console.error("Socket connection error:", error)
      setError("Failed to connect to chat server")
    }
  }, [userId, currentConversation])

  // Fetch conversations
  useEffect(() => {
    if (!userId) {
      setError('User not found. Please log in again.')
      setIsLoading(false)
      return
    }

    async function fetchConnectedUsers() {
      try {
        setIsLoading(true)
        const { data } = await api.get<{ connectedUsers: ConnectedUser[] }>(
          `/chat/users/connected/${userId}`
        )

        if (!data.connectedUsers || data.connectedUsers.length === 0) {
          setConversations([])
          setIsLoading(false)
          return
        }

        const updatedUsers = await Promise.all(
          data.connectedUsers.map(async user => {
            try {
              const response = await api.get<{ chat: Chat[] }>(`/chat/chats/${user.id}`)
              const chats = response.data.chat || []
              const lastMessage = chats.length > 0 ? chats[chats.length - 1] : null

              return {
                ...user,
                lastMessage: lastMessage
                  ? {
                      message: lastMessage.message,
                      createdAt: lastMessage.createdAt,
                      type: lastMessage.type
                    }
                  : undefined
              }
            } catch (e) {
              console.error(`Error fetching messages for user ${user.id}:`, e)
              return user
            }
          })
        )

        const sortedUsers = updatedUsers.sort((a, b) => {
          const timeA = a.lastMessage?.createdAt || a.updatedAt
          const timeB = b.lastMessage?.createdAt || b.updatedAt
          return new Date(timeB).getTime() - new Date(timeA).getTime()
        })

        setConversations(sortedUsers)
        if (!currentConversation && sortedUsers.length > 0) {
          setCurrentConversation(sortedUsers[0].id)
        }
        setError(null)
      } catch (error) {
        console.error('Error fetching connected users:', error)
        setError('Failed to load conversations. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchConnectedUsers()
    const intervalId = setInterval(fetchConnectedUsers, 30000)
    return () => clearInterval(intervalId)
  }, [userId, currentConversation])

  // Fetch messages
  useEffect(() => {
    if (!currentConversation || !socket) return

    async function fetchChatMessages() {
      try {
        setIsLoading(true)
        const { data } = await api.get<{ chat: Chat[] }>(`/chat/chats/${currentConversation}`)
        setMessages(data.chat)
        if (socket) {
          socket.emit('joinConversation', currentConversation)
        }
      } catch (error) {
        console.error('Error fetching chat:', error)
        setError('Failed to load messages. Please try again.')
      } finally {
        setIsLoading(false)
        inputRef.current?.focus()
      }
    }
    fetchChatMessages()
  }, [currentConversation, socket])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB')
        return
      }
      setImageFile(file)
      await sendImageMessage(file)
    }
  }

  const sendImageMessage = async (file: File) => {
    if (!currentConversation || isSendingRef.current) return

    isSendingRef.current = true
    const currentConvo = conversations.find(c => c.id === currentConversation)
    if (!currentConvo) {
      isSendingRef.current = false
      return
    }

    const receiverId = currentConvo.contactUserId
    const formData = new FormData()
    formData.append('image', file)

    const tempId = `temp-${Date.now()}`
    try {
      const tempMessage: Chat = {
        id: tempId,
        message: URL.createObjectURL(file),
        connectedId: currentConversation,
        senderId: userId,
        receiverId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'sending',
        type: 'image'
      }

      setMessages(prev => [...prev, tempMessage])
      setImageFile(null)

      const response = await api.post<{ url: string }>('/chat/upload-image', formData)
      const imageUrl = response.data.url

      if (socket) {
        socket.emit('sendMessage', { ...tempMessage, message: imageUrl }, (response: { success: boolean; message: Chat }) => {
          if (response.success) {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === tempId ? { ...response.message, status: 'sent' } : msg
              )
            )
          } else {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === tempId ? { ...msg, status: 'error' } : msg
              )
            )
            setError('Failed to send image')
          }
        })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setMessages(prev => prev.filter(msg => msg.id !== tempId))
      setError('Failed to upload image')
    } finally {
      isSendingRef.current = false
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSend = async () => {
    if (inputValue.trim() === '' || !currentConversation || isSendingRef.current) return

    isSendingRef.current = true
    const currentConvo = conversations.find(c => c.id === currentConversation)
    if (!currentConvo) {
      isSendingRef.current = false
      return
    }

    const receiverId = currentConvo.contactUserId
    const messageText = inputValue

    try {
      const tempId = `temp-${Date.now()}`
      const tempMessage: Chat = {
        id: tempId,
        message: messageText,
        connectedId: currentConversation,
        senderId: userId,
        receiverId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'sending',
        type: 'text'
      }

      setInputValue('')
      setMessages(prev => [...prev, tempMessage])
      setConversations(prev =>
        prev.map(convo => {
          if (convo.id === currentConversation) {
            return {
              ...convo,
              lastMessage: {
                message: messageText,
                createdAt: new Date().toISOString(),
                type: 'text'
              }
            }
          }
          return convo
        })
      )

      if (socket) {
        socket.emit('sendMessage', tempMessage, (response: { success: boolean; message: Chat }) => {
          if (response.success) {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === tempId ? { ...response.message, status: 'sent' } : msg
              )
            )
          } else {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === tempId ? { ...msg, status: 'error' } : msg
              )
            )
            setError('Failed to send message')
          }
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')))
      setError('Failed to send message')
    } finally {
      isSendingRef.current = false
      socket?.emit('typing', { connectedId: currentConversation, isTyping: false })
    }
  }

  const handleRetryMessage = (tempId: string) => {
    const message = messages.find(msg => msg.id === tempId)
    if (!message || !socket) return

    setMessages(prev =>
      prev.map(msg =>
        msg.id === tempId ? { ...msg, status: 'sending' } : msg
      )
    )

    socket.emit('sendMessage', message, (response: { success: boolean; message: Chat }) => {
      if (response.success) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempId ? { ...response.message, status: 'sent' } : msg
          )
        )
      } else {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempId ? { ...msg, status: 'error' } : msg
          )
        )
        setError('Failed to retry message')
      }
    })
  }

  const handleDeleteMessage = (messageId: string) => {
    if (!socket) return

    socket.emit('deleteMessage', { messageId, connectedId: currentConversation })
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (socket && currentConversation) {
      socket.emit('typing', { connectedId: currentConversation, isTyping: true })
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && currentConversation) {
        socket.emit('typing', { connectedId: currentConversation, isTyping: false })
      }
    }, 1500)
  }

  const handleMessageSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageSearchTerm(e.target.value)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleConversationClick = (id: string) => {
    if (id === currentConversation) return

    if (socket && currentConversation) {
      socket.emit('leaveConversation', currentConversation)
    }

    setCurrentConversation(id)
    setError(null)
    setMessages([])
    setMessageSearchTerm('')
  }

  // Message status updates
  useEffect(() => {
    if (!socket) return

    socket.on('messageStatus', ({ messageId, status }: { messageId: string; status: 'delivered' | 'read' }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, status } : msg
        )
      )
    })

    return () => {
      socket.off('messageStatus')
    }
  }, [socket])

  // Mark messages as read
  useEffect(() => {
    if (!socket || !currentConversation) return

    const unreadMessages = messages.filter(
      msg => msg.senderId !== userId && msg.status !== 'read'
    )

    if (unreadMessages.length > 0) {
      socket.emit('markAsRead', {
        messageIds: unreadMessages.map(msg => msg.id),
        connectedId: currentConversation
      })
    }
  }, [socket, currentConversation, messages, userId])

  // Socket reconnection
  useEffect(() => {
    if (!socket) return

    const handleReconnect = () => {
      console.log('Reconnected to socket server')
      if (currentConversation) {
        socket.emit('joinConversation', currentConversation)
      }
    }

    socket.on('reconnect', handleReconnect)
    return () => {
      socket.off('reconnect', handleReconnect)
    }
  }, [socket, currentConversation])

  const filteredConversations = conversations.filter(convo => {
    const isCurrentUser = userId === convo.userId
    const displayName = isCurrentUser ? convo.ContactUser.name : convo.User.name
    return displayName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const filteredMessages = messages.filter(msg =>
    msg.message.toLowerCase().includes(messageSearchTerm.toLowerCase())
  )

  const getCurrentConversationName = () => {
    const currentConvo = conversations.find(c => c.id === currentConversation)
    if (!currentConvo) return ''
    const isCurrentUser = userId === currentConvo.userId
    return isCurrentUser ? currentConvo.ContactUser.name : currentConvo.User.name
  }

  const getCurrentConversationImage = () => {
    const currentConvo = conversations.find(c => c.id === currentConversation)
    if (!currentConvo) return ''
    const isCurrentUser = userId === currentConvo.userId
    return isCurrentUser ? currentConvo.ContactUser.profileImage : currentConvo.User.profileImage
  }

  const getCurrentConversationUserId = () => {
    const currentConvo = conversations.find(c => c.id === currentConversation)
    if (!currentConvo) return ''
    const isCurrentUser = userId === currentConvo.userId
    return isCurrentUser ? currentConvo.contactUserId : currentConvo.userId
  }

  const isUserOnline = (userId: string) => onlineUsers.includes(userId)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [filteredMessages])

  return {
    conversations,
    messages,
    inputValue,
    currentConversation,
    isTyping,
    isLoading,
    error,
    searchTerm,
    messageSearchTerm,
    socket,
    onlineUsers,
    imageFile,
    chatEndRef,
    inputRef,
    fileInputRef,
    messageContainerRef,
    filteredConversations,
    filteredMessages,
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
  }
} 