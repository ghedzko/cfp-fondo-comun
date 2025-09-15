import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from '@/lib/auth';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/admin',
  '/preceptor',
  '/api/protected',
];

// Routes that require ADMIN role
const adminOnlyRoutes = [
  '/admin',
  '/api/admin',
];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/api/auth',
  '/api/health',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Get access token from cookie
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  
  if (!accessToken) {
    // Redirect to login if no token
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Verify access token
  const decoded = verifyAccessToken(accessToken);
  
  if (!decoded) {
    // Redirect to login if token is invalid
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Check if route requires ADMIN role
  const isAdminRoute = adminOnlyRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  if (isAdminRoute && decoded.role !== 'ADMIN') {
    // Redirect to dashboard if user doesn't have ADMIN role
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Add user info to request headers for API routes
  const response = NextResponse.next();
  response.headers.set('x-user-id', decoded.userId);
  response.headers.set('x-user-email', decoded.email);
  response.headers.set('x-user-role', decoded.role);
  response.headers.set('x-user-name', decoded.name);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
