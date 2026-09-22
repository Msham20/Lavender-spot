import './globals.css';
import type { Metadata } from 'next';
import { CartProvider } from '@/lib/store/cart-context';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import Toast from '@/components/Toast';

export const metadata: Metadata = {
  title: 'Lavender Spot — Beauty That Feels Like You',
  description: 'Discover thoughtfully crafted skincare and beauty essentials made to elevate your everyday routine.',
  keywords: ['Lavender Spot', 'Beauty', 'Skincare', 'Cosmetics', 'Luxury Beauty', 'Serums', 'Moisturizer'],
  openGraph: {
    title: 'Lavender Spot — Beauty That Feels Like You',
    description: 'Discover thoughtfully crafted skincare and beauty essentials made to elevate your everyday routine.',
    siteName: 'Lavender Spot',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main className="min-h-screen pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileBottomNav />
          <Toast />
        </CartProvider>
      </body>
    </html>
  );
}
