import type { Metadata } from 'next';
import { Syne, Figtree, Syne_Mono } from 'next/font/google';

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
        {/* Warm the DNS + TLS handshake to Bunny's CDN (videos/thumbnails) and
            Cloudinary (images) so the first hover/click request isn't cold. */}
        <link rel="preconnect" href="https://vz-cbc45619-72d.b-cdn.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vz-cbc45619-72d.b-cdn.net" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <script dangerouslySetInnerHTML={{ __html: ANTI_FOUC }} />
      </head>
      <body>
        {children}
        <div id="modal-root" />
      </body>
    </html>
  );
}
