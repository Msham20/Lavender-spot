'use client';

import React, { useState } from 'react';
import { INITIAL_CATEGORIES } from '@/lib/data/mock-seed';
import { useCart } from '@/lib/store/cart-context';
import { Plus, Edit2, Trash2, FolderTree } from 'lucide-react';

export default function AdminCategoriesPage() {
  const { products, showToast } = useCart();
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [newCatName, setNewCatName] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat = {
      id: 'cat-' + Date.now(),
      name: newCatName.trim(),
      slug: newCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      image_url: '/categories/default.jpg',
    };

    setCategories([...categories, newCat]);
    showToast(`Category "${newCatName}" added.`);
    setNewCatName('');
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      setCategories(categories.filter((c) => c.id !== id));
      showToast(`Category "${name}" deleted.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-line pb-4 flex justify-between items-end">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
            Taxonomy Management
          </span>
          <h1 className="text-3xl font-serif text-charcoal mt-1">Categories ({categories.length})</h1>
        </div>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAddCategory} className="flex gap-3 max-w-md bg-white p-4 border border-line rounded-md">
        <input
          type="text"
          placeholder="New Category Name (e.g. Body Scrubs)"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          className="flex-1 px-3 py-2 text-xs border border-line rounded bg-white"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-lavender-700 text-white text-xs font-semibold uppercase rounded hover:bg-lavender-800 transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </form>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const productCount = products.filter((p) => p.category_name === cat.name).length;
          return (
            <div key={cat.id} className="bg-white border border-line rounded-md p-5 flex justify-between items-center shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-lavender-700" />
                  <h3 className="font-serif text-base font-semibold text-charcoal">{cat.name}</h3>
                </div>
                <p className="text-xs text-charcoal-muted">{productCount} active products</p>
              </div>

              <button
                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                className="p-2 text-rose-700 hover:bg-rose-50 rounded border border-line"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
