'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CATEGORIES, Project } from '@/lib/projects';
import { HUE_ORDER } from '@/lib/hueOrder';
import BeforeAfterVideo from '@/components/BeforeAfterVideo';


function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const compare = project.beforeVideoUrl && project.afterVideoUrl
    ? { before: project.beforeVideoUrl, after: project.afterVideoUrl }
    : null;
  const slides = project.images && project.images.length > 0 ? project.images : null;
  // Native video sizes to its own aspect ratio; the wrapper shrink-wraps it.
  const showFitVideo = !compare && !!project.directVideoUrl;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Move focus into the dialog on open, restore it to the trigger on close.
  useEffect(() => {
    const prevFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => prevFocused?.focus?.();
  }, []);

  useEffect(() => {
    setSlideIdx(0);
  }, [project.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (slides) {
        if (e.key === 'ArrowRight') setSlideIdx((i) => (i + 1) % slides.length);
        if (e.key === 'ArrowLeft')  setSlideIdx((i) => (i - 1 + slides.length) % slides.length);
      }
      // Trap Tab focus within the dialog's controls.
      if (e.key === 'Tab') {
        const focusables = overlayRef.current?.querySelectorAll<HTMLElement>('button');
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, slides]);

  if (!mounted) return null;

  const target = document.getElementById('modal-root') ?? document.body;
  const next = () => slides && setSlideIdx((i) => (i + 1) % slides.length);
  const prev = () => slides && setSlideIdx((i) => (i - 1 + slides.length) % slides.length);

  return createPortal(
    <div
      ref={overlayRef}
      className="modal-overlay open"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title}${project.desc ? ` — ${project.desc}` : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`modal-inner project-modal-inner${
          showFitVideo ? ' project-modal-fit' : project.ratio === 'portrait' ? ' project-modal-portrait' : ''
        }`}
      >
        {compare ? (
          <BeforeAfterVideo
            beforeSrc={compare.before}
            afterSrc={compare.after}
            portrait={project.ratio === 'portrait'}
          />
        ) : project.directVideoUrl ? (
          // Native video: starts immediately (no iframe-player bootstrap) and is
          // usually already cached from the grid-card hover. Sizes to its own
          // aspect ratio (16:9, 4:5, square, vertical) — no forced shape.
          <video
            src={project.directVideoUrl}
            poster={project.thumbnail ?? undefined}
            className="project-modal-video"
            controls
            autoPlay
            playsInline
          />
        ) : project.videoUrl ? (
          <iframe
            src={project.videoUrl}
            title={`${project.title}${project.desc ? ` — ${project.desc}` : ''}`}
            className={`project-modal-iframe${project.ratio === 'portrait' ? ' project-modal-iframe-portrait' : ''}`}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : slides ? (
          <div className="project-modal-slideshow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slides[slideIdx]}
              alt={`${project.title} — ${slideIdx + 1} of ${slides.length}`}
              className={`project-modal-image${project.ratio === 'portrait' ? ' project-modal-image-portrait' : ''}`}
              key={slides[slideIdx]}
              loading="lazy"
              decoding="async"
            />
            <button
              type="button"
              className="slideshow-btn slideshow-prev"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              className="slideshow-btn slideshow-next"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next image"
            >
              ›
            </button>
            <div className="slideshow-counter">
              {slideIdx + 1} / {slides.length}
            </div>
          </div>
        ) : project.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.thumbnail}
            alt={`${project.title}${project.desc ? ` — ${project.desc}` : ''}`}
            className={`project-modal-image${project.ratio === 'portrait' ? ' project-modal-image-portrait' : ''}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="project-modal-thumb">
            <div className="project-modal-placeholder">
              <span className="project-modal-cat">{project.cat}</span>
              <span className="project-modal-label">● {project.title}</span>
              <span className="project-modal-sub">Drop your embed or media here</span>
            </div>
          </div>
        )}
      </div>
      <div className="project-modal-meta">
        <span className="project-modal-title">{project.title}</span>
        <ul className="project-modal-facts">
          <li>{CATEGORIES.find((c) => c.id === project.cat)?.label ?? project.cat}</li>
          {project.desc && <li>{project.desc}</li>}
          {project.tools && <li>{project.tools}</li>}
          {project.year && <li>{project.year}</li>}
        </ul>
      </div>
      <button ref={closeRef} className="modal-close" onClick={onClose}>✕ &nbsp; Close</button>
    </div>,
    target
  );
}

// ── Layout constants ──────────────────────────────────────────────────────
const CARD_STAGGER_MS    = 35;   // animation delay per card
// Cap the stagger so the entrance finishes in <1s instead of dragging across all
// ~95 cards (which kept the compositor busy for 5s and made the cursor lag on
// open). Cards past the cap share the max delay — they're off-screen anyway.
const CARD_STAGGER_CAP   = 14;
const TILT_PERSPECTIVE   = 700;  // px
const TILT_MULTIPLIER    = 3.5;  // deg
const TILT_SCALE         = 1.015;
const HUE_FALLBACK       = 9999; // ids missing from HUE_ORDER sort to the end

// Breakpoint → column count
const COL_BREAKPOINTS: [number, number][] = [
  [480,  2],
  [768,  3],
  [1100, 4],
  [1440, 5],
];

export default function MasonryGrid({ projects }: { projects: Project[] }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selected, setSelected] = useState<Project | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useRef(false);

  // Detect reduced-motion once so hover video-previews can be skipped for it.
  useEffect(() => {
    reduceMotion.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }, []);

  // Scroll to top of grid area whenever the filter changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeFilter]);

  // Expose the active category so CSS can shift the page ambiance per filter
  // (subtle glow hue behind the header — range reads as depth, not scatter).
  useEffect(() => {
    document.documentElement.dataset.workCat = activeFilter;
    return () => { delete document.documentElement.dataset.workCat; };
  }, [activeFilter]);

  // Order is precomputed in lib/hueOrder.ts (see scripts/compute-hues.mjs), so
  // it's identical on the server and client and never changes after mount —
  // the grid paints its final order on first render, no async re-sort flash.
  const filtered = useMemo(() => {
    const base = activeFilter === 'all'
      ? projects
      : projects.filter((p) => p.cat === activeFilter);
    return [...base].sort(
      (a, b) => (HUE_ORDER[a.id] ?? HUE_FALLBACK) - (HUE_ORDER[b.id] ?? HUE_FALLBACK)
    );
  }, [activeFilter, projects]);

  // Lazily apply thumbnail backgrounds as cards approach the viewport, so a
  // grid of ~90 items doesn't request every image up front.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const thumbs = grid.querySelectorAll<HTMLElement>('[data-bg]');
    const reveal = (el: HTMLElement) => {
      if (el.dataset.bg) el.style.backgroundImage = `url(${el.dataset.bg})`;
    };
    if (!('IntersectionObserver' in window)) {
      thumbs.forEach(reveal);
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { reveal(e.target as HTMLElement); obs.unobserve(e.target); }
      });
    }, { rootMargin: '400px' });
    thumbs.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [filtered]);

  // Pinterest-style column-based masonry: each item is absolutely positioned
  // into the column (or pair of columns, for landscape) with the lowest
  // current top edge. Truly gap-free for mixed-width / mixed-height items.
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const colsForWidth = (w: number) => {
      const match = COL_BREAKPOINTS.find(([bp]) => w <= bp);
      return match ? match[1] : 6;
    };

    const apply = () => {
      const cs = getComputedStyle(grid);
      const padL = parseFloat(cs.paddingLeft) || 0;
      const padR = parseFloat(cs.paddingRight) || 0;
      const padT = parseFloat(cs.paddingTop) || 0;
      const innerW = grid.clientWidth - padL - padR;
      const gap = 14;

      const cols = colsForWidth(grid.clientWidth);
      const colW = (innerW - gap * (cols - 1)) / cols;
      const heights = new Array(cols).fill(0);

      // Landscape / square items get span-2 (big), portraits stay span-1.
      // Separate writes from reads to avoid layout thrashing: set every width
      // first, read all heights in one batch, then position. Heights stay valid
      // because item height depends only on width (CSS aspect-ratio), not on
      // where the item is placed.
      const items = [...grid.querySelectorAll<HTMLElement>('.masonry-item')];
      const spans = items.map((el) =>
        Math.min(el.classList.contains('masonry-item-landscape') ? 2 : 1, cols)
      );
      items.forEach((el, i) => {
        const span = spans[i];
        el.style.width = `${colW * span + gap * (span - 1)}px`;
      });
      const measuredHeights = items.map((el) => el.offsetHeight);
      items.forEach((el, i) => {
        const span = spans[i];

        let bestCol = 0;
        let bestH = Infinity;
        for (let c = 0; c <= cols - span; c++) {
          const h = Math.max(...heights.slice(c, c + span));
          if (h < bestH) { bestH = h; bestCol = c; }
        }

        el.style.left = `${padL + bestCol * (colW + gap)}px`;
        el.style.top = `${padT + bestH}px`;

        const newH = bestH + measuredHeights[i] + gap;
        for (let c = bestCol; c < bestCol + span; c++) heights[c] = newH;
      });

      // Backfill any leftover column space with brand-color spacer blocks.
      // Re-use existing .grid-spacer DOM nodes so React doesn't fight us.
      const spacerRoot = grid.querySelector<HTMLElement>('.grid-spacer-layer');
      if (spacerRoot) spacerRoot.innerHTML = '';
      const maxH = Math.max(...heights);
      if (spacerRoot) {
        for (let c = 0; c < cols; c++) {
          let cursor = heights[c];
          while (maxH - cursor > colW * 0.5) {
            // Decide spacer shape: square if room, else short rectangle
            const remaining = maxH - cursor - gap;
            const spacerH = Math.min(colW, remaining);
            const block = document.createElement('div');
            block.className = `grid-spacer grid-spacer-${(c + Math.floor(cursor / 100)) % 2 === 0 ? 'lime' : 'plum'}`;
            block.style.width = `${colW}px`;
            block.style.height = `${spacerH}px`;
            block.style.left = `${padL + c * (colW + gap)}px`;
            block.style.top = `${padT + cursor}px`;
            spacerRoot.appendChild(block);
            cursor += spacerH + gap;
          }
        }
      }

      const totalH = maxH - gap;
      grid.style.height = `${padT + Math.max(0, totalH) + (parseFloat(cs.paddingBottom) || 0)}px`;
    };

    // Reveal with the card animation (page load, filter change, resize).
    grid.classList.remove('is-laid');
    grid.style.visibility = 'hidden';
    void grid.offsetHeight; // force a reflow so the browser registers the removal
    apply();
    grid.style.visibility = ''; // clear inline override so the CSS rule on .is-laid takes over
    grid.classList.add('is-laid');

    const ro = new ResizeObserver(() => {
      // Skip repositioning during theme transitions — causes jitter on the work page
      if (document.documentElement.classList.contains('theme-transitioning')) return;
      apply();
    });
    ro.observe(grid);
    grid.querySelectorAll<HTMLElement>('.item-thumb').forEach((t) => ro.observe(t));

    return () => ro.disconnect();
  }, [filtered]);

  // Thumbnails are applied lazily by the IntersectionObserver effect above, so
  // the grid doesn't fire ~90 image requests on first paint. Height comes from
  // aspect-ratio in CSS, so deferring the image never shifts the layout.
  function thumbSrc(item: Project) {
    return item.thumbnail ?? item.images?.[0] ?? null;
  }

  return (
    <>
      <div className="filter-tabs">
        {CATEGORIES.map(({ id, label }) => (
          <button
            key={id}
            className={`filter-tab${activeFilter === id ? ' active' : ''}`}
            onClick={() => setActiveFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="placeholder-grid">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="placeholder-tile">
              <div className="item-media">
                <div className="item-caption">
                  <div className="item-cat">More work soon</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="masonry-grid"
          ref={gridRef}
          style={{ visibility: 'hidden' }}
        >
          <div className="grid-spacer-layer" aria-hidden="true" />
          {filtered.map((item, idx) => (
            <div
              key={`${activeFilter}-${item.id}`}
              className={`masonry-item${item.ratio !== 'portrait' ? ' masonry-item-landscape' : ''}`}
              style={{ animationDelay: `${Math.min(idx, CARD_STAGGER_CAP) * CARD_STAGGER_MS}ms` }}
              role="button"
              tabIndex={0}
              aria-label={`Open ${item.title}${item.desc ? ` — ${item.desc}` : ''} (${item.cat})`}
              onClick={() => setSelected(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(item); }
              }}
              onMouseEnter={(e) => {
                // Play the real 720p footage on hover so the card shows sharp
                // motion. Loads lazily on first hover (src set on demand); the
                // thumbnail poster covers the brief buffer with no flash.
                if (reduceMotion.current) return;
                const vid = e.currentTarget.querySelector<HTMLVideoElement>('.item-thumb-video');
                const src = vid?.dataset.src;
                if (!vid || !src) return;
                if (!vid.src) vid.src = src;
                vid.classList.add('is-playing');
                vid.play().catch(() => {});
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const dx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
                const dy = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
                e.currentTarget.style.transform =
                  `perspective(${TILT_PERSPECTIVE}px) rotateX(${-dy * TILT_MULTIPLIER}deg) rotateY(${dx * TILT_MULTIPLIER}deg) scale(${TILT_SCALE})`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                const vid = e.currentTarget.querySelector<HTMLVideoElement>('.item-thumb-video');
                if (vid) { vid.classList.remove('is-playing'); vid.pause(); }
              }}
            >
              <div className="item-media">
                <div
                  className={`item-thumb ${item.ratio}`}
                  data-bg={thumbSrc(item) ?? undefined}
                  style={thumbSrc(item)
                    ? { backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: 'var(--surface)' }}
                />
                {/* Blurred duplicate — masked to bottom, creates gradient-blur effect */}
                <div
                  className="item-thumb-blur"
                  data-bg={thumbSrc(item) ?? undefined}
                  style={thumbSrc(item) ? undefined : { background: 'var(--surface)' }}
                />
                {item.directVideoUrl && (
                  <video
                    className="item-thumb-video"
                    data-src={item.directVideoUrl}
                    poster={thumbSrc(item) ?? undefined}
                    muted
                    loop
                    playsInline
                    preload="none"
                    aria-hidden="true"
                  />
                )}
                {item.beforeVideoUrl && item.afterVideoUrl && (
                  <div className="item-ba-badge" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <polyline points="7 10 5 12 7 14" />
                      <polyline points="17 10 19 12 17 14" />
                    </svg>
                    <span>Before / After</span>
                  </div>
                )}
                {item.images && item.images.length > 1 && (
                  <div className="item-stack-badge" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="14" height="14" rx="2" />
                      <rect x="7" y="7" width="14" height="14" rx="2" />
                    </svg>
                    <span>{item.images.length}</span>
                  </div>
                )}
                <div className="item-caption">
                  <div className="item-cat">{item.cat}</div>
                  <div className="item-title">{item.title}</div>
                  {item.desc && <div className="item-desc">{item.desc}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <ProjectModal project={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
