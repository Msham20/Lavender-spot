'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/store/cart-context';
import { Settings, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const { showToast } = useCart();

  const [settings, setSettings] = useState({
    storeName: 'Lavender Spot',
    contactEmail: 'support@lavenderspot.com',
    contactPhone: '+91 98765 43210',
    currencySymbol: '₹',
    deliveryCharge: '79',
    freeShippingThreshold: '999',
    activeCouponCode: 'LAVENDER10',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('lavender_spot_store_settings', JSON.stringify(settings));
    showToast('Store settings saved successfully!');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Title */}
      <div className="border-b border-line pb-4">
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
          Configuration
        </span>
        <h1 className="text-3xl font-serif text-charcoal mt-1">Store Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-line rounded-md p-6 space-y-6 text-xs shadow-sm">
        <div className="space-y-4">
          <h2 className="text-base font-serif text-charcoal font-medium border-b border-line pb-2">
            General Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-charcoal-soft block mb-1">Store Brand Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3 py-2.5 border border-line rounded bg-white"
              />
            </div>
            <div>
              <label className="font-semibold text-charcoal-soft block mb-1">Support Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3 py-2.5 border border-line rounded bg-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-serif text-charcoal font-medium border-b border-line pb-2">
            Shipping & Checkout Configuration
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-charcoal-soft block mb-1">Standard Delivery Charge (₹)</label>
              <input
                type="number"
                value={settings.deliveryCharge}
                onChange={(e) => setSettings({ ...settings, deliveryCharge: e.target.value })}
                className="w-full px-3 py-2.5 border border-line rounded bg-white"
              />
            </div>
            <div>
              <label className="font-semibold text-charcoal-soft block mb-1">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                className="w-full px-3 py-2.5 border border-line rounded bg-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-lavender-700 text-white font-semibold uppercase tracking-wider rounded hover:bg-lavender-800 transition-colors flex items-center gap-1.5 shadow"
        >
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </form>
    </div>
  );
}
