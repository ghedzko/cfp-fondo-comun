import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// JWT Payload Interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

// Password Hashing
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWT Token Generation
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'cfp-fondo-comun',
    audience: 'cfp-users',
  } as jwt.SignOptions);
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'cfp-fondo-comun',
    audience: 'cfp-users',
  } as jwt.SignOptions);
}

// JWT Token Verification
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'cfp-fondo-comun',
      audience: 'cfp-users',
    }) as JWTPayload;
    console.log('JWT verification successful for user:', decoded.email);
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'cfp-fondo-comun',
      audience: 'cfp-users',
    }) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}

// Token Expiration Helpers
export function getTokenExpirationDate(expiresIn: string): Date {
  const now = new Date();
  
  // Parse expiration string (e.g., "7d", "15m", "1h")
  const match = expiresIn.match(/^(\d+)([dhm])$/);
  if (!match) {
    throw new Error('Invalid expiration format');
  }
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 'd':
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    case 'h':
      return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'm':
      return new Date(now.getTime() + value * 60 * 1000);
    default:
      throw new Error('Invalid expiration unit');
  }
}

// Role-based Access Control
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.ADMIN]: 2,
    [UserRole.PRECEPTOR]: 1,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Cookie Configuration
export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: false, // Set to false for development
  sameSite: 'lax' as const,
  path: '/',
} as const;

export const ACCESS_TOKEN_COOKIE = 'cfp-access-token';
export const REFRESH_TOKEN_COOKIE = 'cfp-refresh-token';

// Token verification for API routes
export async function verifyToken(request: Request): Promise<JWTPayload | null> {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const token = cookies[ACCESS_TOKEN_COOKIE];
    if (!token) return null;

    return verifyAccessToken(token);
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
