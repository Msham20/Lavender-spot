'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Star } from 'lucide-react';
import { Product } from '@/types/database';
import { useCart } from '@/lib/store/cart-context';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const wished = isWishlisted(product.id);

  const discountPercent =
    product.discount_price && product.discount_price > product.price
      ? Math.round((1 - product.price / product.discount_price) * 100)
      : 0;

  return (
    <div className="group relative text-xs flex flex-col justify-between">
      {/* Media Box */}
      <div
        onClick={() => router.push(`/products/${product.slug}`)}
        className="relative aspect-[4/5] rounded-md overflow-hidden bg-beige mb-2.5 cursor-pointer select-none"
      >
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.is_bestseller && (
            <span className="bg-charcoal text-ivory text-[8.5px] uppercase font-semibold px-1.5 py-0.5 rounded">
              Best Seller
            </span>
          )}
          {product.is_new_arrival && (
            <span className="bg-lavender-700 text-white text-[8.5px] uppercase font-semibold px-1.5 py-0.5 rounded">
              New
            </span>
          )}
        </div>

        {discountPercent > 0 && (
          <span className="absolute top-2 right-2 z-10 bg-lavender-700 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
            {discountPercent}% OFF
          </span>
        )}

        {/* Primary Image / Gradient */}
        {product.primary_image && (product.primary_image.startsWith('http') || product.primary_image.startsWith('data:')) ? (
          <img
            src={product.primary_image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-serif text-3xl text-white transition-transform duration-500 group-hover:scale-105"
            style={{ background: product.primary_image || 'linear-gradient(135deg, #F3EAF8, #7E60BF)' }}
          >
            {product.name.charAt(0)}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute bottom-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md transition-all duration-200 ${
            wished ? 'text-lavender-700 opacity-100' : 'text-charcoal opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${wished ? 'fill-lavender-700 stroke-lavender-700' : ''}`} />
        </button>

        {/* Quick Add / Out of Stock Button */}
        {product.stock > 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product.id);
            }}
            className="absolute left-2 right-2 bottom-2 z-10 bg-charcoal/95 text-ivory text-[9.5px] font-semibold uppercase tracking-wider py-2 text-center rounded opacity-100 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-200 hover:bg-lavender-700 shadow-sm"
          >
            Quick Add
          </button>
        ) : (
          <div className="absolute left-2 right-2 bottom-2 z-10 bg-charcoal-muted/80 text-white text-[9.5px] font-semibold uppercase tracking-wider py-2 text-center rounded opacity-100">
            Out of Stock
          </div>
        )}
      </div>

      {/* Info Box */}
      <div>
        <Link href={`/products/${product.slug}`} className="font-serif text-sm font-medium text-charcoal line-clamp-2 leading-tight hover:text-lavender-700 transition-colors">
          {product.name}
        </Link>
        <p className="text-[11px] text-charcoal-muted mt-0.5 truncate">{product.category_name}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1 text-[10.5px] text-charcoal-soft">
          <div className="flex text-lavender-700">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.round(product.rating)
                    ? 'fill-lavender-700 stroke-lavender-700'
                    : 'text-line fill-none'
                }`}
              />
            ))}
          </div>
          <span>{product.rating}</span>
          <span className="text-charcoal-muted">({product.review_count})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-1 text-xs font-semibold text-charcoal">
          <span>₹{product.price}</span>
          {product.discount_price && product.discount_price > product.price && (
            <>
              <span className="text-[11px] text-charcoal-muted line-through font-normal">
                ₹{product.discount_price}
              </span>
              <span className="text-[10px] text-lavender-700 font-semibold">
                {discountPercent}% OFF
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
