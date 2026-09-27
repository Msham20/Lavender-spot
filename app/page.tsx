'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/lib/store/cart-context';
import { Heart, ShieldCheck, Sparkles, Truck, Star } from 'lucide-react';

export default function HomePage() {
  const { products, showToast } = useCart();
  const [email, setEmail] = useState('');

  const categoryCards = useMemo(
    () => [
      {
        name: 'General',
        href: '/shop',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Skincare',
        href: '/shop?category=Skincare',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Face',
        href: '/shop?category=Face',
        image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Hair Care',
        href: '/shop?category=Hair%20Care',
        image: 'https://images.unsplash.com/photo-1521590832167-7ae3c3d9d5f6?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Body Care',
        href: '/shop?category=Body%20Care',
        image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Lips',
        href: '/shop?category=Lips',
        image: 'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=900&q=80',
      },
    ],
    []
  );

  const bestSellers = products.filter((p) => p.is_bestseller).slice(0, 5);
  const newArrivals = products.filter((p) => p.is_new_arrival).slice(0, 5);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      showToast('Thanks for subscribing! Use code LAVENDER10 for 10% off.');
      setEmail('');
    }
  };

  return (
    <div className="space-y-16 lg:space-y-24">
      {/* Hero Section */}
      <section className="relative w-full bg-beige grid grid-cols-1 lg:grid-cols-2 items-center overflow-hidden">
        <div className="flex flex-col justify-center px-5 sm:px-12 lg:px-20 py-10 sm:py-16 space-y-4 sm:space-y-6 z-10 max-w-xl">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
            The Everyday Ritual
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif leading-[1.1] text-charcoal">
            Beauty That<br />Feels Like You
          </h1>
          <p className="text-xs sm:text-base text-charcoal-soft leading-relaxed">
            Discover thoughtfully crafted skincare and beauty essentials made to elevate your everyday routine.
          </p>
          <div className="flex flex-wrap gap-3 pt-1 sm:pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 bg-charcoal text-ivory text-xs font-semibold uppercase tracking-widest rounded-md hover:bg-lavender-700 transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/shop?filter=bestseller"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 border border-charcoal text-charcoal text-xs font-semibold uppercase tracking-widest rounded-md hover:bg-charcoal hover:text-ivory transition-colors"
            >
              Explore Best Sellers
            </Link>
          </div>
        </div>

        {/* Hero Right Visual Box */}
        <div className="relative h-60 sm:h-96 lg:h-full w-full overflow-hidden py-10 lg:py-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(110, 88, 145, 0.58), rgba(74, 58, 93, 0.72)), url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-lavender-200/30 via-transparent to-lavender-900/40" />
          <div className="relative z-10 flex h-full items-center justify-center">
            <span className="font-serif text-4xl sm:text-7xl text-white/90 select-none tracking-widest drop-shadow-sm">
              Lavender Spot
            </span>
          </div>
          <div className="hidden sm:flex absolute bottom-12 left-12 bg-white/90 backdrop-blur-sm px-5 py-3.5 rounded-md shadow-xl gap-3 items-center max-w-xs z-10">
            <div className="w-8 h-8 rounded-full bg-lavender-100 flex items-center justify-center text-lavender-700 font-serif font-bold text-sm">
              ★
            </div>
            <span className="text-xs text-charcoal-soft leading-tight">
              Loved by 40,000+ beauty lovers across India
            </span>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-[1320px] mx-auto px-5 lg:px-10">
        <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-12 xl:items-start">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
              Shop by Category
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-charcoal mt-1">
              Find Your Ritual
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-soft max-w-xl xl:justify-self-end xl:pt-3">
            Curated edits across skin, hair and body — built around what your routine actually needs.
          </p>
        </div>

        <div className="mt-8 xl:mt-10">
          {categoryCards.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory xl:overflow-visible xl:grid xl:grid-cols-1 xl:gap-6 xl:max-w-[300px]">
              {categoryCards.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="group relative block aspect-[10/12] rounded-md overflow-hidden bg-[#4c425a] shadow-sm shrink-0 snap-start w-[250px] sm:w-[270px] xl:w-full"
                >
                  <div
                    className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03] bg-cover bg-center"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(74, 61, 92, 0.14), rgba(51, 40, 63, 0.43)), url('${category.image}')`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#6c5f7d]/10 via-transparent to-[#2c2132]/20 z-10" />
                  <span className="absolute bottom-5 left-0 right-0 text-center text-white font-serif text-[1.05rem] sm:text-[1.2rem] z-20 group-hover:translate-y-[-2px] transition-transform">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-xs text-charcoal-muted py-8">Add products to populate the catalog.</div>
          )}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bg-white py-16">
        <div className="max-w-[1320px] mx-auto px-5 lg:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-9 gap-4">
            <div>
              <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
                Customer Favorites
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-charcoal mt-1">Best Sellers</h2>
            </div>
            <Link href="/shop?filter=bestseller" className="text-xs font-semibold text-lavender-700 hover:underline">
              View All Best Sellers →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-5">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Skin First Promo Banner */}
      <section className="max-w-[1320px] mx-auto px-5 lg:px-10">
        <div className="relative min-h-[380px] rounded-md overflow-hidden flex items-center p-8 sm:p-16 text-white shadow-lg">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(107,83,140,0.82), rgba(41,29,54,0.75)), url('https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80')",
            }}
          />
          <div className="relative z-10 max-w-lg space-y-4">
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-200">
              Skin First
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif leading-tight">Your Skin Deserves Better</h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Simple, effective beauty essentials designed for your everyday routine. Formulation backed by dermatological precision.
            </p>
            <div className="pt-2">
              <Link
                href="/shop?category=Skincare"
                className="inline-flex items-center justify-center px-8 py-3.5 border border-white/60 text-white text-xs font-semibold uppercase tracking-widest rounded-md hover:bg-white hover:text-charcoal transition-colors"
              >
                Shop Skincare
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="bg-white py-16">
        <div className="max-w-[1320px] mx-auto px-5 lg:px-10">
          <div className="flex justify-between items-end mb-9">
            <div>
              <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
                Just Launched
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-charcoal mt-1">New Arrivals</h2>
            </div>
            <Link href="/shop?filter=new" className="text-xs font-semibold text-lavender-700 hover:underline">
              Explore All New →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-5">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-[1320px] mx-auto px-5 lg:px-10">
        <div className="text-center mb-10">
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
            Why Lavender Spot
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-charcoal mt-1">Why Choose Us</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line rounded-md overflow-hidden">
          <div className="bg-ivory p-8 text-center flex flex-col items-center">
            <div className="w-11 h-11 rounded-full border border-lavender-700 text-lavender-700 flex items-center justify-center mb-4">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold mb-2 text-charcoal">Cruelty Free</h3>
            <p className="text-xs text-charcoal-soft leading-relaxed">Never tested on animals, always kind to your skin.</p>
          </div>

          <div className="bg-ivory p-8 text-center flex flex-col items-center">
            <div className="w-11 h-11 rounded-full border border-lavender-700 text-lavender-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold mb-2 text-charcoal">Dermatologically Tested</h3>
            <p className="text-xs text-charcoal-soft leading-relaxed">Every formula clinically verified for skin safety.</p>
          </div>

          <div className="bg-ivory p-8 text-center flex flex-col items-center">
            <div className="w-11 h-11 rounded-full border border-lavender-700 text-lavender-700 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold mb-2 text-charcoal">Clean Ingredients</h3>
            <p className="text-xs text-charcoal-soft leading-relaxed">No parabens, sulphates or mineral oils, ever.</p>
          </div>

          <div className="bg-ivory p-8 text-center flex flex-col items-center">
            <div className="w-11 h-11 rounded-full border border-lavender-700 text-lavender-700 flex items-center justify-center mb-4">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold mb-2 text-charcoal">Secure & Fast Delivery</h3>
            <p className="text-xs text-charcoal-soft leading-relaxed">Encrypted checkout, delivered to your doorstep in 2–4 days.</p>
          </div>
        </div>
      </section>

      {/* Brand Story / Philosophy */}
      <section className="bg-white py-16">
        <div className="max-w-[1320px] mx-auto px-5 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-80 sm:h-96 rounded-md overflow-hidden flex items-center justify-center font-serif text-3xl shadow-sm">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(236,223,244,0.65), rgba(142,122,181,0.8)), url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80')",
              }}
            />
            <span className="relative z-10 text-white drop-shadow-sm">Lavender Spot Philosophy</span>
          </div>

          <div className="space-y-5">
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
              Our Philosophy
            </span>
            <h2 className="text-3xl font-serif text-charcoal leading-tight">
              Beauty, Backed by Better Ingredients
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-soft leading-relaxed">
              Every Lavender Spot formula begins with a single question: does this ingredient earn its place? We work with dermatologists and formulation chemists to keep every product simple, effective and honest.
            </p>
            <p className="text-xs sm:text-sm text-charcoal-soft leading-relaxed">
              No filler, no unnecessary fragrance load, no shortcuts — just concentrated actives at clinically-proven percentages.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-7 py-3 border border-charcoal text-charcoal text-xs font-semibold uppercase tracking-widest rounded-md hover:bg-charcoal hover:text-ivory transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-[1320px] mx-auto px-5 lg:px-10">
        <div className="bg-charcoal text-ivory rounded-md py-16 px-6 sm:px-12 text-center space-y-4">
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-300">
            Join The List
          </span>
          <h2 className="text-3xl font-serif text-white">Get 10% Off Your First Order</h2>
          <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
            Join our beauty community for exclusive offers, new launches and skincare tips.
          </p>
          <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row max-w-md mx-auto pt-2 gap-2 sm:gap-0 rounded-md overflow-hidden">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 text-xs text-charcoal bg-white border-0 focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-lavender-700 hover:bg-lavender-800 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Get 10% Off
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
