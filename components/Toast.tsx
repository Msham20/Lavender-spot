'use client';

import React from 'react';
import { useCart } from '@/lib/store/cart-context';

export default function Toast() {
  const { toast } = useCart();

  if (!toast) return null;

  return (
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 bg-charcoal text-ivory px-6 py-3.5 rounded-md text-sm z-50 shadow-lg flex items-center gap-2.5 transition-all duration-300 animate-bounce-subtle">
      <span className="w-2 h-2 rounded-full bg-lavender-400"></span>
      <span>{toast}</span>
    </div>
  );
}
