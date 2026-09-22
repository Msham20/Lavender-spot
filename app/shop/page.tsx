'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/lib/store/cart-context';
import { INITIAL_CATEGORIES } from '@/lib/data/mock-seed';
import { Filter, SlidersHorizontal } from 'lucide-react';

function ShopContent() {
  const searchParams = useSearchParams();
  const { products } = useCart();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Parse initial query params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const filterParam = searchParams.get('filter');

    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
    if (filterParam === 'bestseller' || filterParam === 'new') {
      // sort/filter handles this
    }
  }, [searchParams]);

  const searchQuery = searchParams.get('q') || '';
  const filterParam = searchParams.get('filter');

  const skinTypes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.skin_type) set.add(p.skin_type);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category_name?.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Best Seller / New Arrivals parameter
    if (filterParam === 'bestseller') {
      list = list.filter((p) => p.is_bestseller);
    } else if (filterParam === 'new') {
      list = list.filter((p) => p.is_new_arrival);
    }

    // Categories
    if (selectedCategories.length > 0) {
      list = list.filter((p) => p.category_name && selectedCategories.includes(p.category_name));
    }

    // Price Range
    if (selectedPriceRange !== 'all') {
      const [min, max] = selectedPriceRange.split('-').map(Number);
      list = list.filter((p) => p.price >= min && p.price <= max);
    }

    // Skin Types
    if (selectedSkinTypes.length > 0) {
      list = list.filter((p) => selectedSkinTypes.includes(p.skin_type));
    }

    // Rating
    if (minRating > 0) {
      list = list.filter((p) => p.rating >= minRating);
    }

    // Stock
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        list.sort((a, b) => (b.is_new_arrival ? 1 : 0) - (a.is_new_arrival ? 1 : 0));
        break;
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // featured
        list.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
        break;
    }

    return list;
  }, [
    products,
    searchQuery,
    filterParam,
    selectedCategories,
    selectedPriceRange,
    selectedSkinTypes,
    minRating,
    inStockOnly,
    sortBy,
  ]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleSkinType = (type: string) => {
    setSelectedSkinTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRange('all');
    setSelectedSkinTypes([]);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="max-w-[1320px] mx-auto px-5 lg:px-10 py-8">
      {/* Breadcrumb */}
      <div className="text-xs text-charcoal-muted mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-lavender-700">Home</Link>
        <span>/</span>
        <span className="text-charcoal font-medium">Shop</span>
      </div>

      {/* Shop Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-line gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
            All Products
          </span>
          <h1 className="text-3xl font-serif text-charcoal">Shop Lavender Spot</h1>
        </div>
        <span className="text-xs text-charcoal-muted">
          Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-2 text-xs text-charcoal-soft">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-line rounded bg-white text-xs font-semibold"
          >
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
          {selectedCategories.length > 0 && (
            <span className="bg-lavender-100 text-lavender-700 px-2.5 py-1 rounded text-[11px] font-semibold">
              Category: {selectedCategories.join(', ')}
            </span>
          )}
          {searchQuery && (
            <span className="bg-lavender-100 text-lavender-700 px-2.5 py-1 rounded text-[11px] font-semibold">
              Search: &quot;{searchQuery}&quot;
            </span>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <SlidingSortSelect value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Mobile Filter Drawer Overlay */}
        {mobileFilterOpen && (
          <div
            className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setMobileFilterOpen(false)}
          />
        )}

        {/* Sidebar Filters (Desktop + Mobile Drawer) */}
        <aside
          className={`lg:block border border-line rounded-md p-6 bg-white space-y-6 ${
            mobileFilterOpen
              ? 'fixed inset-y-0 left-0 z-50 w-80 shadow-2xl overflow-y-auto block animate-in slide-in-from-left duration-200'
              : 'hidden'
          }`}
        >
          {mobileFilterOpen && (
            <div className="flex justify-between items-center pb-3 border-b border-line lg:hidden">
              <h2 className="font-serif text-lg font-semibold text-charcoal">Filters</h2>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="text-xs font-semibold text-lavender-700 uppercase"
              >
                Done
              </button>
            </div>
          )}

          {/* Category Filter */}
          <div>
            <h3 className="text-[11.5px] uppercase tracking-wider font-semibold text-charcoal mb-3">Category</h3>
            <div className="space-y-2">
              {INITIAL_CATEGORIES.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 text-xs text-charcoal-soft cursor-pointer hover:text-charcoal py-0.5">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.name)}
                    onChange={() => toggleCategory(cat.name)}
                    className="rounded accent-lavender-700 w-4 h-4"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <h3 className="text-[11.5px] uppercase tracking-wider font-semibold text-charcoal mb-3">Price</h3>
            <div className="space-y-2 text-xs text-charcoal-soft">
              <label className="flex items-center gap-2 cursor-pointer py-0.5">
                <input
                  type="radio"
                  name="price"
                  value="all"
                  checked={selectedPriceRange === 'all'}
                  onChange={() => setSelectedPriceRange('all')}
                  className="accent-lavender-700 w-4 h-4"
                />
                <span>All Prices</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer py-0.5">
                <input
                  type="radio"
                  name="price"
                  value="0-600"
                  checked={selectedPriceRange === '0-600'}
                  onChange={() => setSelectedPriceRange('0-600')}
                  className="accent-lavender-700 w-4 h-4"
                />
                <span>Under ₹600</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer py-0.5">
                <input
                  type="radio"
                  name="price"
                  value="600-1000"
                  checked={selectedPriceRange === '600-1000'}
                  onChange={() => setSelectedPriceRange('600-1000')}
                  className="accent-lavender-700 w-4 h-4"
                />
                <span>₹600 – ₹1000</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer py-0.5">
                <input
                  type="radio"
                  name="price"
                  value="1000-9999"
                  checked={selectedPriceRange === '1000-9999'}
                  onChange={() => setSelectedPriceRange('1000-9999')}
                  className="accent-lavender-700 w-4 h-4"
                />
                <span>₹1000+</span>
              </label>
            </div>
          </div>

          {/* Skin Type Filter */}
          <div>
            <h3 className="text-[11.5px] uppercase tracking-wider font-semibold text-charcoal mb-3">Skin Type</h3>
            <div className="space-y-2">
              {skinTypes.map((type) => (
                <label key={type} className="flex items-center gap-2 text-xs text-charcoal-soft cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    checked={selectedSkinTypes.includes(type)}
                    onChange={() => toggleSkinType(type)}
                    className="rounded accent-lavender-700 w-4 h-4"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div>
            <h3 className="text-[11.5px] uppercase tracking-wider font-semibold text-charcoal mb-3">Availability</h3>
            <label className="flex items-center gap-2 text-xs text-charcoal-soft cursor-pointer py-0.5">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded accent-lavender-700 w-4 h-4"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          <button
            onClick={() => {
              clearAllFilters();
              if (mobileFilterOpen) setMobileFilterOpen(false);
            }}
            className="w-full py-2.5 px-4 border border-line text-xs font-semibold text-charcoal rounded hover:bg-charcoal hover:text-white transition-colors"
          >
            Clear All Filters
          </button>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-charcoal-soft space-y-3 bg-white border border-line rounded-md">
              <p className="text-sm font-serif">No products found matching your active filters.</p>
              <button
                onClick={clearAllFilters}
                className="text-xs text-lavender-700 font-semibold hover:underline"
              >
                Clear all filters and show catalog
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SlidingSortSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="py-2 px-3 text-xs border border-line rounded bg-white text-charcoal focus:outline-none focus:border-lavender-700"
    >
      <option value="featured">Sort: Featured</option>
      <option value="newest">Sort: Newest</option>
      <option value="price-asc">Sort: Price Low to High</option>
      <option value="price-desc">Sort: Price High to Low</option>
      <option value="rating">Sort: Highest Rated</option>
    </select>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="max-w-[1320px] mx-auto px-5 py-20 text-center text-xs">Loading products...</div>}>
      <ShopContent />
    </Suspense>
  );
}
