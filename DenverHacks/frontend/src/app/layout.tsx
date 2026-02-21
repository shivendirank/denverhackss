import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ScrollProgress } from '@/components/ui/scroll-progress';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Maat — AI Agent Trust Layer',
  description:
    'Production-grade AI Agent Trust & Payment Layer. Autonomous identity, reputation, and settlement infrastructure.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <ScrollProgress />
        {children}
      </body>
    </html>
  );
}
