import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import { Analytics } from '@vercel/analytics/next';
import UpdateBanner from '@/components/UpdateBanner';
import KakaoSDK from '@/components/KakaoSDK';

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
        <KakaoSDK />
        <UpdateBanner />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
