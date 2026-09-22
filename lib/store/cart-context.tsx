'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '@/types/database';
import { INITIAL_PRODUCTS } from '@/lib/data/mock-seed';

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  toast: string | null;
  products: Product[];
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
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_KEY);
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        // Hydrate product objects
        const hydrated = parsed.map((item: any) => {
          const product = products.find((p) => p.id === item.product_id) || products[0];
          return { ...item, product };
        });
        setCart(hydrated);
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
