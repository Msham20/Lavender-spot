'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle, Package, ArrowRight, Printer } from 'lucide-react';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const loadOrder = () => {
      try {
        const stored = localStorage.getItem(`order_${orderId}`);
        if (stored) {
          setOrder(JSON.parse(stored));
        }
      } catch (e) {
        console.error(e);
      }

    };

    loadOrder();
    window.addEventListener('storage', loadOrder);
    window.addEventListener('focus', loadOrder);
    return () => {
      window.removeEventListener('storage', loadOrder);
      window.removeEventListener('focus', loadOrder);
    };
  }, [orderId]);

  const paymentVerified = order?.paymentStatus === 'Verified';

  return (
    <div className="max-w-[1320px] mx-auto px-5 lg:px-10 py-16">
      <div className="max-w-xl mx-auto bg-white border border-line rounded-md p-8 sm:p-12 text-center space-y-6 shadow-sm">
        <div className="w-20 h-20 bg-lavender-100 rounded-full flex items-center justify-center mx-auto text-lavender-700">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-lavender-700">
            {paymentVerified ? 'Payment Confirmed' : order?.paymentMethod === 'UPI' ? 'Payment Submitted' : 'Order Details'}
          </span>
          <h1 className="text-3xl font-serif text-charcoal">
            {paymentVerified
              ? 'Payment Received'
              : order?.paymentMethod === 'UPI'
                ? 'Payment Awaiting Verification'
                : 'Order Placed Successfully!'}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-soft leading-relaxed">
            {paymentVerified
              ? 'Your payment has been verified. Your invoice is ready below.'
              : order?.paymentMethod === 'UPI'
                ? 'Your UPI reference has been recorded. The store must verify the transfer before your order is marked paid.'
              : 'Thank you for shopping with Lavender Spot. Your order has been received.'}
          </p>
        </div>

        <div className="bg-lavender-50 border border-lavender-200 rounded p-4 inline-block">
          <span className="text-xs text-charcoal-muted block">Order ID</span>
          <span className="font-serif text-xl font-bold text-lavender-900">{orderId}</span>
        </div>

        {order && !paymentVerified && (
          <div className="text-left border border-line rounded p-5 space-y-4 text-xs bg-ivory">
            {order.paymentMethod === 'UPI' && (
              <div className="border-b border-line pb-3 space-y-1">
                <p><strong>Payment status:</strong> {order.paymentStatus}</p>
                <p><strong>UPI transaction reference:</strong> {order.upiTransactionReference}</p>
              </div>
            )}
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
                <span>{order.paymentMethod === 'UPI' ? 'Order Total' : 'Total Amount'}</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>
        )}

        {order && paymentVerified && (
          <div className="invoice-print mt-6 border border-line rounded-md bg-white p-5 sm:p-8 text-left">
            <div className="invoice-print-control flex justify-end mb-5">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-charcoal text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-lavender-700 transition-colors"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-5 border-b border-line pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-lavender-700">Lavender Spot</p>
                <h2 className="text-2xl font-serif text-charcoal mt-1">Invoice</h2>
              </div>
              <div className="sm:text-right text-xs text-charcoal-soft space-y-1">
                <p><strong>Invoice no.</strong> INV-{order.id}</p>
                <p><strong>Order no.</strong> {order.id}</p>
                <p><strong>Payment date.</strong> {new Date(order.paymentVerifiedAt || order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}</p>
                <p><strong>Payment method.</strong> {order.paymentMethod}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-5 border-b border-line text-xs">
              <div className="space-y-1">
                <h3 className="font-semibold text-charcoal">Billed to</h3>
                <p className="text-charcoal-soft">{order.customer.name}</p>
                <p className="text-charcoal-soft">{order.customer.email}</p>
                <p className="text-charcoal-soft">{order.customer.phone}</p>
              </div>
              <div className="space-y-1 sm:text-right">
                <h3 className="font-semibold text-charcoal">Delivery address</h3>
                <p className="text-charcoal-soft">{order.customer.address}</p>
                <p className="text-charcoal-soft">{order.customer.city}, {order.customer.state} {order.customer.pincode}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-line text-left text-charcoal-soft">
                    <th className="py-3 pr-3 font-semibold">Item</th>
                    <th className="py-3 px-3 text-center font-semibold">Qty</th>
                    <th className="py-3 px-3 text-right font-semibold">Unit price</th>
                    <th className="py-3 pl-3 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {order.items.map((item: any, index: number) => {
                    const unitPrice = Number(item.product?.price) || 0;
                    return (
                      <tr key={`${item.product_id}-${item.size}-${index}`}>
                        <td className="py-3 pr-3 text-charcoal">
                          <span className="font-medium">{item.product?.name}</span>
                          <span className="block text-[11px] text-charcoal-muted">Size: {item.size}</span>
                        </td>
                        <td className="py-3 px-3 text-center text-charcoal-soft">{item.quantity}</td>
                        <td className="py-3 px-3 text-right text-charcoal-soft">{formatCurrency(unitPrice)}</td>
                        <td className="py-3 pl-3 text-right font-medium text-charcoal">
                          {formatCurrency(unitPrice * item.quantity)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="ml-auto max-w-xs border-t border-line pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-charcoal-soft">
                <span>Subtotal</span><span>{formatCurrency(Number(order.subtotal) || 0)}</span>
              </div>
              <div className="flex justify-between text-charcoal-soft">
                <span>Delivery</span><span>{Number(order.shippingCharge) ? formatCurrency(Number(order.shippingCharge)) : 'Free'}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-sm font-semibold text-charcoal">
                <span>Total paid</span><span>{formatCurrency(Number(order.total) || 0)}</span>
              </div>
            </div>

            {order.upiTransactionReference && (
              <p className="mt-5 border-t border-line pt-4 text-xs text-charcoal-soft">
                <strong>UPI reference:</strong> {order.upiTransactionReference}
              </p>
            )}
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
