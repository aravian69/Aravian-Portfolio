'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Custom brand dropdown — a native <select> renders the OS-styled (white) list,
 * which clashes with the dark theme. This is a styled button + panel with
 * click-outside and Escape to close.
 */
export default function BrandSelect({
  brands,
  value,
  onChange,
}: {
  brands: [string, string][]; // [slug, displayName]
  value: string; // active slug ('' = all)
  onChange: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeName = (value && brands.find(([s]) => s === value)?.[1]) || 'All brands';

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (slug: string) => { onChange(slug); setOpen(false); };

  return (
    <div className={`brand-select${value ? ' active' : ''}`} ref={ref}>
      <button
        type="button"
        className="brand-select-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 4h18v3l-7 7v6l-4-2v-4L3 7z" />
        </svg>
        <span className="brand-select-label">{activeName}</span>
        <svg className={`brand-chevron${open ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul className="brand-menu" role="listbox" aria-label="Filter by brand">
          <li role="option" aria-selected={!value}>
            <button type="button" className={`brand-option${!value ? ' active' : ''}`} onClick={() => pick('')}>
              All brands
            </button>
          </li>
          {brands.map(([slug, name]) => (
            <li key={slug} role="option" aria-selected={value === slug}>
              <button type="button" className={`brand-option${value === slug ? ' active' : ''}`} onClick={() => pick(slug)}>
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
