'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/lib/store/cart-context';
import { Star, Heart, ShieldCheck, Truck, RotateCcw, ChevronDown } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { products, addToCart, toggleWishlist, isWishlisted } = useCart();
  const product = products.find((p) => p.slug === slug || p.id === slug);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'desc' | 'ingredients' | 'howto' | 'reviews' | 'faq'>('desc');
  const [pincode, setPincode] = useState<string>('');
  const [pincodeMessage, setPincodeMessage] = useState<string>('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (!product) {
    return (
      <div className="max-w-[1320px] mx-auto px-5 py-24 text-center space-y-4">
        <h1 className="text-2xl font-serif text-charcoal">Product Not Found</h1>
        <p className="text-xs text-charcoal-soft">The product you are looking for does not exist or has been removed.</p>
        <Link href="/shop" className="inline-block px-6 py-3 bg-charcoal text-white text-xs font-semibold uppercase rounded">
          Back to Shop
        </Link>
      </div>
    );
  }

  const wished = isWishlisted(product.id);
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['One Size'];
  const currentSize = selectedSize || sizes[0];

  const discountPercent =
    product.discount_price && product.discount_price > product.price
      ? Math.round((1 - product.price / product.discount_price) * 100)
      : 0;

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pincode.trim())) {
      setPincodeMessage(`Delivering to ${pincode.trim()}: Estimated delivery in 2–4 business days`);
    } else {
      setPincodeMessage('Please enter a valid 6-digit pincode');
    }
  };

  const handleBuyNow = () => {
    addToCart(product.id, currentSize, quantity);
    router.push('/checkout');
  };

  const relatedProducts = products
    .filter((p) => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 5);

  return (
    <div className="max-w-[1320px] mx-auto px-5 lg:px-10 py-8 pb-24 lg:pb-8 space-y-16">
      {/* Breadcrumb */}
      <div className="text-xs text-charcoal-muted flex items-center gap-1.5">
        <Link href="/" className="hover:text-lavender-700">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-lavender-700">Shop</Link>
        <span>/</span>
        <span className="text-charcoal font-medium truncate">{product.name}</span>
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Gallery */}
        <div className="space-y-4">
          {(() => {
            const gallery = product.images && product.images.length > 0
              ? product.images.map(i => i.image_url)
              : [product.primary_image || 'linear-gradient(135deg, #F3EAF8, #7E60BF)'];
            const activeImg = gallery[activeImageIndex] || gallery[0];
            const isImage = activeImg && (activeImg.startsWith('http') || activeImg.startsWith('data:'));

            return (
              <>
                <div className="aspect-square rounded-md overflow-hidden bg-beige flex items-center justify-center font-serif text-6xl text-white shadow-sm select-none relative">
                  {isImage ? (
                    <img src={activeImg} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: activeImg }}>
                      {product.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 overflow-x-auto pb-1">
                  {gallery.map((imgUrl, idx) => {
                    const isThumbImg = imgUrl && (imgUrl.startsWith('http') || imgUrl.startsWith('data:'));
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-16 rounded overflow-hidden border-2 transition-all flex-shrink-0 flex items-center justify-center font-serif text-sm text-white ${
                          activeImageIndex === idx ? 'border-lavender-700 opacity-100 ring-2 ring-lavender-400' : 'border-transparent opacity-60'
                        }`}
                      >
                        {isThumbImg ? (
                          <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs" style={{ background: imgUrl }}>
                            {product.name.charAt(0)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
              {product.category_name}
            </span>
            <h1 className="text-3xl font-serif text-charcoal mt-1">{product.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 text-xs text-charcoal-soft">
            <div className="flex text-lavender-700">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.round(product.rating) ? 'fill-lavender-700 stroke-lavender-700' : 'text-line fill-none'
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold">{product.rating}</span>
            <span className="text-charcoal-muted">· {product.review_count} reviews</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 text-2xl font-semibold text-charcoal">
            <span>₹{product.price}</span>
            {product.discount_price && product.discount_price > product.price && (
              <>
                <span className="text-base text-charcoal-muted line-through font-normal">
                  ₹{product.discount_price}
                </span>
                <span className="text-xs text-lavender-700 font-semibold">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          <p className="text-xs sm:text-sm text-charcoal-soft leading-relaxed">{product.description}</p>

          {/* Benefits */}
          {product.benefits && product.benefits.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {product.benefits.map((benefit) => (
                <span
                  key={benefit}
                  className="bg-lavender-100 text-lavender-800 text-[11px] font-semibold px-3 py-1 rounded-full"
                >
                  {benefit}
                </span>
              ))}
            </div>
          )}

          {/* Sizes */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-charcoal-soft uppercase tracking-wider block">Size</label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-4 py-2 border rounded text-xs transition-colors ${
                    currentSize === sz
                      ? 'border-charcoal bg-charcoal text-white font-semibold'
                      : 'border-line bg-white text-charcoal hover:border-charcoal'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-charcoal-soft uppercase tracking-wider block">Quantity</label>
            <div className="inline-flex items-center border border-line rounded bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-charcoal font-semibold text-sm hover:bg-beige"
              >
                −
              </button>
              <span className="w-10 text-center text-xs font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center text-charcoal font-semibold text-sm hover:bg-beige"
              >
                +
              </button>
            </div>
          </div>

          {/* Stock Notice */}
          <div>
            {product.stock > 0 ? (
              product.stock < 15 ? (
                <span className="text-xs font-semibold text-lavender-700">Only {product.stock} units left in stock!</span>
              ) : (
                <span className="text-xs font-semibold text-emerald-700">In Stock</span>
              )
            ) : (
              <span className="text-xs font-semibold text-rose-700">Out of Stock</span>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => addToCart(product.id, currentSize, quantity)}
              disabled={product.stock === 0}
              className="flex-1 min-w-[140px] py-3.5 border border-charcoal text-charcoal text-xs font-semibold uppercase tracking-widest rounded hover:bg-charcoal hover:text-white transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 min-w-[140px] py-3.5 bg-lavender-700 text-white text-xs font-semibold uppercase tracking-widest rounded hover:bg-lavender-800 transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className="w-12 h-12 border border-line rounded flex items-center justify-center text-charcoal hover:border-lavender-700 transition-colors"
            >
              <Heart className={`w-4 h-4 ${wished ? 'fill-lavender-700 stroke-lavender-700 text-lavender-700' : ''}`} />
            </button>
          </div>

          {/* Pincode Delivery Tool */}
          <div className="pt-4 border-t border-line space-y-2">
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit pincode"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-line rounded bg-white"
              />
              <button type="submit" className="px-4 py-2 border border-line text-xs font-semibold rounded hover:bg-beige">
                Check
              </button>
            </form>
            {pincodeMessage && <p className="text-[11.5px] text-lavender-700 font-medium">{pincodeMessage}</p>}
          </div>

          {/* Trust Row */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-line text-center">
            <div className="flex flex-col items-center gap-1 text-[11px] text-charcoal-soft">
              <ShieldCheck className="w-4 h-4 text-lavender-700" />
              <span>Secure Payment</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-[11px] text-charcoal-soft">
              <Truck className="w-4 h-4 text-lavender-700" />
              <span>Free Shipping ₹999+</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-[11px] text-charcoal-soft">
              <RotateCcw className="w-4 h-4 text-lavender-700" />
              <span>15-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Information Tabs */}
      <div className="space-y-6 pt-8 border-t border-line">
        <div className="flex gap-8 border-b border-line overflow-x-auto text-xs font-semibold text-charcoal-soft">
          {[
            { key: 'desc', label: 'Description' },
            { key: 'ingredients', label: 'Ingredients' },
            { key: 'howto', label: 'How To Use' },
            { key: 'reviews', label: `Reviews (${product.review_count})` },
            { key: 'faq', label: 'FAQs' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3 whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-lavender-700 text-charcoal font-bold'
                  : 'border-transparent text-charcoal-soft hover:text-charcoal'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="text-xs sm:text-sm text-charcoal-soft leading-relaxed max-w-3xl">
          {activeTab === 'desc' && <p>{product.description}</p>}

          {activeTab === 'ingredients' && (
            <ul className="list-disc pl-5 space-y-1">
              {product.ingredients?.map((ing) => (
                <li key={ing}>{ing}</li>
              ))}
            </ul>
          )}

          {activeTab === 'howto' && (
            <p>
              Apply a small amount to clean, dry skin morning and night. Massage gently in upward circular motions until fully absorbed. Follow with moisturizer and sunscreen during daytime.
            </p>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="bg-white p-5 border border-line rounded space-y-2">
                <div className="flex text-lavender-700 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-lavender-700" />
                  ))}
                </div>
                <p className="italic">&quot;Exactly what my skin routine was missing! Replenishes moisture instantly.&quot;</p>
                <span className="text-[11px] text-charcoal font-semibold block">— Verified Lavender Spot Customer</span>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-3">
              {[
                { q: 'Is this formula suitable for sensitive skin?', a: 'Yes, all Lavender Spot products are dermatologically tested and free from parabens and harsh sulphates. We recommend doing a 24-hour patch test.' },
                { q: 'How long does one bottle typically last?', a: 'With daily morning and night application, one bottle lasts approximately 6 to 8 weeks.' },
                { q: 'What is the return policy?', a: 'We accept returns on unused and unopened products within 15 days of delivery.' },
              ].map((faq, i) => (
                <div key={i} className="border-b border-line pb-3">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center text-xs font-semibold text-charcoal text-left py-1"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && <p className="text-xs text-charcoal-soft mt-2">{faq.a}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-line">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
              You May Also Like
            </span>
            <h2 className="text-2xl font-serif text-charcoal mt-1">Related Products</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedProducts.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Add to Cart Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-line p-4 z-40 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-xs text-charcoal-muted block">Total</span>
          <span className="text-base font-semibold text-charcoal">₹{product.price}</span>
        </div>
        <button
          onClick={() => addToCart(product.id, currentSize, quantity)}
          disabled={product.stock === 0}
          className="px-6 py-2.5 bg-lavender-700 text-white text-xs font-semibold uppercase tracking-wider rounded disabled:opacity-40"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
