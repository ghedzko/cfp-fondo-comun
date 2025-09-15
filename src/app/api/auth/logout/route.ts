import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  verifyRefreshToken,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (refreshToken) {
      // Verify and decode refresh token
      const decoded = verifyRefreshToken(refreshToken);
      
      if (decoded) {
        // Delete refresh token from database
        await db.refreshToken.deleteMany({
          where: {
            token: refreshToken,
            userId: decoded.userId,
          },
        });
      }
    }

    // Create response
    const response = NextResponse.json({
      message: 'Logout exitoso',
    });

    // Clear cookies
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, clear cookies and return success
    const response = NextResponse.json({
      message: 'Logout exitoso',
    });

    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);

    return response;
  }
}
