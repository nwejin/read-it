import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { Analytics } from '@vercel/analytics/next';
import UpdateBanner from '@/components/UpdateBanner';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto',
});

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
    <html lang="ko" className={`${notoSansKR.variable}`}>
      <body className="min-h-screen bg-white font-[var(--font-noto)]">
        <UpdateBanner />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
