'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setAuthorized(true);
      return;
    }

    try {
      const adminSession = localStorage.getItem('lavender_spot_admin_session');
      if (!adminSession) {
        window.location.href = '/admin/login';
      } else {
        setAuthorized(true);
      }
    } catch (e) {
      window.location.href = '/admin/login';
    }
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-charcoal-muted">
        Checking admin authorization...
      </div>
    );
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('lavender_spot_admin_session');
    window.location.href = '/admin/login';
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: FolderTree },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-ivory flex flex-col md:flex-row">
      {/* Top Mobile Bar */}
      <div className="md:hidden bg-charcoal text-white px-5 py-3.5 flex justify-between items-center z-50">
        <span className="font-serif text-lg font-medium flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-lavender-400" /> Lavender Admin
        </span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-64 bg-charcoal text-ivory flex-shrink-0 flex flex-col justify-between p-6 transition-all duration-300 z-40 ${
          sidebarOpen ? 'block fixed inset-0 top-14' : 'hidden md:flex'
        }`}
      >
        <div className="space-y-8">
          <div className="hidden md:flex items-center gap-2.5 border-b border-charcoal-soft pb-5">
            <div className="w-8 h-8 rounded bg-lavender-700 flex items-center justify-center text-white font-serif">
              L
            </div>
            <div>
              <span className="font-serif text-lg font-medium tracking-wide block">Lavender Spot</span>
              <span className="text-[10px] text-lavender-300 font-semibold uppercase tracking-wider block">
                Single Admin Portal
              </span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-lavender-700 text-white shadow'
                      : 'text-ivory/80 hover:bg-charcoal-soft hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-charcoal-soft">
          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-md text-xs font-semibold text-rose-300 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Admin Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl overflow-x-hidden">{children}</main>
    </div>
  );
}
