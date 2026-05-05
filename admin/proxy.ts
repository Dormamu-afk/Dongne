import { NextResponse, type NextRequest } from 'next/server';
import { createHmac } from 'crypto';

function getExpectedToken() {
  if (!process.env.ADMIN_PASSWORD) return null;
  return createHmac('sha256', process.env.ADMIN_PASSWORD).update('session').digest('hex');
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const publicPaths = ['/admin/login', '/admin/auth/callback', '/admin/unauthorized'];
    if (publicPaths.some(p => request.nextUrl.pathname.startsWith(p))) {
      return NextResponse.next({ request });
    }

    const sessionCookie = request.cookies.get('admin_session')?.value;
    const expected = getExpectedToken();

    if (!sessionCookie || !expected || sessionCookie !== expected) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: ['/admin/:path*'],
};
