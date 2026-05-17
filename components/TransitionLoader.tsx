'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type Phase = 'hidden' | 'in' | 'out';

const INITIAL_MS = 600; // hold on page load/refresh
const NAV_MS     = 700; // hold on navigation
const HIDE_MS    = 480; // wait for exit animation before unmounting

export default function TransitionLoader() {
  const pathname  = usePathname();
  const [phase, setPhase] = useState<Phase>('in');
  const prevPath  = useRef(pathname);
  const timer     = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Add/remove a body class so the custom cursor hides during loading
  useEffect(() => {
    if (phase === 'in') {
      document.body.classList.add('is-loading');
    } else {
      document.body.classList.remove('is-loading');
    }
  }, [phase]);

  // On first mount (page load / refresh) → hold briefly then exit
  useEffect(() => {
    timer.current = setTimeout(() => setPhase('out'), INITIAL_MS);
    return () => clearTimeout(timer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When pathname actually changes → start exit
  useEffect(() => {
    if (phase === 'in' && prevPath.current !== pathname) {
      prevPath.current = pathname;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setPhase('out'), NAV_MS);
    }
    return () => clearTimeout(timer.current);
  }, [pathname, phase]);

  // After exit animation → hide
  useEffect(() => {
    if (phase === 'out') {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setPhase('hidden'), HIDE_MS);
    }
    return () => clearTimeout(timer.current);
  }, [phase]);

  // Intercept clicks on any link that leads to /work
  useEffect(() => {
    const onLinkClick = (e: MouseEvent) => {
      const link = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute('href');
      if (href === '/work' && pathname !== '/work') {
        setPhase('in');
      }
    };
    document.addEventListener('click', onLinkClick);
    return () => document.removeEventListener('click', onLinkClick);
  }, [pathname]);

  if (phase === 'hidden') return null;

  return (
    <div className={`tl-overlay${phase === 'out' ? ' tl-out' : ''}`} aria-hidden="true">
      {/* film-frame corners */}
      <span className="tl-c tl-tl" />
      <span className="tl-c tl-tr" />
      <span className="tl-c tl-bl" />
      <span className="tl-c tl-br" />

      <div className="tl-body">
        <div className="tl-track">
          <div className="tl-fill" />
        </div>
        <span className="tl-label">Portfolio</span>
      </div>
    </div>
  );
}
