import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import { Analytics } from '@vercel/analytics/next';
import UpdateBanner from '@/components/UpdateBanner';
import KakaoScript from '@/components/KakaoScript';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: '읽었나?',
  description: '나만의 서재 앱',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white">
        <UpdateBanner />
        <KakaoScript />
        <Providers>{children}</Providers>
        <Toaster position="top-center" duration={2000} />
        <Analytics />
      </body>
    </html>
  );
}
