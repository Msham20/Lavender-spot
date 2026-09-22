'use client';

import React, { useState } from 'react';
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (email && password.length >= 6) {
          localStorage.setItem(
            'lavender_spot_user_session',
            JSON.stringify({ email, name: email.split('@')[0], is_admin: false })
          );
          router.push('/account');
          return;
        }
        throw error;
      }

      router.push('/account');
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
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
            disabled={loading}
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
