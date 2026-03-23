import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

const handleI18nRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const i18nResponse = handleI18nRouting(request);
  const response = await updateSession(request, i18nResponse);

  const acceptsHtml = request.headers.get('accept')?.includes('text/html');
  const contentType = response.headers.get('content-type');
  const isAppPage = !request.nextUrl.pathname.startsWith('/api');

  if (acceptsHtml && isAppPage) {
    if (!contentType) {
      response.headers.set('content-type', 'text/html; charset=utf-8');
    } else if (contentType.startsWith('text/html') && !/charset=/i.test(contentType)) {
      response.headers.set('content-type', `${contentType}; charset=utf-8`);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
