import '../globals.css';
import Nav from '@/components/Nav';
import BackgroundVideo from '@/components/BackgroundVideo';
import PageMeta from '@/components/PageMeta';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import TransitionLoader from '@/components/TransitionLoader';
import AvailabilityBadge from '@/components/AvailabilityBadge';

// All public-facing pages live under this layout. The Keystatic admin lives
// outside it (app/keystatic) so it never inherits the site chrome or globals.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomCursor />
      <TransitionLoader />
      <PageMeta />
      <BackgroundVideo />
      <div id="app">
        <Nav />
        {children}
        <Footer />
        <AvailabilityBadge />
      </div>
    </>
  );
}
