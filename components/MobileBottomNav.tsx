'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount, wishlist } = useCart();

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      exact: true,
    },
    {
      href: '/shop',
      label: 'Shop',
      icon: Grid,
      exact: false,
    },
    {
      href: '/wishlist',
      label: 'Wishlist',
      icon: Heart,
      badge: wishlist.length > 0 ? wishlist.length : null,
      exact: false,
    },
    {
      href: '/cart',
      label: 'Bag',
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : null,
      exact: false,
    },
    {
      href: '/account',
      label: 'Account',
      icon: User,
      exact: false,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAF8FC]/95 backdrop-blur-md border-t border-line px-3 py-2 shadow-lg">
      <nav className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-lavender-700 font-semibold'
                  : 'text-charcoal-soft hover:text-charcoal'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2px]' : 'stroke-[1.75px]'}`} />
                {item.badge !== null && item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-lavender-700 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-lavender-700" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
