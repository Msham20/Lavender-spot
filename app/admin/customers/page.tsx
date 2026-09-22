'use client';

import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    try {
      const storedOrders = JSON.parse(localStorage.getItem('lavender_spot_user_orders') || '[]');
      const customerMap = new Map<string, any>();

      // Populate from orders
      storedOrders.forEach((o: any) => {
        if (o.customer && o.customer.email) {
          const email = o.customer.email;
          if (!customerMap.has(email)) {
            customerMap.set(email, {
              name: o.customer.name,
              email: o.customer.email,
              phone: o.customer.phone,
              registered_at: o.created_at,
              order_count: 1,
              total_spend: o.total,
            });
          } else {
            const existing = customerMap.get(email);
            existing.order_count += 1;
            existing.total_spend += o.total;
          }
        }
      });

      // Add default mock customer if empty
      if (customerMap.size === 0) {
        customerMap.set('ananya.roy@example.com', {
          name: 'Ananya Roy',
          email: 'ananya.roy@example.com',
          phone: '9876543210',
          registered_at: new Date().toISOString(),
          order_count: 2,
          total_spend: 1938,
        });
      }

      setCustomers(Array.from(customerMap.values()));
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-line pb-4">
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-lavender-700">
          Customer Directory
        </span>
        <h1 className="text-3xl font-serif text-charcoal mt-1">Customers ({customers.length})</h1>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-line rounded-md overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-ivory border-b border-line text-charcoal-soft font-semibold">
              <th className="p-3.5">Customer Name</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">Phone</th>
              <th className="p-3.5">Registration Date</th>
              <th className="p-3.5">Total Orders</th>
              <th className="p-3.5 text-right">Lifetime Spend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {customers.map((c, i) => (
              <tr key={i} className="hover:bg-lavender-50/50 transition-colors">
                <td className="p-3.5 font-serif font-medium text-charcoal">{c.name}</td>
                <td className="p-3.5 text-charcoal-soft">{c.email}</td>
                <td className="p-3.5 text-charcoal-soft">{c.phone}</td>
                <td className="p-3.5 text-charcoal-muted">
                  {new Date(c.registered_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="p-3.5 font-semibold text-charcoal">{c.order_count} order(s)</td>
                <td className="p-3.5 text-right font-semibold text-lavender-900">₹{c.total_spend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
