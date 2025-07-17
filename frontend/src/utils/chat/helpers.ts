import { Chat } from '@/types/chat'
import { APP_CONFIG, API_CONFIG } from '@/config'

export const getProfileImageUrl = (profileImage: string | undefined) => {
  if (!profileImage) return APP_CONFIG.DEFAULT_AVATAR
  if (profileImage.startsWith('http')) return profileImage
  return `${API_CONFIG.IMAGE_BASE_URL}${profileImage}`
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