import { Chat } from '@/types/chat'

export const getProfileImageUrl = (profileImage: string | undefined) => {
  if (!profileImage) return '/default-avatar.png'
  return `${process.env.NEXT_PUBLIC_API_URL_IMAGE || ''}/${profileImage}`
}

export const groupMessagesByDate = (messages: Chat[]) => {
  const groups: { [key: string]: Chat[] } = {}
  messages.forEach(message => {
    const date = new Date(message.createdAt).toLocaleDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(message)
  })
  return groups
}

export const formatMessageTime = (timestamp: string) => {
  try {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
  } catch {
    return 'Invalid time'
  }
} 