'use client'

import * as React from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
// import plugin
 import { ZegoSuperBoardManager } from "zego-superboard-web";


function randomID(len:number) {
  let result = '';
  if (result) return result;
  const chars: string = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJ';
  const maxPos = chars.length;
  let i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export function getUrlParams(
  url?: string
) {
  if (typeof window === 'undefined') return new URLSearchParams();
  const actualUrl = url || window.location.href;
  const urlStr = actualUrl.split('?')[1];
  return new URLSearchParams(urlStr);
}

interface SharedLink {
  name: string;
  url: string;
}

interface JoinRoomConfig {
  container: HTMLElement | null;
  sharedLinks: SharedLink[];
  scenario: {
    mode: typeof ZegoUIKitPrebuilt.GroupCall;
  };
}

export default function App() {
  const [mounted, setMounted] = React.useState(false);
  const divRef = React.useRef<HTMLDivElement | null>(null);
  
  const roomID = React.useMemo(() => {
    if (typeof window === 'undefined') return randomID(5);
    return getUrlParams().get('roomID') || randomID(5);
  }, []);

  const myMeeting: (element: HTMLElement | null) => Promise<void> = React.useCallback(async (element) => {
    // generate Kit Token
    const appID: number = 1667837698;
    const serverSecret: string = "b8d2b335e2a49b4632b12b04b2cdc277";
    const kitToken: string = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      randomID(5),
      randomID(5)
    );

    // Create instance object from Kit Token.
    const zp = ZegoUIKitPrebuilt.create(kitToken);
     zp.addPlugins({ZegoSuperBoardManager});
    // start the call
    const config: JoinRoomConfig = {
      container: element,
      sharedLinks: [
        {
          name: 'Personal link',
          url:
            typeof window !== 'undefined' 
              ? window.location.protocol +
                '//' +
                window.location.host +
                window.location.pathname +
                '?roomID=' +
                roomID
              : '',
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall, // To implement 1-on-1 calls, modify the parameter here to [ZegoUIKitPrebuilt.OneONoneCall].
      },
    };
    zp.joinRoom(config);
  }, [roomID]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted && divRef.current) {
      myMeeting(divRef.current);
    }
  }, [mounted, myMeeting]);

  if (!mounted) {
    return <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  return (
    <div
      className="myCallContainer"
      ref={divRef}
      style={{ width: '100vw', height: '100vh' }}
    ></div>
  );
}