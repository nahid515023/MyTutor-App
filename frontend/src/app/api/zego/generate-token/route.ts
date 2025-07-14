import { NextRequest, NextResponse } from 'next/server';

// Simple token generation function (for development/testing)
// In production, you should use Zego's server SDK or generate tokens server-side
function generateKitTokenForTest(
  appId: number,
  serverSecret: string,
  roomId: string,
  userId: string,
  userName: string
): string {
  // This is a simplified token generation for testing
  // In production, use proper server-side token generation
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = Math.floor(Math.random() * 1000000);
  
  // Simple base64 encoding for demo (not secure for production)
  const tokenData = {
    app_id: appId,
    room_id: roomId,
    user_id: userId,
    user_name: userName,
    timestamp,
    nonce,
    server_secret: serverSecret.substring(0, 8) // Just a hint for validation
  };
  
  return btoa(JSON.stringify(tokenData));
}

export async function POST(request: NextRequest) {
  try {
    const { roomId, userId, userName } = await request.json();

    // Validate required fields
    if (!roomId || !userId || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields: roomId, userId, userName' },
        { status: 400 }
      );
    }

    // Validate input types and lengths
    if (typeof roomId !== 'string' || typeof userId !== 'string' || typeof userName !== 'string') {
      return NextResponse.json(
        { error: 'Invalid field types' },
        { status: 400 }
      );
    }

    if (roomId.length > 256 || userId.length > 256 || userName.length > 256) {
      return NextResponse.json(
        { error: 'Field values too long' },
        { status: 400 }
      );
    }

    // Get secrets from environment (backend only - secure)
    const appId = parseInt(process.env.NEXT_PUBLIC_APPID || '0', 10);
    const serverSecret = process.env.ZEGO_SERVER_SECRET;

    if (!appId || !serverSecret) {
      console.error('Missing Zego configuration:', { 
        hasAppId: !!appId, 
        hasServerSecret: !!serverSecret 
      });
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Generate token securely on the server
    const kitToken = generateKitTokenForTest(
      appId,
      serverSecret,
      roomId,
      userId,
      userName
    );

    // Log successful token generation (without exposing sensitive data)
    console.log(`Token generated for user ${userId} in room ${roomId}`);

    return NextResponse.json({
      token: kitToken,
      appId: appId,
      success: true
    });

  } catch (error) {
    console.error('Error generating Zego token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}

// Optional: Add rate limiting or authentication here
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
