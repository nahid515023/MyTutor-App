'use client'
import { useState, useEffect } from 'react'
import { api } from '@/_lib/api'
import { useRouter, useSearchParams } from 'next/navigation'
import { showToast } from '@/utils/toastService'
import { randomID } from '@/utils/randomIDGenerator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CalendarDays,
  Clock,
  Link as LinkIcon,
  Users,
  Video,
  ArrowLeft,
  Info,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

type Meeting = {
  userId: string
  teacherId: string
  postId: string
  start: string
  end: string
  link: string
  date: string
  title: string
}

type Post = {
  id: string
  userId: string
  booked: boolean
  preferableDate?: string
  preferableTime?: string
  subject?: string
  Class?: string
  medium?: string
  description?: string
}

export default function CreateMeeting() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  // Get parameters from URL query params
  const postId = searchParams.get('postId')
  const userId = searchParams.get('userId')
  const teacherId = searchParams.get('teacherId')

  // Create state for the post and teacher
  const [post, setPost] = useState<Post>({
    id: postId || '',
    userId: userId || '',
    booked: false
  })

  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingLink, setMeetingLink] = useState(generateRandomMeetingLink())
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingStartTime, setMeetingStartTime] = useState('')
  const [meetingEndTime, setMeetingEndTime] = useState('')

  function generateRandomMeetingLink(): string {
    const roomID = randomID(8)
    return (
      window.location.protocol +
      '//' +
      window.location.host +
      '/meeting-room' +
      '/' +
      roomID
    )
  }

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (postId) {
        try {
          const response = await api.get<Post>(`/posts/${postId}`)
          if (response.data) {
            setPost(response.data)
            console.log('Post details fetched:', response.data)
            
            // Set meeting title from post subject
            if (response.data.subject) {
              setMeetingTitle(`${response.data.subject} - Tutoring Session`)
            }
            
            // Set meeting date from post's preferableDate
            if (response.data.preferableDate) {
              setMeetingDate(response.data.preferableDate)
              console.log('Meeting date set to:', response.data.preferableDate)
            }
            
            // Parse and set meeting times from post's preferableTime
            if (response.data.preferableTime) {
              const timeRange = response.data.preferableTime.trim().split(' - ')
              console.log('Time range parsed:', timeRange)
              if (timeRange.length === 2) {
                const startTime = timeRange[0].trim()
                const endTime = timeRange[1].trim()
                setMeetingStartTime(startTime)
                setMeetingEndTime(endTime)
                console.log('Meeting times set - Start:', startTime, 'End:', endTime)
              }
            }
          } else {
            showToast('error', 'Post not found')
          }
        } catch (error) {
          console.error('Error fetching post details:', error)
          showToast('error', 'Error fetching post details')
        }
      }
    }
    fetchPostDetails()
  }, [postId])

  const handleCreateMeeting = async () => {
    try {
      setIsLoading(true)
      
      // Validation
      if (
        !meetingTitle ||
        !meetingLink ||
        !meetingDate ||
        !meetingStartTime ||
        !meetingEndTime
      ) {
        showToast('error', 'Please fill in all fields')
        setIsLoading(false)
        return
      }

      const meetingData: Meeting = {
        userId: userId || post.userId,
        teacherId: teacherId || '',
        postId: postId || post.id,
        title: meetingTitle,
        start: meetingStartTime,
        end: meetingEndTime,
        link: meetingLink,
        date: meetingDate
      }
      
      const res = await api.post<{ message: string }>(
        `/meeting/create`,
        meetingData
      )
      if (res.data.message && res.status === 200) {
        setPost({ ...post, booked: true })
        showToast('success', res.data.message)
        router.push(`/post/${postId}`)
      } else {
        showToast('error', res.data.message)
      }
    } catch (error) {
      showToast('error', 'Error creating meeting!')
      console.error('Error creating meeting:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/post/${postId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Post
            </Button>
          </Link>
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Schedule Meeting
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create a tutoring session with your student
            </p>
          </div>
        </div>

        {/* Post Info Card */}
        {post.subject && (
          <Card className="mb-6 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Users className="w-5 h-5" />
                Session Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{post.subject}</Badge>
                {post.Class && <Badge variant="outline">Class {post.Class}</Badge>}
                {post.medium && <Badge variant="outline">{post.medium}</Badge>}
              </div>
              {post.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                  {post.description}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Form Card */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Video className="w-6 h-6" />
              Meeting Information
            </CardTitle>
            <CardDescription className="text-blue-100">
              Fill in the details for your tutoring session
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Meeting Title */}
            <div className="space-y-2">
              <Label htmlFor="meetingTitle" className="text-base font-medium">
                Meeting Title *
              </Label>
              <Input
                id="meetingTitle"
                type="text"
                placeholder="Enter a descriptive title for the session"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                className="h-11"
              />
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Info className="w-3 h-3" />
                A clear title helps identify the meeting purpose
              </div>
            </div>

            {/* Meeting Link */}
            <div className="space-y-2">
              <Label htmlFor="meetingLink" className="text-base font-medium">
                Meeting Link *
              </Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="meetingLink"
                  type="url"
                  placeholder="https://meet.google.com/... or use generated room"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="h-11 pl-10"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMeetingLink(generateRandomMeetingLink())}
                className="text-xs"
              >
                Generate New Room Link
              </Button>
            </div>

            {/* Meeting Date */}
            <div className="space-y-2">
              <Label htmlFor="meetingDate" className="text-base font-medium flex items-center gap-2">
                Meeting Date *
                {post.preferableDate && (
                  <Badge variant="secondary" className="text-xs">
                    Pre-filled from post
                  </Badge>
                )}
              </Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="meetingDate"
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="h-11 pl-10"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Meeting Time */}
            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                Meeting Time *
                {post.preferableTime && (
                  <Badge variant="secondary" className="text-xs">
                    Pre-filled from post
                  </Badge>
                )}
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="startTime" className="text-sm text-gray-600 dark:text-gray-400">
                    Start Time
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="startTime"
                      type="time"
                      value={meetingStartTime}
                      onChange={(e) => setMeetingStartTime(e.target.value)}
                      className="h-11 pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="endTime" className="text-sm text-gray-600 dark:text-gray-400">
                    End Time
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="endTime"
                      type="time"
                      value={meetingEndTime}
                      onChange={(e) => setMeetingEndTime(e.target.value)}
                      className="h-11 pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleCreateMeeting}
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling Meeting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </>
              )}
            </Button>

            {/* Info Footer */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">What happens next?</p>
                  <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                    <li>• Both you and your student will receive notifications</li>
                    <li>• The post will be marked as booked</li>
                    <li>• Meeting details will be saved to your schedule</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


