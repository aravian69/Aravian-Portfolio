'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Site-wide "available for projects" pill, fixed bottom-left, linking to
 * contact. Hidden on home (which has its own inline availability line) and on
 * contact itself (redundant there).
 */
export default function AvailabilityBadge() {
  const pathname = usePathname();
  if (pathname === '/' || pathname.startsWith('/contact')) return null;

  return (
    <Link href="/contact" className="avail-badge" aria-label="Available for projects. Go to contact">
      <span className="avail-dot" />
      <span className="avail-badge-label">Available — Jakarta / Remote</span>
    </Link>
  );
}
