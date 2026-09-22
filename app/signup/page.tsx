'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, Mail, Lock } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) {
        localStorage.setItem(
          'lavender_spot_user_session',
          JSON.stringify({ email, name, is_admin: false })
        );
        router.push('/account');
        return;
      }

      router.push('/account');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1320px] mx-auto px-5 lg:px-10 py-16">
      <div className="max-w-md mx-auto bg-white border border-line rounded-md p-8 sm:p-10 space-y-6 shadow-sm">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
            Join Lavender Spot
          </span>
          <h1 className="text-3xl font-serif text-charcoal">Create Account</h1>
          <p className="text-xs text-charcoal-soft">Sign up to enjoy personalized skincare recommendations.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-charcoal-soft block mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ananya Roy"
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-line rounded bg-white"
              />
            </div>
          </div>

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
            <label className="text-xs font-semibold text-charcoal-soft block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-line rounded bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-charcoal-soft block mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-line rounded bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-lavender-700 text-white text-xs font-semibold uppercase tracking-widest rounded hover:bg-lavender-800 transition-colors shadow"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-xs text-charcoal-soft pt-2 border-t border-line">
          Already have an account?{' '}
          <Link href="/login" className="text-lavender-700 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
