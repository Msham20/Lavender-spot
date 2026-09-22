'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle, Package, Truck, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`order_${orderId}`);
      if (stored) {
        setOrder(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, [orderId]);

  return (
    <div className="max-w-[1320px] mx-auto px-5 lg:px-10 py-16">
      <div className="max-w-xl mx-auto bg-white border border-line rounded-md p-8 sm:p-12 text-center space-y-6 shadow-sm">
        <div className="w-20 h-20 bg-lavender-100 rounded-full flex items-center justify-center mx-auto text-lavender-700">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-lavender-700">
            Order Confirmed
          </span>
          <h1 className="text-3xl font-serif text-charcoal">Order Placed Successfully!</h1>
          <p className="text-xs sm:text-sm text-charcoal-soft leading-relaxed">
            Thank you for shopping with Lavender Spot. A confirmation email has been dispatched to your inbox.
          </p>
        </div>

        <div className="bg-lavender-50 border border-lavender-200 rounded p-4 inline-block">
          <span className="text-xs text-charcoal-muted block">Order ID</span>
          <span className="font-serif text-xl font-bold text-lavender-900">{orderId}</span>
        </div>

        {order && (
          <div className="text-left border border-line rounded p-5 space-y-4 text-xs bg-ivory">
            <div className="flex justify-between font-semibold border-b border-line pb-2">
              <span>Delivery Details</span>
              <span className="text-lavender-700">Estimated: {order.estimatedDelivery}</span>
            </div>
            <p className="text-charcoal-soft">
              <strong>Shipping to:</strong> {order.customer.name} ({order.customer.phone})<br />
              {order.customer.address}, {order.customer.city}, {order.customer.state} - {order.customer.pincode}
            </p>

            <div className="border-t border-line pt-3 space-y-2">
              <span className="font-semibold block mb-1">Purchased Items:</span>
              {order.items.map((item: any) => (
                <div key={item.product_id} className="flex justify-between text-charcoal-soft">
                  <span>{item.product.name} ({item.size}) × {item.quantity}</span>
                  <span className="font-semibold">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-line pt-2 flex justify-between font-semibold text-charcoal text-sm">
                <span>Total Amount Paid</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/account"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-charcoal text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-lavender-700 transition-colors"
          >
            <Package className="w-4 h-4" /> View Order History
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-line text-charcoal text-xs font-semibold uppercase tracking-wider rounded hover:bg-beige transition-colors"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
