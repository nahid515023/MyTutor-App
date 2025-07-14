export interface ContactUser {
  id: string
  name: string
  image: string
  userId: string
  profileImage: string
}

export interface ConnectedUser {
  contactUserId: string
  id: string
  userId: string
  ContactUser: ContactUser
  User: ContactUser
  updatedAt: string
  lastMessage?: {
    message: string
    createdAt: string
    type?: 'text' | 'image'
  }
}

export interface Chat {
  id: string
  connectedId: string
  message: string
  createdAt: string
  updatedAt: string
  senderId: string
  receiverId: string
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'error'
  type: 'text' | 'image'
}


