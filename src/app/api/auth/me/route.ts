import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  verifyAccessToken,
  ACCESS_TOKEN_COOKIE
} from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token de acceso no encontrado' },
        { status: 401 }
      );
    }

    // Verify access token
    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token de acceso inválido' },
        { status: 401 }
      );
    }

    // Get fresh user data from database
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o inactivo' },
        { status: 401 }
      );
    }

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json({
      user: userData,
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
