'use client';

import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-beige pt-16 pb-8 border-t border-line mt-20">
      <div className="max-w-[1320px] mx-auto px-5 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-1">
            <Link href="/" className="font-serif text-2xl font-medium tracking-wide text-charcoal">
              Lavender Spot
            </Link>
            <p className="text-xs text-charcoal-soft leading-relaxed mt-3 mb-5 max-w-[260px]">
              Thoughtfully crafted skincare and beauty essentials, made to elevate your everyday ritual.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking', 'COD'].map((chip) => (
                <span key={chip} className="text-[10px] border border-line px-2.5 py-1 rounded bg-ivory text-charcoal-soft">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Shop Col */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-soft mb-4">Shop</h4>
            <div className="flex flex-col gap-2.5 text-xs text-charcoal-soft">
              <Link href="/shop" className="hover:text-lavender-700 transition-colors">All Products</Link>
              <Link href="/shop?category=Skincare" className="hover:text-lavender-700 transition-colors">Skincare</Link>
              <Link href="/shop?category=Face" className="hover:text-lavender-700 transition-colors">Face Makeup</Link>
              <Link href="/shop?category=Hair Care" className="hover:text-lavender-700 transition-colors">Hair Care</Link>
              <Link href="/shop?filter=bestseller" className="hover:text-lavender-700 transition-colors">Best Sellers</Link>
              <Link href="/shop?filter=new" className="hover:text-lavender-700 transition-colors">New Arrivals</Link>
            </div>
          </div>

          {/* Help Col */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-soft mb-4">Help</h4>
            <div className="flex flex-col gap-2.5 text-xs text-charcoal-soft">
              <Link href="#" className="hover:text-lavender-700 transition-colors">Contact Us</Link>
              <Link href="#" className="hover:text-lavender-700 transition-colors">FAQs</Link>
              <Link href="#" className="hover:text-lavender-700 transition-colors">Shipping & Delivery</Link>
              <Link href="#" className="hover:text-lavender-700 transition-colors">Returns & Refunds</Link>
              <Link href="/account" className="hover:text-lavender-700 transition-colors">Track Order</Link>
            </div>
          </div>

          {/* Company Col */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-soft mb-4">Company</h4>
            <div className="flex flex-col gap-2.5 text-xs text-charcoal-soft">
              <Link href="#" className="hover:text-lavender-700 transition-colors">About Us</Link>
              <Link href="#" className="hover:text-lavender-700 transition-colors">Our Story</Link>
              <Link href="#" className="hover:text-lavender-700 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-lavender-700 transition-colors">Terms & Conditions</Link>
            </div>
          </div>

          {/* Social Col */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-soft mb-4">Social</h4>
            <div className="flex flex-col gap-2.5 text-xs text-charcoal-soft">
              <a href="#" className="hover:text-lavender-700 transition-colors">Instagram</a>
              <a href="#" className="hover:text-lavender-700 transition-colors">Facebook</a>
              <a href="#" className="hover:text-lavender-700 transition-colors">YouTube</a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-6 border-t border-line flex flex-col sm:flex-row justify-between items-center text-xs text-charcoal-soft gap-3">
          <span>© 2026 Lavender Spot Beauty. All rights reserved.</span>
          <span className="flex items-center gap-1.5 text-xs">
            <Lock className="w-3.5 h-3.5 text-lavender-700" /> 100% Secure Payments
          </span>
        </div>
      </div>
    </footer>
  );
}
