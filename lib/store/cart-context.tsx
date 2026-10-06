'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  toast: string | null;
  products: Product[];
  refreshProducts: () => Promise<void>;
  addToCart: (productId: string, size?: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, delta: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  showToast: (msg: string) => void;
  cartSubtotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'lavender_spot_cart';
const WISH_KEY = 'lavender_spot_wishlist';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const refreshProducts = async () => {
    try {
      const supabase = createClient();
      const [{ data: productRows, error: productError }, { data: categoryRows }] = await Promise.all([
        supabase.from('products').select('*').eq('status', 'active').order('created_at', { ascending: false }),
        supabase.from('categories').select('*'),
      ]);

      if (productError) {
        console.error('Failed to load products from database:', productError);
        setProducts([]);
        return;
      }

      const categoryMap = new Map((categoryRows || []).map((category) => [category.id, category.name]));
      const { data: imageRows } = await supabase.from('product_images').select('*');
      const imageMap = new Map<string, string[]>();

      (imageRows || []).forEach((image) => {
        const current = imageMap.get(image.product_id) || [];
        current.push(image.image_url);
        imageMap.set(image.product_id, current);
      });

      const mappedProducts: Product[] = (productRows || []).map((product) => {
        const productImages = imageMap.get(product.id) || [];
        const primaryImage = productImages[0] || 'linear-gradient(135deg, #F3EAF8, #7E60BF)';

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description || '',
          price: Number(product.price),
          discount_price: product.discount_price ? Number(product.discount_price) : null,
          category_id: product.category_id,
          category_name: product.category_id ? categoryMap.get(product.category_id) || 'General' : 'General',
          skin_type: product.skin_type || 'All Skin Types',
          stock: Number(product.stock || 0),
          status: product.status || 'active',
          is_bestseller: Boolean(product.is_bestseller),
          is_new_arrival: Boolean(product.is_new_arrival),
          rating: Number(product.rating || 4.8),
          review_count: Number(product.review_count || 0),
          ingredients: Array.isArray(product.ingredients) ? product.ingredients : [],
          how_to_use: product.how_to_use || '',
          primary_image: primaryImage,
          images: productImages.map((imageUrl, index) => ({
            id: `${product.id}-img-${index}`,
            product_id: product.id,
            image_url: imageUrl,
            is_primary: imageUrl === primaryImage,
            display_order: index,
          })),
        };
      });

      setProducts(mappedProducts);
    } catch (e) {
      console.error('Error loading database products:', e);
      setProducts([]);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_KEY);
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        const hydrated = parsed.map((item: any) => {
          const product = products.find((p) => p.id === item.product_id) || null;
          return { ...item, product };
        });
        setCart(hydrated.filter((item: any) => item.product));
      }

      const storedWish = localStorage.getItem(WISH_KEY);
      if (storedWish) {
        setWishlist(JSON.parse(storedWish));
      }
    } catch (e) {
      console.error('Error loading cart/wishlist state from storage', e);
    }
  }, [products]);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      const serializable = newCart.map((i) => ({
        product_id: i.product_id,
        size: i.size,
        quantity: i.quantity,
      }));
      localStorage.setItem(CART_KEY, JSON.stringify(serializable));
    } catch (e) {
      console.error('Error saving cart', e);
    }
  };

  const saveWishlist = (newWish: string[]) => {
    setWishlist(newWish);
    try {
      localStorage.setItem(WISH_KEY, JSON.stringify(newWish));
    } catch (e) {
      console.error('Error saving wishlist', e);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const addToCart = (productId: string, size?: string, quantity: number = 1) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const targetSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'One Size');
    const existingIndex = cart.findIndex((i) => i.product_id === productId && i.size === targetSize);

    let updated = [...cart];
    if (existingIndex > -1) {
      updated[existingIndex].quantity += quantity;
    } else {
      updated.push({
        product_id: productId,
        product,
        size: targetSize,
        quantity,
      });
    }

    saveCart(updated);
    showToast(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId: string, size: string) => {
    const updated = cart.filter((i) => !(i.product_id === productId && i.size === size));
    saveCart(updated);
    showToast('Item removed from cart');
  };

  const updateQuantity = (productId: string, size: string, delta: number) => {
    const updated = cart
      .map((i) => {
        if (i.product_id === productId && i.size === size) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : null;
        }
        return i;
      })
      .filter(Boolean) as CartItem[];

    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const toggleWishlist = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (wishlist.includes(productId)) {
      const updated = wishlist.filter((id) => id !== productId);
      saveWishlist(updated);
      showToast('Removed from wishlist');
    } else {
      const updated = [...wishlist, productId];
      saveWishlist(updated);
      showToast(`${product?.name || 'Item'} added to wishlist!`);
    }
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        toast,
        products,
        refreshProducts,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isWishlisted,
        showToast,
        cartSubtotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
