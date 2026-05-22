import type { Metadata } from 'next';
import { Syne, Figtree, Syne_Mono } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import BackgroundVideo from '@/components/BackgroundVideo';
import PageMeta from '@/components/PageMeta';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import TransitionLoader from '@/components/TransitionLoader';

const syne = Syne({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-syne', display: 'swap' });
const figtree = Figtree({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-figtree', display: 'swap' });
const syneMono = Syne_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-syne-mono', display: 'swap' });

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon.svg',
  },
  title: 'Abdul Aziz — VFX, Motion & AI',
  description:
    'VFX artist, motion designer, and AI video creator based in Jakarta. Specialising in color grading, motion graphics, and cinematic visual storytelling.',
  metadataBase: new URL('https://www.rav709.site'),
  openGraph: {
    title: 'Abdul Aziz — VFX, Motion & AI',
    description:
      'VFX artist, motion designer, and AI video creator based in Jakarta. Specialising in color grading, motion graphics, and cinematic visual storytelling.',
    url: 'https://www.rav709.site',
    siteName: 'Abdul Aziz Portfolio',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Abdul Aziz — VFX, Motion & AI',
    description:
      'VFX artist, motion designer, and AI video creator based in Jakarta. Specialising in color grading, motion graphics, and cinematic visual storytelling.',
    creator: '@aziizaravian',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.rav709.site',
  },
};

// Anti-FOUC: runs before React hydrates — reads localStorage theme and sets data-theme on <html>
const ANTI_FOUC = `(function(){var t=localStorage.getItem('aa-theme')||(window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark');document.documentElement.setAttribute('data-theme',t)})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${syne.variable} ${figtree.variable} ${syneMono.variable}`}>
      <head suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: ANTI_FOUC }} />
      </head>
      <body>
        <CustomCursor />
        <TransitionLoader />
        <div className="theme-glitch" aria-hidden="true" />
        <PageMeta />
        <BackgroundVideo />
        <div id="app">
          <Nav />
          {children}
          <Footer />
        </div>
        <div id="modal-root" />
      </body>
    </html>
  );
}
