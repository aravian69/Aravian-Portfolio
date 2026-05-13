'use client';

import { usePathname } from 'next/navigation';
import { useLayoutEffect } from 'react';

// Maps Next.js route to the data-page value used for bgWash CSS
function routeToPage(pathname: string): string {
  if (pathname === '/') return 'home';
  return pathname.replace(/^\//, ''); // '/work' -> 'work'
}

export default function PageMeta() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const page = routeToPage(pathname);
    document.documentElement.dataset.page = page;
  }, [pathname]);

  return null;
}
