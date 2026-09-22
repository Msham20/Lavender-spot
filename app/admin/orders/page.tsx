'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/lib/store/cart-context';
import { Search, Eye, X, CheckCircle2 } from 'lucide-react';

export default function AdminOrdersPage() {
  const { showToast } = useCart();
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [activeModalOrder, setActiveModalOrder] = useState<any | null>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('lavender_spot_user_orders') || '[]');
      setOrders(stored);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    const updated = orders.map((ord) => {
      if (ord.id === orderId) {
        const updatedOrd = { ...ord, status: newStatus };
        // Sync individual order storage
        localStorage.setItem(`order_${orderId}`, JSON.stringify(updatedOrd));
        return updatedOrd;
      }
      return ord;
    });

    setOrders(updated);
    localStorage.setItem('lavender_spot_user_orders', JSON.stringify(updated));
    showToast(`Order ${orderId} status updated to "${newStatus}"`);
    if (activeModalOrder && activeModalOrder.id === orderId) {
      setActiveModalOrder({ ...activeModalOrder, status: newStatus });
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === 'all' || (o.status || 'Pending').toLowerCase() === selectedStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-line pb-4 flex justify-between items-end flex-wrap gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
            Fulfillment Center
          </span>
          <h1 className="text-3xl font-serif text-charcoal mt-1">Order Queue ({orders.length})</h1>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
          <input
            type="text"
            placeholder="Search orders by ID, name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-line rounded bg-white"
          />
        </div>

        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="py-2 px-3 text-xs border border-line rounded bg-white text-charcoal"
        >
          <option value="all">Filter: All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-line rounded-md overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-ivory border-b border-line text-charcoal-soft font-semibold">
              <th className="p-3.5">Order ID</th>
              <th className="p-3.5">Customer</th>
              <th className="p-3.5">Items</th>
              <th className="p-3.5">Total Amount</th>
              <th className="p-3.5">Current Status</th>
              <th className="p-3.5">Update Status</th>
              <th className="p-3.5 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-lavender-50/50 transition-colors">
                  <td className="p-3.5 font-serif font-bold text-lavender-900">{ord.id}</td>
                  <td className="p-3.5">
                    <span className="font-semibold text-charcoal block">{ord.customer?.name}</span>
                    <span className="text-charcoal-muted text-[11px]">{ord.customer?.email}</span>
                  </td>
                  <td className="p-3.5 text-charcoal-soft">{ord.items?.length || 0} item(s)</td>
                  <td className="p-3.5 font-semibold text-charcoal">₹{ord.total}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 bg-lavender-100 text-lavender-800 text-[10.5px] font-semibold rounded">
                      {ord.status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <select
                      value={ord.status || 'Pending'}
                      onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                      className="py-1 px-2 border border-line rounded bg-white text-[11px]"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setActiveModalOrder(ord)}
                      className="p-1.5 border border-line rounded text-charcoal hover:bg-beige"
                      title="View Order Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-charcoal-muted">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {activeModalOrder && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-line rounded-md max-w-2xl w-full p-6 space-y-6 shadow-2xl relative my-8 text-xs">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <div>
                <span className="text-[10px] text-charcoal-muted uppercase block font-semibold">Order Details</span>
                <h2 className="text-xl font-serif text-charcoal font-bold">{activeModalOrder.id}</h2>
              </div>
              <button onClick={() => setActiveModalOrder(null)} className="text-charcoal-muted hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Delivery Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-ivory p-4 border border-line rounded">
              <div>
                <span className="font-semibold block text-charcoal mb-1">Customer Information</span>
                <p className="text-charcoal-soft">
                  Name: {activeModalOrder.customer?.name}<br />
                  Email: {activeModalOrder.customer?.email}<br />
                  Phone: {activeModalOrder.customer?.phone}
                </p>
              </div>
              <div>
                <span className="font-semibold block text-charcoal mb-1">Shipping Address</span>
                <p className="text-charcoal-soft">
                  {activeModalOrder.customer?.address}<br />
                  {activeModalOrder.customer?.city}, {activeModalOrder.customer?.state} - {activeModalOrder.customer?.pincode}
                </p>
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="space-y-2">
              <span className="font-semibold block text-charcoal">Purchased Products</span>
              <div className="divide-y divide-line border-t border-b border-line">
                {activeModalOrder.items?.map((item: any) => (
                  <div key={item.product_id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-serif font-medium text-charcoal">{item.product?.name}</p>
                      <p className="text-[10px] text-charcoal-muted">Size: {item.size} · Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-charcoal">
                      ₹{(item.product?.price || 0) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 font-semibold text-sm border-t border-line text-charcoal">
              <span>Total Payable</span>
              <span>₹{activeModalOrder.total}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
