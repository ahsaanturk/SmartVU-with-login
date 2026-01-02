import { NextResponse } from 'next/server';

export function middleware(request) {
    const token = request.cookies.get('token');
    const { pathname } = request.nextUrl;

    // Define public paths that don't require authentication
    const publicPaths = ['/login', '/signup', '/forgot-password', '/api/auth/login', '/api/auth/register'];

    // Check if the current path is public
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // Also allow static files and images
    if (pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico') || pathname.startsWith('/images/')) {
        return NextResponse.next();
    }

    // If user is not logged in and tries to access a protected route
    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.nextUrl));
    }

    // If user IS logged in and tries to access login/signup, redirect to dashboard
    if (token && (pathname === '/login' || pathname === '/signup')) {
        return NextResponse.redirect(new URL('/', request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
    ],
};
