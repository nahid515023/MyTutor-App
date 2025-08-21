'use client'
import * as React from 'react'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'
import type { ZegoUser } from '@zegocloud/zego-uikit-prebuilt'
import { useRef, useEffect, useCallback, useState } from 'react'
import { getUserData } from '@/utils/cookiesUserData'
import Nav from '@/components/Nav'
// import plugin
 import { ZegoSuperBoardManager } from "zego-superboard-web";

// Define user data type for better type safety
interface UserData {
  id: string
  name: string
}

export default function MeetingApp ({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const [roomID, setRoomID] = useState<string>('')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const meetingContainerRef = useRef<HTMLDivElement>(null)
  const zpInstanceRef = useRef<ZegoUIKitPrebuilt | null>(null)

  // Unwrap params Promise for Next.js 15
  useEffect(() => {
    params.then(resolvedParams => {
      setRoomID(resolvedParams.id)
    })
  }, [params])

  // Initialize user data safely
  useEffect(() => {
    try {
      const data = getUserData()
      if (!data || !data.id || !data.name) {
        setError('User data is not available. Please log in.')
        return
      }
      setUserData(data)
    } catch (err) {
      console.error('Error getting user data:', err)
      setError('Failed to get user data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const initializeMeeting = useCallback(
    async (element: HTMLDivElement, retryCount = 0) => {
      const maxRetries = 3
      const retryDelay = Math.pow(2, retryCount) * 1000 // Exponential backoff: 1s, 2s, 4s
      
      try {
        if (!userData?.id || !userData?.name || !roomID) {
          setError('User data or room ID is missing. Please log in.')
          return
        }

        // Validate room ID format
        if (roomID.length < 3 || roomID.length > 64) {
          setError('Invalid room ID format. Room ID must be between 3 and 64 characters.')
          return
        }

        // Get configuration from environment
        const appId = parseInt(process.env.NEXT_PUBLIC_APPID || '0', 10)
        const serverSecret = process.env.NEXT_PUBLIC_SERVER_SECRET

        if (!appId) {
          setError('Meeting configuration is missing.')
          return
        }

        if (!serverSecret) {
          setError('Server configuration is missing.')
          return
        }

        // Generate the token on the client side (for development)
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appId,
          serverSecret || 'temp-secret', // Fallback for dev
          roomID,
          userData.id,
          userData.name
        )

        console.log(`Token generated successfully for room: ${roomID} (attempt ${retryCount + 1})`)
        console.log('Meeting configuration:', {
          appId,
          roomID,
          userId: userData.id,
          userName: userData.name,
          hasServerSecret: !!serverSecret
        })

        // Create instance object from Kit Token.
        const zp = ZegoUIKitPrebuilt.create(kitToken)
        zpInstanceRef.current = zp

        // Set a timeout for the join operation
        const joinTimeout = setTimeout(() => {
          console.error('Join room timeout after 30 seconds')
          if (retryCount < maxRetries) {
            console.log('Retrying due to timeout...')
            initializeMeeting(element, retryCount + 1)
          } else {
            setError('Connection timeout. Please check your network and try again.')
          }
        }, 30000) // 30 second timeout
 zp.addPlugins({ZegoSuperBoardManager});
        try {
          // start the call
          await zp.joinRoom({
            container: element,
            sharedLinks: [
              {
                name: 'Personal link',
                url: window.location.href
              }
            ],
            scenario: {
              mode: ZegoUIKitPrebuilt.GroupCall, // To implement 1-on-1 calls, modify the parameter here to [ZegoUIKitPrebuilt.OneONoneCall].
            },
            preJoinViewConfig: {
              title: 'Join Meeting',
            },
            // Add network quality monitoring
            branding: {
              logoURL: '',
            },
            // Note: Video mirroring is handled via CSS transform in the component
            onJoinRoom: () => {
              console.log('Successfully joined room:', roomID)
              clearTimeout(joinTimeout) // Clear timeout on successful join
              setError(null) // Clear any previous errors
              // Apply video mirroring fix after joining
              setTimeout(() => {
                const videos = document.querySelectorAll('.myCallContainer video')
                videos.forEach(video => {
                  const videoElement = video as HTMLVideoElement
                  videoElement.style.transform = 'scaleX(-1)'
                })
              }, 1000)
            },
            onLeaveRoom: () => {
              console.log('Left room:', roomID)
              clearTimeout(joinTimeout) // Clear timeout on leave
            },
            onUserJoin: (users: ZegoUser[]) => {
              console.log('Users joined:', users)
            },
            onUserLeave: (users: ZegoUser[]) => {
              console.log('Users left:', users)
            }
          })
          
          // Clear timeout on successful completion
          clearTimeout(joinTimeout)
        } catch (joinError) {
          clearTimeout(joinTimeout)
          throw joinError // Re-throw to be caught by outer try-catch
        }
      } catch (err: unknown) {
        console.error(`Error initializing meeting (attempt ${retryCount + 1}):`, err)
        
        // Handle specific error codes
        const error = err as { code?: number; message?: string }
        
        // Check if we should retry for specific errors
        const shouldRetry = (error.code === 105 || error.code === 106 || error.code === 107) && retryCount < maxRetries
        
        if (shouldRetry) {
          console.log(`Retrying in ${retryDelay}ms... (attempt ${retryCount + 2}/${maxRetries + 1})`)
          setError(`Connection failed. Retrying... (${retryCount + 1}/${maxRetries})`)
          
          setTimeout(() => {
            initializeMeeting(element, retryCount + 1)
          }, retryDelay)
          return
        }
        
        // Final error handling if no retry or max retries reached
        if (error.code === 105) {
          setError('Session creation failed after multiple attempts. This usually happens due to network connectivity issues or browser restrictions. Try: 1) Refresh the page, 2) Check your internet connection, 3) Try a different browser, or 4) Disable browser extensions temporarily.')
        } else if (error.code === 106) {
          setError('Room connection failed after multiple attempts. Please check your internet connection and try again.')
        } else if (error.code === 107) {
          setError('Authentication failed. Please refresh the page and try again.')
        } else {
          setError(`Failed to initialize meeting: ${error.message || 'Unknown error'}. Please refresh the page and try again.`)
        }
      }
    },
    [roomID, userData]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (zpInstanceRef.current) {
        zpInstanceRef.current.destroy()
      }
    }
  }, [])

  // Fix video mirroring after meeting is loaded
  useEffect(() => {
    const fixVideoMirroring = () => {
      const videos = document.querySelectorAll('.myCallContainer video')
      videos.forEach(video => {
        const videoElement = video as HTMLVideoElement
        videoElement.style.transform = 'scaleX(-1)'
      })
    }

    // Apply fix after a short delay to ensure videos are loaded
    const timer = setTimeout(fixVideoMirroring, 2000)
    
    // Also apply fix when videos are added dynamically
    const observer = new MutationObserver(fixVideoMirroring)
    const container = meetingContainerRef.current
    
    if (container) {
      observer.observe(container, {
        childList: true,
        subtree: true
      })
    }

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!isLoading && userData && roomID && meetingContainerRef.current) {
      initializeMeeting(meetingContainerRef.current)
    }
  }, [initializeMeeting, isLoading, userData, roomID])

  if (isLoading) {
    return (
      <>
        <Nav />
        <div
          className='bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            height: 'calc(100vh - var(--navbar-height))',
            fontSize: '18px',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #e5e7eb',
                  borderTop: '3px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }}
              ></div>
            </div>
            Loading meeting room...
          </div>
          <style jsx>{`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Nav />
        <div
          className='bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            height: 'calc(100vh - var(--navbar-height))',
            fontSize: '18px',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}
        >
          <div
            style={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}
          >
            <div
              style={{
                fontSize: '48px',
                marginBottom: '16px',
                color: '#ef4444'
              }}
            >
              ⚠️
            </div>
            <p style={{ marginBottom: '24px', lineHeight: '1.5' }}>
              Error: {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                cursor: 'pointer',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                fontFamily: 'inherit'
              }}
              onMouseOver={e =>
                (e.currentTarget.style.backgroundColor = '#2563eb')
              }
              onMouseOut={e =>
                (e.currentTarget.style.backgroundColor = '#3b82f6')
              }
            >
              Retry Connection
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Nav />
      <style jsx global>{`
        .myCallContainer video {
          transform: scaleX(-1) !important;
        }
      `}</style>
      <div
        className='myCallContainer bg-white dark:bg-gray-700'
        ref={meetingContainerRef}
        style={{
          width: '100vw',
          height: 'calc(100vh - var(--navbar-height))',
          overflow: 'hidden'
        }}
      ></div>
    </>
  )
}
