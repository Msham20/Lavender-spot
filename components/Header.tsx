'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';
import { Product } from '@/types/database';

export default function Header() {
  const router = useRouter();
  const { cartCount, wishlist, products } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matches = products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) || p.category_name?.toLowerCase().includes(q)
        )
        .slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8FC]/95 backdrop-blur-md border-b border-line w-full">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-5">
        {/* Logo */}
        <Link href="/" className="font-serif text-xl sm:text-2xl font-medium tracking-wide text-charcoal flex-shrink-0">
          Lavender Spot
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-charcoal-soft">
          <Link href="/" className="hover:text-lavender-700 transition-colors">
            Home
          </Link>
          <Link href="/shop" className="hover:text-lavender-700 transition-colors">
            Shop
          </Link>
          <Link href="/shop?filter=bestseller" className="hover:text-lavender-700 transition-colors">
            Best Sellers
          </Link>
          <Link href="/shop?filter=new" className="hover:text-lavender-700 transition-colors">
            New Arrivals
          </Link>
        </nav>

        {/* Search Bar */}
        <div ref={searchRef} className="relative hidden sm:block flex-1 max-w-[280px]">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
            <input
              type="text"
              placeholder="Search beauty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-line bg-white focus:outline-none focus:border-lavender-600 transition-colors"
            />
          </form>

          {/* Search Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-line rounded-lg shadow-xl overflow-hidden z-50">
              {suggestions.length > 0 ? (
                suggestions.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 p-2.5 hover:bg-lavender-50 transition-colors border-b border-line last:border-b-0"
                  >
                    <div
                      className="w-8 h-8 rounded flex-shrink-0"
                      style={{ background: product.primary_image }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-serif truncate text-charcoal">{product.name}</p>
                      <p className="text-[10px] text-charcoal-muted">₹{product.price}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-3 text-xs text-charcoal-muted text-center">No results found</div>
              )}
            </div>
          )}
        </div>

        {/* Header Icons */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link href="/account" aria-label="Account" className="hidden sm:flex text-charcoal hover:text-lavender-700 transition-colors">
            <User className="w-5 h-5" />
          </Link>

          <Link href="/wishlist" aria-label="Wishlist" className="hidden sm:flex relative text-charcoal hover:text-lavender-700 transition-colors">
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-lavender-700 text-white text-[9px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link href="/cart" aria-label="Cart" className="relative text-charcoal hover:text-lavender-700 transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-lavender-700 text-white text-[9px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-charcoal focus:outline-none p-1"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 top-20 bg-charcoal/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-20 left-0 right-0 bg-white border-b border-line shadow-2xl z-50 md:hidden px-6 py-6 space-y-5 animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
            <input
              type="text"
              placeholder="Search products, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-full border border-line bg-ivory focus:outline-none focus:border-lavender-600"
            />
            {showSuggestions && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-line rounded-lg shadow-xl overflow-hidden z-50">
                {suggestions.length > 0 ? (
                  suggestions.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => {
                        setShowSuggestions(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-lavender-50 transition-colors border-b border-line last:border-b-0"
                    >
                      <div
                        className="w-8 h-8 rounded flex-shrink-0"
                        style={{ background: product.primary_image }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-serif truncate text-charcoal">{product.name}</p>
                        <p className="text-[10px] text-charcoal-muted">₹{product.price}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-3 text-xs text-charcoal-muted text-center">No results found</div>
                )}
              </div>
            )}
          </form>

          <nav className="flex flex-col space-y-1 text-sm font-medium text-charcoal divide-y divide-line/60">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 flex items-center justify-between hover:text-lavender-700"
            >
              <span>Home</span>
            </Link>
            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 flex items-center justify-between hover:text-lavender-700"
            >
              <span>Shop All Products</span>
            </Link>
            <Link
              href="/shop?filter=bestseller"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 flex items-center justify-between hover:text-lavender-700"
            >
              <span>Best Sellers</span>
              <span className="text-[10px] bg-lavender-100 text-lavender-700 px-2 py-0.5 rounded font-semibold">Popular</span>
            </Link>
            <Link
              href="/shop?filter=new"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 flex items-center justify-between hover:text-lavender-700"
            >
              <span>New Arrivals</span>
              <span className="text-[10px] bg-lavender-700 text-white px-2 py-0.5 rounded font-semibold">New</span>
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 flex items-center justify-between hover:text-lavender-700"
            >
              <span>Saved Wishlist</span>
              <span className="text-xs text-charcoal-muted">({wishlist.length})</span>
            </Link>
            <Link
              href="/account"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 flex items-center justify-between hover:text-lavender-700"
            >
              <span>My Account</span>
            </Link>
            <Link
              href="/admin/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2.5 flex items-center justify-between text-lavender-700 font-semibold"
            >
              <span>Admin Portal</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
