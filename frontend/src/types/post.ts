export type Post = {
  Class: string
  createdAt: string
  description: string
  fees: string
  id: string
  medium: string
  subject: string
  updatedAt: string
  userId: string
  booked: boolean
  preferableTime: string
  preferableDate: string
  User: {
    name: string
    id: string
    profileImage: string
    education: string
  }
  TutorRequest: {
    id: string
    postId: string
    userId: string
    status: string
    createdAt: string
    updatedAt: string
  }[]
}

export type User = {
  name: string
  education: string
  id: string
  profileImage: string
  role: string
}

export type TutorRequest = {
  id: string
  postId: string
  userId: string
  comment: string
  createdAt: string
  updatedAt: string
  User?: User
}

export type MeetingData = {
  id: string
  userId: string
  teacherId: string
  postId: string
}
