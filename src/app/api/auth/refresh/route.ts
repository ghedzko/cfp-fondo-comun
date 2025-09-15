import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  getTokenExpirationDate,
  COOKIE_CONFIG,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token no encontrado' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Refresh token inválido' },
        { status: 401 }
      );
    }

    // Check if refresh token exists in database and is not expired
    const storedToken = await db.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      // Clean up expired token
      if (storedToken) {
        await db.refreshToken.delete({
          where: { id: storedToken.id },
        });
      }
      
      return NextResponse.json(
        { error: 'Refresh token expirado' },
        { status: 401 }
      );
    }

    // Check if user is still active
    if (!storedToken.user.isActive) {
      return NextResponse.json(
        { error: 'Usuario inactivo' },
        { status: 401 }
      );
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
      name: storedToken.user.name,
    });

    const newRefreshToken = generateRefreshToken(storedToken.user.id);

    // Update refresh token in database
    const refreshTokenExpiry = getTokenExpirationDate(
      process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    );

    await db.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        token: newRefreshToken,
        expiresAt: refreshTokenExpiry,
      },
    });

    // User data (excluding password)
    const userData = {
      id: storedToken.user.id,
      email: storedToken.user.email,
      name: storedToken.user.name,
      role: storedToken.user.role,
      isActive: storedToken.user.isActive,
      createdAt: storedToken.user.createdAt,
      updatedAt: storedToken.user.updatedAt,
    };

    const response = NextResponse.json({
      message: 'Tokens renovados exitosamente',
      user: userData,
    });

    // Set new HTTP-only cookies
    response.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
      ...COOKIE_CONFIG,
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set(REFRESH_TOKEN_COOKIE, newRefreshToken, {
      ...COOKIE_CONFIG,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;

  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
