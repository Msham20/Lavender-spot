'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart-context';
import { Package, ShoppingBag, Users, IndianRupee, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';

export default function AdminDashboardPage() {
  const { products } = useCart();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    try {
      const storedOrders = JSON.parse(localStorage.getItem('lavender_spot_user_orders') || '[]');
      setOrders(storedOrders);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalCustomers = new Set(orders.map((o) => o.customer?.email)).size || 1;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter((o) => !o.status || o.status === 'Pending').length;
  const lowStockProducts = products.filter((p) => p.stock < 15);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="border-b border-line pb-4 flex justify-between items-end flex-wrap gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
            Overview & Metrics
          </span>
          <h1 className="text-3xl font-serif text-charcoal mt-1">Admin Dashboard</h1>
        </div>
        <Link
          href="/admin/products"
          className="px-4 py-2.5 bg-lavender-700 text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-lavender-800 transition-colors shadow"
        >
          + Add New Product
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-line rounded-md p-6 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-charcoal-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <div className="w-9 h-9 rounded bg-lavender-100 flex items-center justify-center text-lavender-700">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-serif font-semibold text-charcoal">₹{totalRevenue}</div>
          <p className="text-[11px] text-charcoal-muted">Lifetime store revenue</p>
        </div>

        <div className="bg-white border border-line rounded-md p-6 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-charcoal-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded bg-lavender-100 flex items-center justify-center text-lavender-700">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-serif font-semibold text-charcoal">{totalOrders}</div>
          <p className="text-[11px] text-charcoal-muted">{pendingOrders} orders pending fulfillment</p>
        </div>

        <div className="bg-white border border-line rounded-md p-6 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-charcoal-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Products</span>
            <div className="w-9 h-9 rounded bg-lavender-100 flex items-center justify-center text-lavender-700">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-serif font-semibold text-charcoal">{totalProducts}</div>
          <p className="text-[11px] text-charcoal-muted">Active items in catalog</p>
        </div>

        <div className="bg-white border border-line rounded-md p-6 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-charcoal-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Customers</span>
            <div className="w-9 h-9 rounded bg-lavender-100 flex items-center justify-center text-lavender-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-serif font-semibold text-charcoal">{totalCustomers}</div>
          <p className="text-[11px] text-charcoal-muted">Unique customer accounts</p>
        </div>

        <div className="bg-white border border-line rounded-md p-6 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-charcoal-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Orders</span>
            <div className="w-9 h-9 rounded bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-serif font-semibold text-amber-700">{pendingOrders}</div>
          <p className="text-[11px] text-charcoal-muted">Requires confirmation or dispatch</p>
        </div>

        <div className="bg-white border border-line rounded-md p-6 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-charcoal-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Low Stock Alerts</span>
            <div className="w-9 h-9 rounded bg-rose-100 flex items-center justify-center text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-serif font-semibold text-rose-700">{lowStockProducts.length}</div>
          <p className="text-[11px] text-charcoal-muted">Products with stock under 15</p>
        </div>
      </div>

      {/* Quick Action Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders List */}
        <div className="bg-white border border-line rounded-md p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-line pb-3">
            <h2 className="text-lg font-serif text-charcoal font-medium">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-lavender-700 hover:underline flex items-center gap-1">
              View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length > 0 ? (
            <div className="divide-y divide-line text-xs">
              {orders.slice(0, 5).map((ord) => (
                <div key={ord.id} className="py-3 flex justify-between items-center">
                  <div>
                    <span className="font-serif font-bold text-charcoal block">{ord.id}</span>
                    <span className="text-charcoal-muted">{ord.customer?.name} · ₹{ord.total}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-lavender-100 text-lavender-800 text-[10.5px] font-semibold rounded">
                    {ord.status || 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-charcoal-muted py-6 text-center">No orders recorded yet.</p>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-line rounded-md p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-line pb-3">
            <h2 className="text-lg font-serif text-charcoal font-medium">Low Stock Inventory</h2>
            <Link href="/admin/products" className="text-xs font-semibold text-lavender-700 hover:underline flex items-center gap-1">
              Manage Products <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-line text-xs">
            {lowStockProducts.map((prod) => (
              <div key={prod.id} className="py-3 flex justify-between items-center">
                <div>
                  <span className="font-serif font-medium text-charcoal block">{prod.name}</span>
                  <span className="text-charcoal-muted">Category: {prod.category_name}</span>
                </div>
                <span className={`px-2.5 py-1 font-semibold rounded text-[10.5px] ${
                  prod.stock === 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  Stock: {prod.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
