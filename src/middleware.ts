import jwtDecode from 'jwt-decode';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { roles, whitelist } from './middlewares/constants';
import { Role } from './types/base.type';
import { getRolePath } from './utils/funcs';

const getRoleInRoute = (role: string) => {
  if (role === 'STAFF') return 'TEACHER'; // STAFF can access TEACHER routes cause they are the same
  return role;
};

// Middleware to check if the user's role matches the role in the route
export function checkRoleRoute(request: NextRequest, role: string, nextUrl: string) {
  const roleInRoute = request.nextUrl.pathname.split('/')[1].toUpperCase();

  if (roles.includes(roleInRoute as Role) && role !== getRoleInRoute(roleInRoute)) {
    return NextResponse.redirect(new URL(nextUrl, request.url));
  }

  return NextResponse.next();
}

export const checkToken = (token: string) => {
  let decoded: any;
  try {
    decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) return false;
    return true;
  } catch (error) {
    return false;
  }
};

export function handleOauth(request: NextRequest) {
  const token = request.cookies.get('token');
  const redirectUrl = request.nextUrl.searchParams.get('redirect');
  // If there is no token or redirect url, just go to the next middleware to login
  if (!token || !redirectUrl) return NextResponse.next();
  if (!checkToken(token.value)) return NextResponse.next();
  const hasQuery = redirectUrl?.includes('?');
  const separator = hasQuery ? '&' : '?';
  const nextUrl = `${redirectUrl}${separator}token=${token.value}`;

  return NextResponse.redirect(nextUrl);
}

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const isAuthRoute = request.nextUrl.pathname.includes('auth');
  // Handle oauth auth route
  const isOauth = request.nextUrl.searchParams.get('oauth');
  if (Boolean(isOauth) && isAuthRoute) return handleOauth(request);

  if ((whitelist.includes(request.nextUrl.pathname) || isAuthRoute) && !token)
    return NextResponse.next();
  if (isAuthRoute && token) return NextResponse.redirect(new URL('/', request.url));
  // Verify token
  /* 
    TODO: this method is not efficient, if someone explicitly set the token to be other fake thing, it will cause too many redirects and require to delete the cookie manually
  */
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  } else if (token) {
    let decoded: any;
    try {
      decoded = jwtDecode(token.value);
      const isExpired = decoded.exp * 1000 < Date.now();
      if (isExpired && !whitelist.includes(request.nextUrl.pathname)) {
        request.cookies.delete('token');
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    } catch (error) {
      request.cookies.delete('token');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    const role = decoded?.role;
    const nextUrl = getRolePath(role ?? '');
    if (whitelist.includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL(nextUrl, request.url));
    }
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL(nextUrl, request.url));
    }
    return checkRoleRoute(request, role, nextUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|auth/reset-password|_next/static|public|_next/image|favicon.ico|images|logo.svg|logo.png|rca.jpeg|favicon.svg|favicon.png).*)',
  ],
};
