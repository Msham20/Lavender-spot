'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-[1320px] mx-auto px-5 lg:px-10 py-16">
      <div className="max-w-md mx-auto bg-white border border-line rounded-md p-8 sm:p-10 space-y-6 shadow-sm">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
            Account Recovery
          </span>
          <h1 className="text-3xl font-serif text-charcoal">Forgot Password</h1>
          <p className="text-xs text-charcoal-soft">Enter your email and we will send password reset instructions.</p>
        </div>

        {submitted ? (
          <div className="p-4 bg-lavender-50 border border-lavender-200 text-lavender-900 text-xs rounded text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-lavender-700 mx-auto" />
            <p className="font-semibold">Reset link sent to {email}</p>
            <p className="text-charcoal-soft">Check your inbox for further instructions.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              className="w-full py-3.5 bg-lavender-700 text-white text-xs font-semibold uppercase tracking-widest rounded hover:bg-lavender-800 transition-colors shadow"
            >
              Send Reset Instructions
            </button>
          </form>
        )}

        <div className="text-center text-xs text-charcoal-soft pt-2 border-t border-line">
          Remember password?{' '}
          <Link href="/login" className="text-lavender-700 font-semibold hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
