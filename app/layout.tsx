import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter, Cinzel, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' });
const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-heading' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: {
    template: 'DEVLORE — %s',
    default: 'DEVLORE — Your commits. Your legend.',
  },
  description: 'Your commits. Your legend. Transform your GitHub history into an epic fantasy saga.',
  openGraph: {
    title: 'DEVLORE',
    description: 'Transform your GitHub history into an epic fantasy saga.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DEVLORE',
    description: 'Transform your GitHub history into an epic fantasy saga.',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable} ${jetbrainsMono.variable}`}>
      <body style={{ backgroundColor: '#07070f', color: '#e0e0e0', margin: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </body>
    </html>
  );
}
