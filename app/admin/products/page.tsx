'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/store/cart-context';
import { Product } from '@/types/database';
import { INITIAL_CATEGORIES } from '@/lib/data/mock-seed';
import { Plus, Edit2, Trash2, X, Search, CheckCircle, Upload, Image as ImageIcon, Star } from 'lucide-react';

export default function AdminProductsPage() {
  const { products, showToast } = useCart();

  const [productList, setProductList] = useState<Product[]>(products);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category_name: 'Skincare',
    skin_type: 'All Skin Types',
    stock: '',
    status: 'active',
    imageUrlInput: '',
  });

  const [productImages, setProductImages] = useState<string[]>([]);
  const [primaryImage, setPrimaryImage] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const url = event.target.result as string;
          setProductImages((prev) => {
            const next = [...prev, url];
            if (!primaryImage || primaryImage.startsWith('linear-gradient')) {
              setPrimaryImage(url);
            }
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrlInput.trim()) return;
    const url = formData.imageUrlInput.trim();
    setProductImages((prev) => {
      const next = [...prev, url];
      if (!primaryImage || primaryImage.startsWith('linear-gradient')) {
        setPrimaryImage(url);
      }
      return next;
    });
    setFormData({ ...formData, imageUrlInput: '' });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const target = productImages[indexToRemove];
    const updated = productImages.filter((_, idx) => idx !== indexToRemove);
    setProductImages(updated);
    if (primaryImage === target) {
      setPrimaryImage(updated[0] || 'linear-gradient(135deg, #F3EAF8, #7E60BF)');
    }
  };

  const filteredProducts = productList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      discount_price: '',
      category_name: 'Skincare',
      skin_type: 'All Skin Types',
      stock: '20',
      status: 'active',
      imageUrlInput: '',
    });
    setProductImages([]);
    setPrimaryImage('linear-gradient(135deg, #F3EAF8, #7E60BF)');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      discount_price: p.discount_price ? p.discount_price.toString() : '',
      category_name: p.category_name || 'Skincare',
      skin_type: p.skin_type || 'All Skin Types',
      stock: p.stock.toString(),
      status: p.status,
      imageUrlInput: '',
    });
    const imgs = p.images ? p.images.map((i) => i.image_url) : p.primary_image ? [p.primary_image] : [];
    setProductImages(imgs);
    setPrimaryImage(p.primary_image || imgs[0] || 'linear-gradient(135deg, #F3EAF8, #7E60BF)');
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      setProductList((prev) => prev.filter((p) => p.id !== id));
      showToast(`Product "${name}" deleted.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.stock) {
      alert('Please fill in required fields');
      return;
    }

    const finalPrimaryImage = primaryImage || productImages[0] || 'linear-gradient(135deg, #F3EAF8, #7E60BF)';
    const finalImagesObj = productImages.map((img, i) => ({
      id: `img-${i}-${Date.now()}`,
      product_id: editingProduct ? editingProduct.id : '',
      image_url: img,
      is_primary: img === finalPrimaryImage,
      display_order: i,
    }));

    if (editingProduct) {
      // Update
      const updated = productList.map((p) => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: formData.name,
            slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: formData.description,
            price: parseFloat(formData.price),
            discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
            category_name: formData.category_name,
            skin_type: formData.skin_type,
            stock: parseInt(formData.stock, 10),
            status: formData.status as 'active' | 'draft',
            primary_image: finalPrimaryImage,
            images: finalImagesObj,
          };
        }
        return p;
      });
      setProductList(updated);
      showToast(`Product "${formData.name}" updated successfully.`);
    } else {
      // Create
      const newProd: Product = {
        id: 'prod-' + Date.now(),
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        category_name: formData.category_name,
        skin_type: formData.skin_type,
        stock: parseInt(formData.stock, 10),
        status: formData.status as 'active' | 'draft',
        rating: 4.8,
        review_count: 1,
        is_bestseller: false,
        is_new_arrival: true,
        primary_image: finalPrimaryImage,
        images: finalImagesObj,
      };
      setProductList([newProd, ...productList]);
      showToast(`New Product "${formData.name}" created!`);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-line pb-4 flex justify-between items-end flex-wrap gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
            Catalog Management
          </span>
          <h1 className="text-3xl font-serif text-charcoal mt-1">Products ({productList.length})</h1>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-lavender-700 text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-lavender-800 transition-colors flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filter Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
        <input
          type="text"
          placeholder="Search products by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs border border-line rounded bg-white"
        />
      </div>

      {/* Product Table */}
      <div className="bg-white border border-line rounded-md overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-ivory border-b border-line text-charcoal-soft font-semibold">
              <th className="p-3.5">Product</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Price</th>
              <th className="p-3.5">Discount Price</th>
              <th className="p-3.5">Stock</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-lavender-50/50 transition-colors">
                <td className="p-3.5 font-serif font-medium text-charcoal">
                  <div className="flex items-center gap-3">
                    {p.primary_image && (p.primary_image.startsWith('http') || p.primary_image.startsWith('data:')) ? (
                      <img
                        src={p.primary_image}
                        alt={p.name}
                        className="w-8 h-8 rounded object-cover flex-shrink-0 border border-line"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-white text-xs font-serif"
                        style={{ background: p.primary_image || 'linear-gradient(135deg, #F3EAF8, #7E60BF)' }}
                      >
                        {p.name.charAt(0)}
                      </div>
                    )}
                    <span>{p.name}</span>
                  </div>
                </td>
                <td className="p-3.5 text-charcoal-soft">{p.category_name}</td>
                <td className="p-3.5 font-semibold text-charcoal">₹{p.price}</td>
                <td className="p-3.5 text-charcoal-muted">
                  {p.discount_price ? `₹${p.discount_price}` : '—'}
                </td>
                <td className="p-3.5">
                  <span className={`px-2 py-0.5 rounded font-semibold text-[10.5px] ${
                    p.stock === 0 ? 'bg-rose-100 text-rose-700' : p.stock < 15 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {p.stock} units
                  </span>
                </td>
                <td className="p-3.5">
                  <span className="capitalize px-2 py-0.5 rounded bg-lavender-100 text-lavender-800 text-[10.5px] font-semibold">
                    {p.status}
                  </span>
                </td>
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-1.5 border border-line rounded text-charcoal hover:bg-beige"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      className="p-1.5 border border-line rounded text-rose-700 hover:bg-rose-50"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-line rounded-md max-w-xl w-full p-6 space-y-6 shadow-2xl relative my-8">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <h2 className="text-xl font-serif text-charcoal">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-charcoal-muted hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-charcoal-soft block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Lavender Botanical Serum"
                  className="w-full px-3 py-2 border border-line rounded bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal-soft block mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Formulation details, ingredients and benefits..."
                  className="w-full px-3 py-2 border border-line rounded bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-charcoal-soft block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="899"
                    className="w-full px-3 py-2 border border-line rounded bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal-soft block mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                    placeholder="1199"
                    className="w-full px-3 py-2 border border-line rounded bg-white"
                  />
                </div>
              </div>

              {/* Product Images Section */}
              <div className="border border-line rounded-md p-4 bg-ivory/50 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-charcoal flex items-center gap-1.5 text-xs">
                    <ImageIcon className="w-4 h-4 text-lavender-700" /> Product Images
                  </label>
                  <span className="text-[10px] text-charcoal-muted">
                    {productImages.length} image{productImages.length !== 1 ? 's' : ''} added
                  </span>
                </div>

                {/* Upload File Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="border-2 border-dashed border-lavender-300 hover:border-lavender-700 bg-white p-3 rounded-md text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1">
                    <Upload className="w-5 h-5 text-lavender-700" />
                    <span className="font-semibold text-charcoal text-[11px]">Upload Local Images</span>
                    <span className="text-[10px] text-charcoal-muted">PNG, JPG, WEBP, GIF</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Add URL Box */}
                  <div className="bg-white p-3 border border-line rounded-md flex flex-col justify-between space-y-2">
                    <span className="font-semibold text-charcoal text-[11px]">Or Add Image URL</span>
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        placeholder="https://..."
                        value={formData.imageUrlInput}
                        onChange={(e) => setFormData({ ...formData, imageUrlInput: e.target.value })}
                        className="flex-1 px-2 py-1.5 text-[11px] border border-line rounded"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-3 py-1.5 bg-charcoal text-white text-[10.5px] font-semibold rounded hover:bg-lavender-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image Previews Grid */}
                {productImages.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10.5px] font-semibold text-charcoal-soft block">
                      Uploaded Gallery (Click star to set Primary Image):
                    </span>
                    <div className="grid grid-cols-4 gap-2.5">
                      {productImages.map((imgUrl, idx) => {
                        const isPrimary = primaryImage === imgUrl;
                        const isGradient = imgUrl.startsWith('linear-gradient');
                        return (
                          <div
                            key={idx}
                            className={`relative aspect-square rounded border-2 overflow-hidden group shadow-xs ${
                              isPrimary ? 'border-lavender-700 ring-2 ring-lavender-400' : 'border-line'
                            }`}
                          >
                            {isGradient ? (
                              <div className="w-full h-full" style={{ background: imgUrl }} />
                            ) : (
                              <img src={imgUrl} alt="Product image" className="w-full h-full object-cover" />
                            )}

                            {isPrimary && (
                              <span className="absolute top-1 left-1 bg-lavender-700 text-white text-[8.5px] font-semibold px-1 py-0.5 rounded shadow">
                                Primary
                              </span>
                            )}

                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(imgUrl)}
                                className={`p-1 rounded text-white ${isPrimary ? 'bg-amber-500' : 'bg-charcoal/80 hover:bg-amber-500'}`}
                                title="Set as primary image"
                              >
                                <Star className="w-3.5 h-3.5 fill-current" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="p-1 rounded bg-rose-700 text-white hover:bg-rose-800"
                                title="Remove image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-charcoal-soft block mb-1">Category *</label>
                  <select
                    value={formData.category_name}
                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                    className="w-full px-3 py-2 border border-line rounded bg-white"
                  >
                    {INITIAL_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-charcoal-soft block mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-line rounded bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-charcoal-soft block mb-1">Skin Type Compatibility</label>
                <input
                  type="text"
                  value={formData.skin_type}
                  onChange={(e) => setFormData({ ...formData, skin_type: e.target.value })}
                  placeholder="All Skin Types / Dry to Normal"
                  className="w-full px-3 py-2 border border-line rounded bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-line text-xs font-semibold rounded hover:bg-beige"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-lavender-700 text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-lavender-800"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
