import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';
import BackgroundVideo from '@/components/BackgroundVideo';
import PageMeta from '@/components/PageMeta';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import TransitionLoader from '@/components/TransitionLoader';

export const metadata: Metadata = {
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
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: ANTI_FOUC }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Figtree:wght@300;400;500;600&family=Syne+Mono&display=swap"
        />
      </head>
      <body>
        <CustomCursor />
        <TransitionLoader />
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
