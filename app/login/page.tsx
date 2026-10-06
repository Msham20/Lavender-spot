'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const authError = new URLSearchParams(window.location.search).get('authError');
    if (authError === 'confirmation') {
      setError('That confirmation link is invalid or expired. Create a new account or request another confirmation email.');
    } else if (authError === 'oauth') {
      setError('Google sign-in could not be completed. Please try again.');
    }
  }, []);

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      const supabase = createClient();
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      const destination = redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : '/account';
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      callbackUrl.searchParams.set('next', destination);
      callbackUrl.searchParams.set('provider', 'google');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: callbackUrl.toString() },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to start Google sign-in. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Supabase did not return a signed-in user. Please try again.');
      }

      localStorage.setItem(
        'lavender_spot_user_session',
        JSON.stringify({
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Customer',
          is_admin: false,
        })
      );
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      const destination = redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : '/account';
      router.replace(destination);
    } catch (err: any) {
      if (err.code === 'email_not_confirmed' || /email not confirmed/i.test(err.message || '')) {
        setError('Please confirm your email address from the link we sent before signing in.');
      } else {
        setError(err.message || 'Failed to log in. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1320px] mx-auto px-5 lg:px-10 py-16">
      <div className="max-w-md mx-auto bg-white border border-line rounded-md p-8 sm:p-10 space-y-6 shadow-sm">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
            Welcome Back
          </span>
          <h1 className="text-3xl font-serif text-charcoal">Sign In</h1>
          <p className="text-xs text-charcoal-soft">Log in to manage your orders and saved wishlist.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded font-semibold">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full py-3 border border-line bg-white text-charcoal text-xs font-semibold rounded hover:bg-lavender-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2.5"
        >
          <svg aria-hidden="true" viewBox="0 0 48 48" className="w-4 h-4">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 38.02 46.98 31.81 46.98 24.55Z" />
            <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.45-4.88 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
          </svg>
          {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-3 text-[10px] text-charcoal-muted">
          <span className="h-px flex-1 bg-line" />
          OR SIGN IN WITH EMAIL
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-charcoal-soft block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-line rounded bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-charcoal-soft">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-lavender-700 hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-line rounded bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3.5 bg-lavender-700 text-white text-xs font-semibold uppercase tracking-widest rounded hover:bg-lavender-800 transition-colors shadow"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-charcoal-soft pt-2 border-t border-line">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-lavender-700 font-semibold hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
