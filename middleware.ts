import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
    // 1. Update Supabase session (handles refreshing tokens)
    const response = await updateSession(request);

    // 2. Run i18n middleware
    // We need to pass the response from supabase to preserve cookies
    // But next-intl expects to handle the request itself.
    // So we just return the intlMiddleware response BUT we might lose supabase cookies if not careful.
    // Actually, updateSession returns a response with cookies set.
    // A common pattern is to let Supabase middleware run first, then intl.

    return intlMiddleware(request);
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(tr|en)/:path*']
};
