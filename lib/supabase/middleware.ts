import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest, initialResponse?: NextResponse) {
  let response =
    initialResponse ||
    NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet: Parameters<NonNullable<CookieMethodsServer['setAll']>>[0]) {
      cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
      response = NextResponse.next({ request });
      cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
    },
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: cookieMethods,
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const segments = request.nextUrl.pathname.split('/').filter(Boolean);
  const locale = segments[0];
  const normalizedPath = `/${segments.slice(1).join('/')}`;

  const isAuthPage = normalizedPath === '/login' || normalizedPath === '/register';
  const isDashboardPage = normalizedPath === '/dashboard' || normalizedPath.startsWith('/dashboard/');

  if (!user && isDashboardPage) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  return response;
}
