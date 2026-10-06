import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const authError = request.nextUrl.searchParams.get('error');
  const next = request.nextUrl.searchParams.get('next') || '/account';
  const redirectUrl = new URL(next, request.url);

  if (redirectUrl.origin !== request.nextUrl.origin) {
    redirectUrl.pathname = '/account';
    redirectUrl.search = '';
  }

  if (authError) {
    return NextResponse.redirect(new URL('/login?authError=oauth', request.url));
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(redirectUrl);
    }

    if (request.nextUrl.searchParams.get('provider') === 'google') {
      return NextResponse.redirect(new URL('/login?authError=oauth', request.url));
    }
  }

  return NextResponse.redirect(new URL('/login?authError=confirmation', request.url));
}