'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/store/cart-context';
import { createClient } from '@/lib/supabase/client';
import { User, Package, MapPin, Heart, LogOut } from 'lucide-react';

type AccountTab = 'orders' | 'profile' | 'addresses' | 'wishlist';

const accountTabs: { id: AccountTab; label: string; icon: typeof Package }[] = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
];

export default function CustomerAccountPage() {
  const router = useRouter();
  const { wishlist, products, showToast } = useCart();
  const [activeTab, setActiveTab] = useState<AccountTab>('orders');

  const [userProfile, setUserProfile] = useState({
    name: 'Ananya Roy',
    email: 'ananya.roy@example.com',
    phone: '9876543210',
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const refreshOrdersRef = useRef<() => void>(() => {});

  useEffect(() => {
    let isMounted = true;
    let userId: string | null = null;
    const supabase = createClient();

    const loadOrders = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, order_number, subtotal, delivery_charge, total_amount, status, created_at, shipping_name, shipping_city, order_items(product_id, product_name, size, quantity, unit_price)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!isMounted) return;

        setOrders((data || []).map((order) => ({
          id: order.order_number,
          total: Number(order.total_amount),
          status: order.status || 'Pending',
          created_at: order.created_at,
          customer: {
            name: order.shipping_name,
            city: order.shipping_city,
          },
          items: (order.order_items || []).map((item) => ({
            product_id: item.product_id,
            size: item.size,
            quantity: item.quantity,
            product: {
              name: item.product_name,
              price: Number(item.unit_price),
            },
          })),
        })));
        setOrdersError(null);
      } catch (error) {
        console.error('Failed to load customer orders:', error);
        if (isMounted) setOrdersError('Your orders could not be refreshed. Please try again.');
      } finally {
        if (isMounted) setOrdersLoading(false);
      }
    };

    try {
      const storedUser = localStorage.getItem('lavender_spot_user_session');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserProfile((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          email: parsed.email || prev.email,
        }));
      }
    } catch (e) {
      console.error('Failed to load cached customer profile:', e);
    }

    const initializeAccount = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) throw error;
        if (!user) {
          if (isMounted) {
            setOrders([]);
            setOrdersError('Sign in to view your orders.');
          }
          return;
        }
        if (!isMounted) return;

        const userProfile = {
          email: user.email || '',
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
          is_admin: false,
        };
        userId = user.id;
        localStorage.setItem('lavender_spot_user_session', JSON.stringify(userProfile));
        setUserProfile((prev) => ({ ...prev, ...userProfile }));
        await loadOrders();
      } catch (error) {
        console.error('Failed to load signed-in user profile:', error);
        if (isMounted) setOrdersError('Your account details could not be loaded. Please refresh the page.');
      } finally {
        if (isMounted) setOrdersLoading(false);
      }
    };

    void initializeAccount();
    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible') void loadOrders();
    };
    refreshOrdersRef.current = () => void loadOrders();
    const refreshInterval = window.setInterval(refreshOnFocus, 15000);
    window.addEventListener('focus', refreshOnFocus);

    return () => {
      isMounted = false;
      refreshOrdersRef.current = () => {};
      window.clearInterval(refreshInterval);
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Failed to sign out:', error);
      showToast('Unable to sign out. Please try again.');
      return;
    }

    localStorage.removeItem('lavender_spot_user_session');
    showToast('Logged out successfully');
    router.push('/login');
  };

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 sm:py-14 space-y-7">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-charcoal-muted">Welcome back</p>
          <h1 className="mt-1 text-3xl font-serif text-charcoal">My Account</h1>
          <p className="mt-1 text-xs text-charcoal-soft">{userProfile.name} · {userProfile.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded border border-line px-3 py-2 text-xs font-semibold text-charcoal-soft transition-colors hover:bg-white hover:text-charcoal"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </header>

      <nav aria-label="Account sections" className="flex gap-2 overflow-x-auto border-b border-line">
        {accountTabs.map((tab) => {
          const Icon = tab.icon;
          const label = tab.id === 'orders'
            ? `${tab.label} (${orders.length})`
            : tab.id === 'wishlist'
              ? `${tab.label} (${wishlist.length})`
              : tab.label;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
              className={`-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'border-lavender-700 text-lavender-800'
                  : 'border-transparent text-charcoal-muted hover:text-charcoal'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </nav>

      <main className="min-h-72 rounded-md border border-line bg-white p-5 sm:p-8">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-serif text-charcoal">Your orders</h2>
                <button
                  type="button"
                  onClick={() => refreshOrdersRef.current()}
                  disabled={ordersLoading}
                  className="text-xs font-semibold text-lavender-800 hover:underline disabled:opacity-50"
                >
                  Refresh status
                </button>
              </div>

              {ordersError && <p role="alert" className="text-xs text-rose-700">{ordersError}</p>}

              {ordersLoading ? (
                <p className="py-10 text-center text-xs text-charcoal-muted">Loading your orders...</p>
              ) : orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <section key={ord.id} className="rounded border border-line p-4 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                        <div>
                          <p className="font-semibold text-charcoal">Order {ord.id}</p>
                          <p className="mt-1 text-charcoal-muted">
                            {new Date(ord.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-charcoal">₹{ord.total}</p>
                          <p className="mt-1 text-charcoal-muted">{ord.status || 'Pending'}</p>
                        </div>
                      </div>
                      <div className="divide-y divide-line">
                        {(ord.items || []).map((item: any, index: number) => (
                          <div key={`${item.product_id}-${index}`} className="flex items-center justify-between gap-3 py-3">
                            <div>
                              <p className="font-medium text-charcoal">{item.product?.name || 'Product'}</p>
                              <p className="mt-1 text-charcoal-muted">Qty: {item.quantity} · Size: {item.size || 'One Size'}</p>
                            </div>
                            <span className="shrink-0 font-semibold text-charcoal">
                              ₹{(item.product?.price || item.price || 0) * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                      {ord.customer && (
                        <p className="border-t border-line pt-3 text-charcoal-muted">
                          Shipping to {ord.customer.name}, {ord.customer.city}
                        </p>
                      )}
                    </section>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Package className="mx-auto h-8 w-8 text-charcoal-muted" />
                  <p className="mt-3 text-xs text-charcoal-soft">You have not placed any orders yet.</p>
                  <Link href="/shop" className="mt-4 inline-block rounded bg-charcoal px-4 py-2.5 text-xs font-semibold text-white hover:bg-lavender-700">
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif text-charcoal border-b border-line pb-3">My Profile</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  localStorage.setItem('lavender_spot_user_session', JSON.stringify(userProfile));
                  showToast('Profile updated successfully!');
                }}
                className="max-w-md space-y-4 text-xs"
              >
                <div>
                  <label className="font-semibold text-charcoal-soft block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-line rounded bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal-soft block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                    className="w-full px-3 py-2.5 border border-line rounded bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal-soft block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                    className="w-full px-3 py-2.5 border border-line rounded bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-lavender-700 text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-lavender-800"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif text-charcoal border-b border-line pb-3">Saved Addresses</h2>
              <div className="max-w-md space-y-2 rounded border border-line p-4 text-xs">
                <div className="flex items-center justify-between font-semibold text-charcoal">
                  <span>Default Shipping Address</span>
                  <span className="bg-lavender-100 text-lavender-700 text-[10px] px-2 py-0.5 rounded">Primary</span>
                </div>
                <p className="text-charcoal-soft">
                  {userProfile.name}<br />
                  4B MG Road, Bandra West<br />
                  Mumbai, Maharashtra — 400050<br />
                  Phone: {userProfile.phone}
                </p>
              </div>
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif text-charcoal border-b border-line pb-3">
                Saved Wishlist ({wishlistedProducts.length})
              </h2>
              {wishlistedProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {wishlistedProducts.map((p) => (
                    <div key={p.id} className="border border-line p-3 rounded text-xs space-y-2">
                      <p className="font-serif font-medium truncate">{p.name}</p>
                      <p className="font-semibold text-charcoal">₹{p.price}</p>
                      <Link
                        href={`/products/${p.slug}`}
                        className="block w-full text-center py-1.5 bg-charcoal text-white rounded text-[11px] font-semibold"
                      >
                        View Product
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-charcoal-soft">Your wishlist is empty.</p>
              )}
            </div>
          )}
      </main>
    </div>
  );
}
