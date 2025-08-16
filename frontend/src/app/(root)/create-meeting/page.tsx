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
  Info,
  CheckCircle2,
  Loader2
} from 'lucide-react'

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

  // Function to convert 24-hour format to 12-hour format for display
  function convertTo12Hour(time24h: string): string {
    if (!time24h) return ''
    
    const [hours, minutes] = time24h.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Function to convert 12-hour format to 24-hour format
  function convertTo24Hour(time12h: string): string {
    const trimmedTime = time12h.trim()
    
    // If time is already in 24-hour format (no AM/PM), return as is
    if (!trimmedTime.toLowerCase().includes('am') && !trimmedTime.toLowerCase().includes('pm')) {
      return trimmedTime
    }

    // Handle different formats: "2:30 PM", "2:30PM", "14:30", etc.
    const timeRegex = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i
    const match = trimmedTime.match(timeRegex)
    
    if (!match) {
      console.warn('Invalid time format:', trimmedTime)
      return trimmedTime // Return original if can't parse
    }

    const [, hours, minutes, modifier] = match
    let hour = parseInt(hours, 10)
    
    // Convert to 24-hour format
    if (modifier.toLowerCase() === 'am') {
      if (hour === 12) hour = 0
    } else { // PM
      if (hour !== 12) hour += 12
    }
    
    // Ensure hours and minutes are two digits
    const formattedHours = hour.toString().padStart(2, '0')
    const formattedMinutes = minutes.padStart(2, '0')
    
    return `${formattedHours}:${formattedMinutes}`
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
                
                // Convert times to 24-hour format if they contain AM/PM
                const convertedStartTime = convertTo24Hour(startTime)
                const convertedEndTime = convertTo24Hour(endTime)
                
                setMeetingStartTime(convertedStartTime)
                setMeetingEndTime(convertedEndTime)
                console.log('Meeting times set - Start:', convertedStartTime, 'End:', convertedEndTime)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 py-8 px-4">
      <div className="container mx-auto max-w-3xl">

        {/* Post Info Card */}
        {post.subject && (
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-blue-700 dark:text-blue-300 text-lg">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                Session Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1">{post.subject}</Badge>
                {post.Class && <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300">Class {post.Class}</Badge>}
                {post.medium && <Badge variant="outline" className="border-indigo-300 text-indigo-700 dark:border-indigo-600 dark:text-indigo-300">{post.medium}</Badge>}
              </div>
              {post.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                  {post.description}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Form Card */}
        <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Video className="w-6 h-6" />
                </div>
                Meeting Information
              </CardTitle>
              <CardDescription className="text-blue-100 mt-2">
                Configure your tutoring session details and preferences
              </CardDescription>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl"></div>
          </CardHeader>
          
          <CardContent className="p-8 space-y-8">
            {/* Meeting Title */}
            <div className="space-y-3">
              <Label htmlFor="meetingTitle" className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                Meeting Title *
                <span className="text-red-500">•</span>
              </Label>
              <div className="relative group">
                <Input
                  id="meetingTitle"
                  type="text"
                  placeholder="Enter a descriptive title for the session"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 focus:bg-white dark:focus:bg-gray-700 shadow-sm focus:shadow-md"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                <Info className="w-4 h-4 text-blue-500" />
                A clear title helps identify the meeting purpose and makes scheduling easier
              </div>
            </div>

            {/* Meeting Link */}
            <div className="space-y-3">
              <Label htmlFor="meetingLink" className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                Meeting Link *
                <span className="text-red-500">•</span>
              </Label>
              <div className="relative group">
                <LinkIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                <Input
                  id="meetingLink"
                  type="url"
                  placeholder="https://meet.google.com/... or use generated room"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="h-12 pl-12 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 focus:bg-white dark:focus:bg-gray-700 shadow-sm focus:shadow-md"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMeetingLink(generateRandomMeetingLink())}
                className="text-sm bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 transition-all duration-300 hover:scale-105"
              >
                🎲 Generate New Room Link
              </Button>
            </div>

            {/* Meeting Date */}
            <div className="space-y-3">
              <Label htmlFor="meetingDate" className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                Meeting Date *
                <span className="text-red-500">•</span>
                {post.preferableDate && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs border-green-200 dark:border-green-700">
                    ✓ Pre-filled
                  </Badge>
                )}
              </Label>
              <div className="relative group">
                <CalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                <Input
                  id="meetingDate"
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="h-12 pl-12 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 focus:bg-white dark:focus:bg-gray-700 shadow-sm focus:shadow-md"
                  min={new Date().toISOString().split('T')[0]}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Meeting Time */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                Meeting Time *
                <span className="text-red-500">•</span>
                {post.preferableTime && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs border-green-200 dark:border-green-700">
                    ✓ Pre-filled
                  </Badge>
                )}
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Start Time
                  </Label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                    <Input
                      id="startTime"
                      type="time"
                      value={meetingStartTime}
                      onChange={(e) => setMeetingStartTime(e.target.value)}
                      className="h-12 pl-12 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 focus:bg-white dark:focus:bg-gray-700 shadow-sm focus:shadow-md"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {meetingStartTime && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      Display: {convertTo12Hour(meetingStartTime)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    End Time
                  </Label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                    <Input
                      id="endTime"
                      type="time"
                      value={meetingEndTime}
                      onChange={(e) => setMeetingEndTime(e.target.value)}
                      className="h-12 pl-12 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 focus:bg-white dark:focus:bg-gray-700 shadow-sm focus:shadow-md"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {meetingEndTime && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      Display: {convertTo12Hour(meetingEndTime)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={handleCreateMeeting}
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Scheduling Meeting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-3" />
                    Schedule Meeting
                  </>
                )}
              </Button>
            </div>

            {/* Info Footer */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">What happens next?</h4>
                  <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      Both you and your student will receive instant notifications
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                      The post will be automatically marked as booked
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      Meeting details will be saved to your personal schedule
                    </li>
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


