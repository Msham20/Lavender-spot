'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/store/cart-context';
import { User, Package, MapPin, Heart, LogOut, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

export default function CustomerAccountPage() {
  const router = useRouter();
  const { wishlist, products, showToast } = useCart();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'wishlist'>('orders');

  const [userProfile, setUserProfile] = useState({
    name: 'Ananya Roy',
    email: 'ananya.roy@example.com',
    phone: '9876543210',
  });

  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
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

      const storedOrders = JSON.parse(localStorage.getItem('lavender_spot_user_orders') || '[]');
      setOrders(storedOrders);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('lavender_spot_user_session');
    showToast('Logged out successfully');
    router.push('/login');
  };

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-[1320px] mx-auto px-5 lg:px-10 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-line pb-4 flex justify-between items-end flex-wrap gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
            Customer Portal
          </span>
          <h1 className="text-3xl font-serif text-charcoal mt-1">My Account</h1>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-line text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      {/* Account Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="bg-white border border-line rounded-md p-3 space-y-1">
          {[
            { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
            { id: 'wishlist', label: `Wishlist (${wishlist.length})`, icon: Heart },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold rounded transition-colors ${
                  activeTab === tab.id
                    ? 'bg-lavender-700 text-white'
                    : 'text-charcoal-soft hover:bg-lavender-50 hover:text-charcoal'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-white border border-line rounded-md p-6 sm:p-8">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif text-charcoal border-b border-line pb-3">Order History</h2>

              {orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((ord) => (
                    <div key={ord.id} className="border border-line rounded-md overflow-hidden text-xs">
                      {/* Order Header */}
                      <div className="bg-ivory p-4 border-b border-line flex flex-wrap justify-between items-center gap-3">
                        <div>
                          <span className="text-[10px] uppercase text-charcoal-muted font-semibold block">
                            Order ID
                          </span>
                          <span className="font-serif text-sm font-bold text-lavender-900">{ord.id}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-charcoal-muted font-semibold block">
                            Date Placed
                          </span>
                          <span className="text-charcoal font-medium">
                            {new Date(ord.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-charcoal-muted font-semibold block">
                            Total Paid
                          </span>
                          <span className="font-semibold text-charcoal">₹{ord.total}</span>
                        </div>
                        <div>
                          <span className="inline-block px-2.5 py-1 bg-lavender-100 text-lavender-800 font-semibold rounded text-[11px]">
                            Status: {ord.status || 'Confirmed'}
                          </span>
                        </div>
                      </div>

                      {/* Status Progress Tracker */}
                      <div className="p-4 bg-lavender-50/50 border-b border-line flex items-center justify-between text-[11px] font-semibold text-charcoal-soft">
                        <div className="flex items-center gap-1.5 text-lavender-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Order Confirmed
                        </div>
                        <span className="text-line">—</span>
                        <div className="flex items-center gap-1.5 text-lavender-700">
                          <Clock className="w-3.5 h-3.5" /> Processing
                        </div>
                        <span className="text-line">—</span>
                        <div className="text-charcoal-muted">Shipped</div>
                        <span className="text-line">—</span>
                        <div className="text-charcoal-muted">Delivered</div>
                      </div>

                      {/* Purchased Items */}
                      <div className="p-4 divide-y divide-line">
                        {ord.items.map((item: any) => (
                          <div key={item.product_id} className="py-2.5 flex justify-between items-center">
                            <div>
                              <p className="font-serif font-medium text-charcoal text-xs">{item.product.name}</p>
                              <p className="text-[10px] text-charcoal-muted">Size: {item.size} · Qty: {item.quantity}</p>
                            </div>
                            <span className="font-semibold text-charcoal">₹{item.product.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Address */}
                      <div className="p-4 bg-ivory border-t border-line text-[11px] text-charcoal-soft">
                        <strong>Shipping to:</strong> {ord.customer.name}, {ord.customer.address}, {ord.customer.city}, {ord.customer.state} - {ord.customer.pincode} ({ord.customer.phone})
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 space-y-3">
                  <Package className="w-10 h-10 text-charcoal-muted mx-auto" />
                  <p className="text-xs text-charcoal-soft">You have not placed any orders yet.</p>
                  <Link href="/shop" className="inline-block px-5 py-2.5 bg-charcoal text-white text-xs font-semibold uppercase rounded">
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
                className="space-y-4 max-w-md text-xs"
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
              <div className="border border-line rounded p-4 text-xs space-y-2 bg-ivory">
                <div className="flex justify-between items-center font-semibold text-charcoal">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
        </div>
      </div>
    </div>
  );
}
