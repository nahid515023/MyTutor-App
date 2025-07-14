'use client';
import * as React from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useRef, useEffect, useCallback, useState } from 'react';
import { getUserData } from '@/utils/cookiesUserData';

// Define user data type for better type safety
interface UserData {
  id: string;
  name: string;
}

export default function MeetingApp({params}:{params: Promise<{ id: string }>}) {
  const [roomID, setRoomID] = useState<string>('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const meetingContainerRef = useRef<HTMLDivElement>(null);
  const zpInstanceRef = useRef<ZegoUIKitPrebuilt | null>(null);

  // Unwrap params Promise for Next.js 15
  useEffect(() => {
    params.then(resolvedParams => {
      setRoomID(resolvedParams.id);
    });
  }, [params]);

  // Initialize user data safely
  useEffect(() => {
    try {
      const data = getUserData();
      if (!data || !data.id || !data.name) {
        setError('User data is not available. Please log in.');
        return;
      }
      setUserData(data);
    } catch (err) {
      console.error('Error getting user data:', err);
      setError('Failed to get user data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initializeMeeting = useCallback(async (element: HTMLDivElement) => {
    try {
      if (!userData?.id || !userData?.name || !roomID) {
        setError('User data or room ID is missing. Please log in.');
        return;
      }

      // Get configuration from environment
      const appId = parseInt(process.env.NEXT_PUBLIC_APPID || '0', 10);
      const serverSecret = process.env.NEXT_PUBLIC_SERVER_SECRET;

      if (!appId) {
        setError('Meeting configuration is missing.');
        return;
      }

      // Generate the token on the client side (for development)
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        serverSecret || 'temp-secret', // Fallback for dev
        roomID,
        userData.id,
        userData.name
      );

      console.log('Token generated successfully for room:', roomID);

      // Create instance object from Kit Token.
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zpInstanceRef.current = zp;

      // start the call
      await zp.joinRoom({
        container: element,
        sharedLinks: [
          {
            name: 'Personal link',
            url: window.location.href
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        showScreenSharingButton: true,
        showLayoutButton: true,
        maxUsers: 50,
        onJoinRoom: () => {
          console.log('Successfully joined room:', roomID);
        },
        onLeaveRoom: () => {
          console.log('Left room:', roomID);
        }
      });
    } catch (err) {
      console.error('Error initializing meeting:', err);
      setError('Failed to initialize meeting. Please try again.');
    }
  }, [roomID, userData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (zpInstanceRef.current) {
        zpInstanceRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoading && userData && roomID && meetingContainerRef.current) {
      initializeMeeting(meetingContainerRef.current);
    }
  }, [initializeMeeting, isLoading, userData, roomID]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading meeting room...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: 'red'
      }}>
        <p>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            marginTop: '10px', 
            padding: '10px 20px', 
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className="myCallContainer"
      ref={meetingContainerRef}
      style={{ width: '100vw', height: '100vh' }}
    ></div>
  );
}
