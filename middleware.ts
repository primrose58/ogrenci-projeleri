import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
    // 1. Update Supabase session (handles refreshing tokens)
    const response = await updateSession(request);

    // 2. Run i18n middleware
    const intlResponse = intlMiddleware(request);

    // 3. Merge cookies from Supabase response to Intl response
    // ensuring we don't lose the updated session
    response.headers.forEach((value, key) => {
        if (key === 'x-middleware-request-cookie' || key === 'set-cookie') {
            intlResponse.headers.append(key, value);
        }
    });

    // Also copy cookies from the supabaseResponse object itself if any were set via .cookies.set()
    response.cookies.getAll().forEach((cookie) => {
        intlResponse.cookies.set(cookie);
    });

    return intlResponse;
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(tr|en)/:path*']
};
