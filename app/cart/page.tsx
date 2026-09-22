'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart-context';
import ProductCard from '@/components/ProductCard';
import { ShoppingBag, Trash2, Heart, ArrowRight } from 'lucide-react';

const COUPONS: Record<string, number> = {
  LAVENDER10: 0.1,
  LAVENDER20: 0.2,
  TAGVIX10: 0.1,
};

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    toggleWishlist,
    products,
    showToast,
    cartSubtotal,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscountRate, setAppliedDiscountRate] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const shippingCharge = cartSubtotal >= 999 || cartSubtotal === 0 ? 0 : 79;
  const discountAmount = Math.round(cartSubtotal * appliedDiscountRate);
  const finalTotal = cartSubtotal + shippingCharge - discountAmount;
  const freeShippingThreshold = 999;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedDiscountRate(COUPONS[code]);
      setCouponMessage({
        text: `Coupon ${code} applied successfully! (${COUPONS[code] * 100}% off)`,
        isError: false,
      });
      showToast(`Coupon ${code} applied!`);
    } else {
      setAppliedDiscountRate(0);
      setCouponMessage({ text: 'Invalid coupon code. Try LAVENDER10', isError: true });
    }
  };

  const cartProductIds = cart.map((i) => i.product_id);
  const recommendedProducts = products.filter((p) => !cartProductIds.includes(p.id)).slice(0, 5);

  if (cart.length === 0) {
    return (
      <div className="max-w-[1320px] mx-auto px-5 lg:px-10 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-lavender-100 rounded-full flex items-center justify-center mx-auto text-lavender-700">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-serif text-charcoal">Your Shopping Cart is Empty</h1>
        <p className="text-xs sm:text-sm text-charcoal-soft max-w-md mx-auto">
          Explore our collection of clean, effective skincare and beauty rituals to find your everyday favorites.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-charcoal text-white text-xs font-semibold uppercase tracking-widest rounded hover:bg-lavender-700 transition-colors"
        >
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1320px] mx-auto px-5 lg:px-10 py-10 space-y-12">
      {/* Page Title */}
      <div className="flex justify-between items-end border-b border-line pb-4">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
            Shopping Bag
          </span>
          <h1 className="text-3xl font-serif text-charcoal mt-1">Your Cart ({cart.length})</h1>
        </div>
        <Link href="/shop" className="text-xs font-semibold text-lavender-700 hover:underline">
          ← Continue Shopping
        </Link>
      </div>

      {/* Free Shipping Progress Meter */}
      <div className="bg-lavender-50 border border-lavender-200 rounded-md p-4 space-y-2">
        <div className="flex justify-between text-xs font-semibold text-charcoal">
          <span>
            {remainingForFreeShipping === 0
              ? '🎉 You unlocked FREE Shipping!'
              : `Add ₹${remainingForFreeShipping} more for FREE Shipping`}
          </span>
          <span>₹{cartSubtotal} / ₹{freeShippingThreshold}</span>
        </div>
        <div className="w-full bg-lavender-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-lavender-700 h-full transition-all duration-300"
            style={{ width: `${Math.min(100, (cartSubtotal / freeShippingThreshold) * 100)}%` }}
          />
        </div>
      </div>

      {/* Cart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 divide-y divide-line border-t border-b border-line">
          {cart.map((item) => (
            <div key={`${item.product_id}-${item.size}`} className="py-6 flex gap-4 sm:gap-6 items-center">
              {/* Thumbnail */}
              <Link
                href={`/products/${item.product.slug}`}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded bg-beige flex-shrink-0 flex items-center justify-center font-serif text-2xl text-white select-none"
                style={{ background: item.product.primary_image || 'linear-gradient(135deg, #F3EAF8, #7E60BF)' }}
              >
                {item.product.name.charAt(0)}
              </Link>

              {/* Item Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="font-serif text-base font-medium text-charcoal truncate block hover:text-lavender-700"
                >
                  {item.product.name}
                </Link>
                <p className="text-xs text-charcoal-muted">Size: {item.size}</p>
                <div className="text-xs font-semibold text-charcoal sm:hidden">
                  ₹{item.product.price * item.quantity}
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-4 pt-2 flex-wrap">
                  {/* Qty Modifier */}
                  <div className="inline-flex items-center border border-line rounded bg-white text-xs">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, -1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-beige text-charcoal font-semibold"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-beige text-charcoal font-semibold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product_id, item.size)}
                    className="text-xs text-rose-700 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>

                  <button
                    onClick={() => {
                      toggleWishlist(item.product_id);
                      removeFromCart(item.product_id, item.size);
                    }}
                    className="text-xs text-charcoal-soft hover:text-lavender-700 hover:underline flex items-center gap-1"
                  >
                    <Heart className="w-3.5 h-3.5" /> Move to Wishlist
                  </button>
                </div>
              </div>

              {/* Line Price */}
              <div className="hidden sm:block text-right font-semibold text-sm text-charcoal">
                ₹{item.product.price * item.quantity}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="bg-white border border-line rounded-md p-6 space-y-6 sticky top-28">
          <h2 className="text-lg font-serif text-charcoal border-b border-line pb-3">Order Summary</h2>

          {/* Coupon Input */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Coupon code (LAVENDER10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-line rounded uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2 border border-charcoal text-xs font-semibold uppercase rounded hover:bg-charcoal hover:text-white transition-colors"
              >
                Apply
              </button>
            </div>
            {couponMessage && (
              <p className={`text-[11px] font-semibold ${couponMessage.isError ? 'text-rose-700' : 'text-emerald-700'}`}>
                {couponMessage.text}
              </p>
            )}
          </form>

          {/* Pricing Breakdown */}
          <div className="space-y-2.5 text-xs text-charcoal-soft">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-charcoal">₹{cartSubtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-charcoal">
                {shippingCharge === 0 ? <span className="text-emerald-700">FREE</span> : `₹${shippingCharge}`}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-lavender-700 font-semibold">
                <span>Discount</span>
                <span>−₹{discountAmount}</span>
              </div>
            )}
            <div className="pt-3 border-t border-line flex justify-between text-base font-semibold text-charcoal">
              <span>Total</span>
              <span>₹{finalTotal}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="block w-full py-3.5 bg-lavender-700 text-white text-xs font-semibold uppercase tracking-widest rounded text-center hover:bg-lavender-800 transition-colors"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>

      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
        <div className="pt-12 border-t border-line space-y-6">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
              You May Also Like
            </span>
            <h2 className="text-2xl font-serif text-charcoal mt-1">Recommended For You</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recommendedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
