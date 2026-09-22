'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/lib/store/cart-context';
import { Heart, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, products } = useCart();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-[1320px] mx-auto px-5 lg:px-10 py-10 space-y-8">
      {/* Title */}
      <div className="border-b border-line pb-4 flex justify-between items-end">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
            Saved Items
          </span>
          <h1 className="text-3xl font-serif text-charcoal mt-1">My Wishlist ({wishlist.length})</h1>
        </div>
        <Link href="/shop" className="text-xs font-semibold text-lavender-700 hover:underline">
          Explore Shop →
        </Link>
      </div>

      {wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-5">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-line rounded-md space-y-4">
          <div className="w-16 h-16 bg-lavender-100 rounded-full flex items-center justify-center mx-auto text-lavender-700">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif text-charcoal">Your Wishlist is Empty</h2>
          <p className="text-xs text-charcoal-soft max-w-sm mx-auto">
            Save your favorite beauty formulas to your wishlist so you can easily find them later.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-lavender-700 transition-colors"
          >
            Explore Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
