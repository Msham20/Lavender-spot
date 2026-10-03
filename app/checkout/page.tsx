'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/store/cart-context';
import { createClient } from '@/lib/supabase/client';
import { Lock, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const UPI_ID = 'aaruvimbs1212@okicici';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, clearCart, showToast } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'UPI',
  });

  const [error, setError] = useState<string | null>(null);
  const [upiOrder, setUpiOrder] = useState<any | null>(null);
  const [upiReference, setUpiReference] = useState('');
  const [upiError, setUpiError] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const shippingCharge = cartSubtotal >= 999 || cartSubtotal === 0 ? 0 : 79;
  const finalTotal = cartSubtotal + shippingCharge;
  const upiPaymentUrl = upiOrder
    ? `upi://pay?${new URLSearchParams({
        pa: UPI_ID,
        am: upiOrder.total.toFixed(2),
        cu: 'INR',
        tn: `Lavender Spot order ${upiOrder.id}`,
      }).toString()}`
    : '';

  if (cart.length === 0) {
    return (
      <div className="max-w-[1320px] mx-auto px-5 py-20 text-center space-y-4">
        <h1 className="text-2xl font-serif text-charcoal">Your Cart is Empty</h1>
        <p className="text-xs text-charcoal-soft">Add items to your cart before proceeding to checkout.</p>
        <Link href="/shop" className="inline-block px-6 py-3 bg-charcoal text-white text-xs font-semibold uppercase rounded">
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  if (upiOrder) {
    return (
      <div className="max-w-[1320px] mx-auto px-5 lg:px-10 py-10">
        <div className="max-w-2xl mx-auto bg-white border border-line rounded-md p-6 sm:p-10 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">Direct UPI Payment</span>
            <h1 className="text-3xl font-serif text-charcoal">Pay ₹{upiOrder.total.toFixed(2)}</h1>
            <p className="text-sm text-charcoal-soft">Scan with a UPI app or open the payment app on this device.</p>
          </div>

          <div className="flex justify-center">
            <div className="p-3 border border-line rounded bg-white">
              <QRCodeSVG value={upiPaymentUrl} size={208} level="M" includeMargin />
            </div>
          </div>

          <div className="text-center space-y-2 text-sm">
            <p className="text-charcoal-soft">Pay to this UPI ID</p>
            <p className="font-semibold text-charcoal">{UPI_ID}</p>
            <p className="text-xs text-charcoal-muted">Order {upiOrder.id} · Exact amount ₹{upiOrder.total.toFixed(2)}</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a
              href={upiPaymentUrl}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-lavender-700 text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-lavender-800"
            >
              <ExternalLink className="w-4 h-4" /> Open UPI App
            </a>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(UPI_ID)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-line text-charcoal text-xs font-semibold uppercase tracking-wider rounded hover:bg-beige"
            >
              <Copy className="w-4 h-4" /> Copy UPI ID
            </button>
          </div>

          <div className="border-t border-line pt-5 space-y-3">
            <label htmlFor="upi-reference" className="block text-xs font-semibold text-charcoal-soft">
              After paying, enter the transaction reference (UTR) shown in your UPI app.
            </label>
            <input
              id="upi-reference"
              type="text"
              value={upiReference}
              onChange={(event) => {
                setUpiReference(event.target.value);
                setUpiError(null);
              }}
              placeholder="UPI transaction reference"
              className="w-full px-3 py-2.5 text-sm border border-line rounded bg-white"
            />
            {upiError && <p className="text-xs text-rose-700">{upiError}</p>}
            <p className="text-xs text-charcoal-muted">
              This records your reference only. The store must verify the payment before treating the order as paid.
            </p>
            <button
              type="button"
              onClick={handleUpiPaymentSubmitted}
              disabled={savingOrder}
              className="w-full py-3 bg-charcoal text-white text-xs font-semibold uppercase tracking-widest rounded hover:bg-lavender-700 disabled:opacity-60"
            >
              {savingOrder ? 'Saving Order...' : 'I Have Paid'}
            </button>
            <button
              type="button"
              onClick={() => setUpiOrder(null)}
              className="w-full py-2 text-xs font-semibold text-charcoal-soft hover:text-charcoal"
            >
              Back to checkout
            </button>
          </div>
        </div>
      </div>
    );
  }
  async function saveOrder(orderData: any) {
    if (savingOrder) return;
    setSavingOrder(true);

    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Please sign in again before placing your order.');
      }

      const { data: databaseOrderId, error: orderError } = await supabase.rpc('create_customer_order', {
        p_order_number: orderData.id,
        p_shipping_name: orderData.customer.name,
        p_shipping_phone: orderData.customer.phone.trim(),
        p_shipping_address: orderData.customer.address,
        p_shipping_city: orderData.customer.city,
        p_shipping_state: orderData.customer.state,
        p_shipping_pincode: orderData.customer.pincode.trim(),
        p_payment_method: orderData.paymentMethod,
        p_payment_reference: orderData.upiTransactionReference || null,
        p_items: orderData.items.map((item: any) => ({
          product_id: item.product_id,
          size: item.size,
          quantity: item.quantity,
        })),
      });

      if (orderError || !databaseOrderId) {
        throw orderError || new Error('Order could not be recorded.');
      }

      const savedOrder = { ...orderData, databaseId: databaseOrderId, customer: { ...orderData.customer, email: user.email } };
      try {
        localStorage.setItem(`order_${orderData.id}`, JSON.stringify(savedOrder));
        const existingOrders = JSON.parse(localStorage.getItem('lavender_spot_user_orders') || '[]');
        localStorage.setItem('lavender_spot_user_orders', JSON.stringify([savedOrder, ...existingOrders]));
      } catch (storageError) {
        console.error('Order saved remotely but local cache could not be updated:', storageError);
      }

      clearCart();
      showToast('Order submitted for payment verification.');
      router.push(`/order-success/${orderData.id}`);
    } catch (saveError) {
      console.error('Unable to save order:', saveError);
      const message = 'We could not save your order. Keep your payment reference and retry; do not pay again.';
      if (orderData.paymentMethod === 'UPI') {
        setUpiError(message);
      } else {
        setError(message);
      }
    } finally {
      setSavingOrder(false);
    }

  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      setError('Please fill in all required shipping fields.');
      return;
    }

    if (!/^\d{10}$/.test(formData.phone.trim())) {
      setError('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      setError('Please enter a valid 6-digit pincode.');
      return;
    }

    const outOfStock = cart.find((item) => item.quantity > item.product.stock);
    if (outOfStock) {
      setError(`Stock limit exceeded for ${outOfStock.product.name}. Available stock: ${outOfStock.product.stock}`);
      return;
    }

    const orderId = 'LS-' + Math.floor(100000 + Math.random() * 900000);
    const orderData = {
      id: orderId,
      items: cart,
      subtotal: cartSubtotal,
      shippingCharge,
      total: finalTotal,
      customer: formData,
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentMethod === 'UPI' ? 'Awaiting payment' : 'Pay on delivery',
      status: 'Pending',
      created_at: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };

    if (formData.paymentMethod === 'UPI') {
      setUpiOrder(orderData);
      return;
    }

    saveOrder(orderData);
  };

  function handleUpiPaymentSubmitted() {
    if (!upiReference.trim()) {
      setUpiError('Enter the UPI transaction reference from your payment app.');
      return;
    }

    saveOrder({
      ...upiOrder,
      paymentStatus: 'Submitted for verification',
      upiTransactionReference: upiReference.trim(),
    });
  }

  return (
    <div className="max-w-[1320px] mx-auto px-5 lg:px-10 py-10 space-y-8">
      {/* Title */}
      <div className="border-b border-line pb-4">
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
          Checkout Process
        </span>
        <h1 className="text-3xl font-serif text-charcoal mt-1">Secure Checkout</h1>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center gap-3 text-xs text-charcoal-soft font-semibold flex-wrap">
        <span className="flex items-center gap-1.5 text-lavender-700">
          <CheckCircle2 className="w-4 h-4" /> 1. Contact & Shipping
        </span>
        <span>—</span>
        <span className="flex items-center gap-1.5 text-lavender-700">
          <CheckCircle2 className="w-4 h-4" /> 2. Payment Method
        </span>
        <span>—</span>
        <span>3. Order Review</span>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-md">
          {error}
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
          {/* Section 1: Contact Information */}
          <div className="bg-white border border-line rounded-md p-6 space-y-4">
            <h2 className="text-base font-serif text-charcoal font-medium border-b border-line pb-3">
              1. Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-charcoal-soft block mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ananya Roy"
                  className="w-full px-3 py-2.5 text-xs border border-line rounded bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-charcoal-soft block mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ananya@example.com"
                  className="w-full px-3 py-2.5 text-xs border border-line rounded bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-charcoal-soft block mb-1">Phone Number (10 digits) *</label>
              <input
                type="tel"
                name="phone"
                required
                pattern="[0-9]{10}"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full px-3 py-2.5 text-xs border border-line rounded bg-white"
              />
            </div>
          </div>

          {/* Section 2: Shipping Address */}
          <div className="bg-white border border-line rounded-md p-6 space-y-4">
            <h2 className="text-base font-serif text-charcoal font-medium border-b border-line pb-3">
              2. Shipping Address
            </h2>
            <div>
              <label className="text-xs font-semibold text-charcoal-soft block mb-1">Flat / House No. / Street Address *</label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Building Name, Flat 4B, MG Road"
                className="w-full px-3 py-2.5 text-xs border border-line rounded bg-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-charcoal-soft block mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  className="w-full px-3 py-2.5 text-xs border border-line rounded bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-charcoal-soft block mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                  className="w-full px-3 py-2.5 text-xs border border-line rounded bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-charcoal-soft block mb-1">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  pattern="[0-9]{6}"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="400001"
                  className="w-full px-3 py-2.5 text-xs border border-line rounded bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment Options */}
          <div className="bg-white border border-line rounded-md p-6 space-y-4">
            <h2 className="text-base font-serif text-charcoal font-medium border-b border-line pb-3">
              3. Payment Method
            </h2>
            <div className="space-y-3">
              {[
                { id: 'UPI', label: 'Direct UPI (GPay / PhonePe / Paytm / BHIM)' },
              ].map((pm) => (
                <label
                  key={pm.id}
                  className={`flex items-center gap-3 p-3.5 border rounded cursor-pointer text-xs font-semibold transition-colors ${
                    formData.paymentMethod === pm.id
                      ? 'border-lavender-700 bg-lavender-50 text-lavender-900'
                      : 'border-line bg-white text-charcoal hover:border-lavender-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.id}
                    checked={formData.paymentMethod === pm.id}
                    onChange={handleChange}
                    className="accent-lavender-700"
                  />
                  <span>{pm.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-charcoal-muted">
              UPI payments are submitted for manual verification. Do not close checkout until you have noted your transaction reference.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-lavender-700 text-white text-xs font-semibold uppercase tracking-widest rounded hover:bg-lavender-800 transition-colors shadow-md"
          >
            Place Order Now (₹{finalTotal})
          </button>
        </form>

        {/* Order Items Preview Column */}
        <div className="bg-white border border-line rounded-md p-6 space-y-5 sticky top-28">
          <h2 className="text-base font-serif text-charcoal font-medium border-b border-line pb-3">
            Order Items ({cart.length})
          </h2>

          <div className="divide-y divide-line max-h-80 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={`${item.product_id}-${item.size}`} className="py-3 flex gap-3 items-center">
                <div
                  className="w-12 h-12 rounded bg-beige flex-shrink-0 flex items-center justify-center font-serif text-lg text-white"
                  style={{ background: item.product.primary_image || 'linear-gradient(135deg, #F3EAF8, #7E60BF)' }}
                >
                  {item.product.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-serif text-charcoal truncate">{item.product.name}</p>
                  <p className="text-[10px] text-charcoal-muted">Qty: {item.quantity} · Size: {item.size}</p>
                </div>
                <div className="text-xs font-semibold text-charcoal">
                  ₹{item.product.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-line space-y-2 text-xs text-charcoal-soft">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-charcoal">₹{cartSubtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="font-semibold text-charcoal">
                {shippingCharge === 0 ? <span className="text-emerald-700">FREE</span> : `₹${shippingCharge}`}
              </span>
            </div>
            <div className="pt-2 border-t border-line flex justify-between text-base font-semibold text-charcoal">
              <span>Total Payable</span>
              <span>₹{finalTotal}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-charcoal-soft pt-2">
            <Lock className="w-3.5 h-3.5 text-lavender-700" />
            <span>100% Encrypted & Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
