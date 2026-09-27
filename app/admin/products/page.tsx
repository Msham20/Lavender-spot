'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/lib/store/cart-context';
import { Product } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit2, Trash2, X, Search, CheckCircle, Upload, Image as ImageIcon, Star } from 'lucide-react';

export default function AdminProductsPage() {
  const { products, showToast, refreshProducts } = useCart();

  const [productList, setProductList] = useState<Product[]>(products);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ingredients: '',
    how_to_use: '',
    price: '',
    discount_price: '',
    category_name: 'Skincare',
    skin_type: 'All Skin Types',
    stock: '',
    status: 'active',
    is_bestseller: false,
    is_new_arrival: true,
    imageUrlInput: '',
  });

  const [productImages, setProductImages] = useState<string[]>([]);
  const [primaryImage, setPrimaryImage] = useState<string>('');

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const supabase = createClient();

    for (const file of Array.from(files)) {
      try {
        const fileExt = file.name.split('.').pop() || 'png';
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { data, error } = await supabase.storage.from('product-images').upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

        if (error) {
          throw error;
        }

        const publicUrl = supabase.storage.from('product-images').getPublicUrl(data.path).data.publicUrl;

        setProductImages((prev) => {
          const next = [...prev, publicUrl];
          if (!primaryImage || primaryImage.startsWith('linear-gradient')) {
            setPrimaryImage(publicUrl);
          }
          return next;
        });
      } catch (error: any) {
        console.error('Image upload failed:', error);
        showToast(error?.message || 'Image upload failed. Please check Supabase storage permissions.');
      }
    }

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

  useEffect(() => {
    const loadProductsFromDatabase = async () => {
      try {
        const supabase = createClient();
        const { data: productRows, error: productError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (productError) {
          console.error('Failed to load products from database:', productError);
          return;
        }

        if (!productRows || productRows.length === 0) {
          setProductList(products);
          return;
        }

        const { data: imageRows } = await supabase.from('product_images').select('*');
        const imageMap = new Map<string, string[]>();

        (imageRows || []).forEach((image) => {
          const current = imageMap.get(image.product_id) || [];
          current.push(image.image_url);
          imageMap.set(image.product_id, current);
        });

        const mappedProducts: Product[] = productRows.map((product) => {
          const productImagesForDb = imageMap.get(product.id) || [];
          const primaryImageUrl = productImagesForDb[0] || product.primary_image || 'linear-gradient(135deg, #F3EAF8, #7E60BF)';

          return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description || '',
            price: Number(product.price),
            discount_price: product.discount_price ? Number(product.discount_price) : null,
            category_id: product.category_id,
            category_name: product.category_id ? (categories.find((cat) => cat.id === product.category_id)?.name || 'General') : 'General',
            skin_type: product.skin_type || 'All Skin Types',
            stock: Number(product.stock || 0),
            status: product.status || 'active',
            is_bestseller: Boolean(product.is_bestseller),
            is_new_arrival: Boolean(product.is_new_arrival),
            rating: Number(product.rating || 4.8),
            review_count: Number(product.review_count || 0),
            primary_image: primaryImageUrl,
            images: productImagesForDb.map((imageUrl, index) => ({
              id: `${product.id}-img-${index}`,
              product_id: product.id,
              image_url: imageUrl,
              is_primary: imageUrl === primaryImageUrl,
              display_order: index,
            })),
          };
        });

        setProductList(mappedProducts);
      } catch (error) {
        console.error('Error loading products from Supabase:', error);
      }
    };

    loadProductsFromDatabase();
  }, [products]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      ingredients: '',
      how_to_use: '',
      price: '',
      discount_price: '',
      category_name: categories[0]?.name || '',
      skin_type: 'All Skin Types',
      stock: '20',
      status: 'active',
      is_bestseller: false,
      is_new_arrival: true,
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
      ingredients: (p.ingredients || []).join('\n'),
      how_to_use: p.how_to_use || '',
      price: p.price.toString(),
      discount_price: p.discount_price ? p.discount_price.toString() : '',
      category_name: p.category_name || categories[0]?.name || '',
      skin_type: p.skin_type || 'All Skin Types',
      stock: p.stock.toString(),
      status: p.status,
      is_bestseller: Boolean(p.is_bestseller),
      is_new_arrival: Boolean(p.is_new_arrival),
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

  const supportsHowToUseColumn = async (supabase: ReturnType<typeof createClient>) => {
    try {
      const { error } = await supabase.from('products').select('how_to_use').limit(1);
      return !error;
    } catch (error: any) {
      const message = String(error?.message || '').toLowerCase();
      if (message.includes('how_to_use') && message.includes('does not exist')) {
        return false;
      }
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.stock) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const supabase = createClient();
      const finalPrimaryImage = primaryImage || productImages[0] || 'linear-gradient(135deg, #F3EAF8, #7E60BF)';
      const selectedCategory = categories.find((category) => category.name === formData.category_name);
      const hasHowToUseColumn = await supportsHowToUseColumn(supabase);

      const ingredientsList = formData.ingredients
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);

      const productPayload: Record<string, any> = {
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description,
        ingredients: ingredientsList,
        price: Number(formData.price),
        discount_price: formData.discount_price ? Number(formData.discount_price) : null,
        category_id: selectedCategory?.id || null,
        skin_type: formData.skin_type,
        stock: Number(formData.stock),
        status: formData.status,
        is_bestseller: Boolean(formData.is_bestseller),
        is_new_arrival: Boolean(formData.is_new_arrival),
        rating: editingProduct?.rating ?? 4.8,
        review_count: editingProduct?.review_count ?? 1,
      };

      if (hasHowToUseColumn) {
        productPayload.how_to_use = formData.how_to_use.trim();
      }

      let savedProductId = editingProduct?.id;

      if (editingProduct) {
        const { error } = await supabase.from('products').update(productPayload).eq('id', editingProduct.id);
        if (error) throw error;

        await supabase.from('product_images').delete().eq('product_id', editingProduct.id);
      } else {
        const { data, error } = await supabase.from('products').insert([productPayload]).select().single();
        if (error) throw error;
        savedProductId = data.id;
      }

      if (!savedProductId) {
        throw new Error('Product was not saved correctly to the database.');
      }

      const imageRows = productImages.map((imgUrl, index) => ({
        product_id: savedProductId,
        image_url: imgUrl,
        is_primary: imgUrl === finalPrimaryImage,
        display_order: index,
      }));

      if (imageRows.length > 0) {
        const { error: imageError } = await supabase.from('product_images').insert(imageRows);
        if (imageError) throw imageError;
      }

      const updatedProducts = editingProduct
        ? productList.map((p) => {
            if (p.id === editingProduct.id) {
              return {
                ...p,
                name: formData.name,
                slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description: formData.description,
                ingredients: ingredientsList,
                how_to_use: formData.how_to_use.trim(),
                price: Number(formData.price),
                discount_price: formData.discount_price ? Number(formData.discount_price) : null,
                category_name: formData.category_name,
                skin_type: formData.skin_type,
                stock: Number(formData.stock),
                status: formData.status as 'active' | 'draft',
                primary_image: finalPrimaryImage,
                images: imageRows.map((image, index) => ({
                  id: `${editingProduct.id}-img-${index}`,
                  product_id: editingProduct.id,
                  image_url: image.image_url,
                  is_primary: image.is_primary,
                  display_order: image.display_order,
                })),
              };
            }
            return p;
          })
        : [
            {
              id: savedProductId,
              name: formData.name,
              slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              description: formData.description,
              ingredients: ingredientsList,
              how_to_use: formData.how_to_use.trim(),
              price: Number(formData.price),
              discount_price: formData.discount_price ? Number(formData.discount_price) : null,
              category_name: formData.category_name,
              skin_type: formData.skin_type,
              stock: Number(formData.stock),
              status: formData.status as 'active' | 'draft',
              rating: 4.8,
              review_count: 1,
              is_bestseller: false,
              is_new_arrival: true,
              primary_image: finalPrimaryImage,
              images: imageRows.map((image, index) => ({
                id: `${savedProductId}-img-${index}`,
                product_id: savedProductId,
                image_url: image.image_url,
                is_primary: image.is_primary,
                display_order: image.display_order,
              })),
            }, ...productList,
          ];

      setProductList(updatedProducts);
      await refreshProducts();
      showToast(editingProduct ? `Product "${formData.name}" updated successfully.` : `New Product "${formData.name}" created!`);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Failed to save product:', error);
      showToast(error?.message || 'Failed to save product. Check Supabase storage and table permissions.');
    }
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
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="capitalize px-2 py-0.5 rounded bg-lavender-100 text-lavender-800 text-[10.5px] font-semibold">
                      {p.status}
                    </span>
                    {p.is_bestseller && (
                      <span className="px-2 py-0.5 rounded bg-charcoal text-white text-[10.5px] font-semibold">
                        Best Seller
                      </span>
                    )}
                  </div>
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
          <div className="bg-white border border-line rounded-md max-w-xl w-full p-6 space-y-6 shadow-2xl relative my-8 max-h-[calc(100vh-2rem)] overflow-y-auto">
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

              <div>
                <label className="font-semibold text-charcoal-soft block mb-1">Ingredients</label>
                <textarea
                  rows={4}
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  placeholder="One ingredient per line or separate with commas"
                  className="w-full px-3 py-2 border border-line rounded bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal-soft block mb-1">How to Use</label>
                <textarea
                  rows={4}
                  value={formData.how_to_use}
                  onChange={(e) => setFormData({ ...formData, how_to_use: e.target.value })}
                  placeholder="Tell customers how and when to apply the product"
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
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <option value="">No categories available</option>
                    )}
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

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 rounded border border-line bg-ivory px-3 py-2 text-charcoal-soft">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.is_bestseller)}
                    onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                    className="h-4 w-4 accent-lavender-700"
                  />
                  <span className="font-semibold">Best Seller</span>
                </label>
                <label className="flex items-center gap-2 rounded border border-line bg-ivory px-3 py-2 text-charcoal-soft">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.is_new_arrival)}
                    onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                    className="h-4 w-4 accent-lavender-700"
                  />
                  <span className="font-semibold">New Arrival</span>
                </label>
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
