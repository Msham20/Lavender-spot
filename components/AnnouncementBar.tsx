'use client';

import React from 'react';

export default function AnnouncementBar() {
  return (
    <div className="bg-charcoal text-ivory text-center text-[11px] sm:text-xs tracking-wider py-2 px-3 overflow-hidden select-none w-full max-w-full">
      <div className="flex gap-8 sm:gap-14 animate-marquee whitespace-nowrap inline-flex">
        <span className="opacity-90">FREE SHIPPING ON ORDERS ABOVE ₹999</span>
        <span className="opacity-90">•</span>
        <span className="opacity-90">10% OFF ON YOUR FIRST ORDER — CODE <strong>LAVENDER10</strong></span>
        <span className="opacity-90">•</span>
        <span className="opacity-90">FREE SHIPPING ON ORDERS ABOVE ₹999</span>
        <span className="opacity-90">•</span>
        <span className="opacity-90">10% OFF ON YOUR FIRST ORDER — CODE <strong>LAVENDER10</strong></span>
      </div>
    </div>
  );
}
