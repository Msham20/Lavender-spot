'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, Lock, Mail } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: normalizedPassword,
      });

      if (signInError || !authData.user) {
        setError('Invalid administrator credentials.');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile || !profile.is_admin) {
        await supabase.auth.signOut();
        setError('This account is not authorized for admin access.');
        return;
      }

      router.replace('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Unable to sign in to admin portal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-16 bg-beige">
      <div className="max-w-md w-full bg-white border border-line rounded-md p-8 sm:p-10 space-y-6 shadow-md">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-lavender-100 rounded-full flex items-center justify-center mx-auto text-lavender-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700 block">
            Lavender Spot Admin
          </span>
          <h1 className="text-2xl font-serif text-charcoal">Administrator Login</h1>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-charcoal-soft block mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@email.com"
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
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-line rounded bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-charcoal text-white text-xs font-semibold uppercase tracking-widest rounded hover:bg-lavender-700 transition-colors shadow disabled:opacity-60"
          >
            {loading ? 'Checking Access...' : 'Access Admin Portal'}
          </button>
        </form>

        <p className="text-[11px] text-charcoal-muted text-center">
          Restricted access for authorized administrators only.
        </p>
      </div>
    </div>
  );
}
