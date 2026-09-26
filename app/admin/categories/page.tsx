'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/lib/store/cart-context';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, FolderTree } from 'lucide-react';

export default function AdminCategoriesPage() {
  const { products, showToast } = useCart();
  const [categories, setCategories] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('categories').select('*').order('name');

        if (error) {
          console.error('Failed to load categories:', error);
          return;
        }

        setCategories(data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const supabase = createClient();
      const categoryName = newCatName.trim();
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: categoryName, slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-') }])
        .select()
        .single();

      if (error) throw error;

      setCategories((prev) => [...prev, data]);
      showToast(`Category "${categoryName}" added.`);
      setNewCatName('');
    } catch (error: any) {
      console.error('Failed to add category:', error);
      showToast(error?.message || 'Categorie could not be added.');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('categories').delete().eq('id', id);

        if (error) throw error;

        setCategories((prev) => prev.filter((c) => c.id !== id));
        showToast(`Category "${name}" deleted.`);
      } catch (error: any) {
        console.error('Failed to delete category:', error);
        showToast(error?.message || 'Category could not be deleted.');
      }
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
