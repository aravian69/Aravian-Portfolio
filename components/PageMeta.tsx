'use client';

import { usePathname } from 'next/navigation';
import { useLayoutEffect } from 'react';

// Maps Next.js route to the data-page value used for bgWash CSS. Keyed on the
// first segment, so /work/<category> and a project's page /p/<id> (both the
// Work grid) keep the Work wash instead of dropping to the default.
function routeToPage(pathname: string): string {
  const section = pathname.split('/')[1];
  if (!section) return 'home';
  return section === 'p' ? 'work' : section;
}

export default function PageMeta() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const page = routeToPage(pathname);
    document.documentElement.dataset.page = page;
  }, [pathname]);

  return null;
}
