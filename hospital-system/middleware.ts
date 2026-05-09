import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './lib/auth'
import { UserRole } from '@prisma/client'

export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Extract locale from pathname
  const segments = pathname.split('/')
  const locale = segments[1] || 'en'
  const pathnameWithoutLocale = '/' + segments.slice(2).join('/')

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password']
  const isPublicRoute = publicRoutes.some(route => 
    pathnameWithoutLocale.startsWith(route)
  )

  // If user is not authenticated and trying to access protected route
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(
      new URL(`/${locale}/login`, request.url)
    )
  }

  // If user is authenticated and trying to access auth routes
  if (session && isPublicRoute) {
    // Redirect based on user role
    const redirectPath = getRoleBasedRedirect(session.user.role)
    return NextResponse.redirect(
      new URL(`/${locale}${redirectPath}`, request.url)
    )
  }

  // Role-based route protection
  if (session && !isPublicRoute) {
    const userRole = session.user.role
    const protectedRoutes = getProtectedRoutes(userRole)
    
    // Check if user has access to the requested route
    const hasAccess = protectedRoutes.some(route => 
      pathnameWithoutLocale.startsWith(route)
    )

    if (!hasAccess) {
      // Redirect to appropriate dashboard based on role
      const redirectPath = getRoleBasedRedirect(userRole)
      return NextResponse.redirect(
        new URL(`/${locale}${redirectPath}`, request.url)
      )
    }
  }

  return NextResponse.next()
}

function getRoleBasedRedirect(role: UserRole): string {
  switch (role) {
    case 'PATIENT':
      return '/patient/dashboard'
    case 'DOCTOR':
      return '/doctor/dashboard'
    case 'NURSE':
      return '/nurse/dashboard'
    case 'RECEPTIONIST':
      return '/receptionist/dashboard'
    case 'PHARMACIST':
      return '/pharmacist/dashboard'
    case 'LAB_TECHNICIAN':
      return '/lab/dashboard'
    case 'ADMIN':
      return '/admin/dashboard'
    default:
      return '/dashboard'
  }
}

function getProtectedRoutes(role: UserRole): string[] {
  const baseRoutes = ['/dashboard', '/profile', '/settings']
  
  switch (role) {
    case 'PATIENT':
      return [
        ...baseRoutes,
        '/patient',
        '/appointments',
        '/medical-records'
      ]
    case 'DOCTOR':
      return [
        ...baseRoutes,
        '/doctor',
        '/appointments',
        '/patients',
        '/queue',
        '/medical-records'
      ]
    case 'NURSE':
      return [
        ...baseRoutes,
        '/nurse',
        '/patients',
        '/appointments',
        '/medical-records'
      ]
    case 'RECEPTIONIST':
      return [
        ...baseRoutes,
        '/receptionist',
        '/appointments',
        '/patients',
        '/billing'
      ]
    case 'PHARMACIST':
      return [
        ...baseRoutes,
        '/pharmacist',
        '/prescriptions',
        '/inventory'
      ]
    case 'LAB_TECHNICIAN':
      return [
        ...baseRoutes,
        '/lab',
        '/tests',
        '/results'
      ]
    case 'ADMIN':
      return [
        ...baseRoutes,
        '/admin',
        '/users',
        '/departments',
        '/appointments',
        '/patients',
        '/doctors',
        '/staff',
        '/reports'
      ]
    default:
      return baseRoutes
  }
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
