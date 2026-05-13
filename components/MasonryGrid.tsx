'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CATEGORIES, Project, projects } from '@/lib/projects';


function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);

  const slides = project.images && project.images.length > 0 ? project.images : null;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
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
      className="modal-overlay open"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`modal-inner project-modal-inner${project.ratio === 'portrait' ? ' project-modal-portrait' : ''}`}>
        {project.videoUrl ? (
          <iframe
            src={project.videoUrl}
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
        <span className="project-modal-tag">{project.desc ?? project.cat}</span>
      </div>
      <button className="modal-close" onClick={onClose}>✕ &nbsp; Close</button>
    </div>,
    target
  );
}

// Deterministic hash so the order is stable per id (no re-shuffle on render)
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ── Layout constants ──────────────────────────────────────────────────────
const SWATCH_SIZE        = 24;   // canvas px for color sampling
const LUMA_MIN           = 18;   // skip near-black pixels in swatch
const LUMA_WEIGHT_SCALE  = 32;   // divisor for per-pixel weight
const SAT_GRAY_THRESHOLD = 0.12; // below this → grayscale bucket
const CARD_STAGGER_MS    = 55;   // animation delay per card
const TILT_PERSPECTIVE   = 700;  // px
const TILT_MULTIPLIER    = 3.5;  // deg
const TILT_SCALE         = 1.015;
const THEME_TRANSITION_MS = 650; // must match Nav.tsx

// Breakpoint → column count
const COL_BREAKPOINTS: [number, number][] = [
  [480,  2],
  [768,  3],
  [1100, 4],
  [1440, 5],
];

// ── Color extraction (for "All" sort by hue) ─────────────────────────────
type Swatch = { hue: number; sat: number; light: number };

function rgbToHsl(r: number, g: number, b: number): Swatch {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0, s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { hue: h, sat: s, light: l };
}

const swatchCache = new Map<string, Swatch>();

function extractSwatch(url: string): Promise<Swatch> {
  if (swatchCache.has(url)) return Promise.resolve(swatchCache.get(url)!);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = SWATCH_SIZE;
        canvas.height = SWATCH_SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('no ctx'));
        ctx.drawImage(img, 0, 0, SWATCH_SIZE, SWATCH_SIZE);
        const { data } = ctx.getImageData(0, 0, SWATCH_SIZE, SWATCH_SIZE);
        // Weighted average — skip near-black pixels so tone-on-tone film stills
        // are categorised by their accent color, not by their letterbox.
        let r = 0, g = 0, b = 0, weight = 0;
        for (let i = 0; i < data.length; i += 4) {
          const pr = data[i], pg = data[i + 1], pb = data[i + 2];
          const luma = (pr + pg + pb) / 3;
          if (luma < LUMA_MIN) continue;
          const w = Math.min(luma / LUMA_WEIGHT_SCALE, 1);
          r += pr * w; g += pg * w; b += pb * w; weight += w;
        }
        if (weight === 0) return reject(new Error('all dark'));
        r /= weight; g /= weight; b /= weight;
        const sw = rgbToHsl(r, g, b);
        swatchCache.set(url, sw);
        resolve(sw);
      } catch (e) { reject(e); }
    };
    img.onerror = () => reject(new Error('load fail'));
    img.src = url;
  });
}

// Compose a sort key: low-saturation thumbs (grayscale-ish) end up in their own
// hue band so they don't scatter randomly through the spectrum.
function sortKey(sw: Swatch | undefined): number {
  if (!sw) return 9999;
  if (sw.sat < SAT_GRAY_THRESHOLD) return 360 + sw.light * 100; // tail bucket, sorted by lightness
  return sw.hue;
}

// Shuffle deterministically, then bias so adjacent items don't repeat the same ratio
function shuffleMixed(items: Project[]): Project[] {
  const sorted = [...items].sort((a, b) => hash(a.id) - hash(b.id));
  const result: Project[] = [];
  const pool = [...sorted];
  while (pool.length) {
    const last = result[result.length - 1];
    let pickIdx = 0;
    if (last) {
      // prefer first item in pool whose ratio differs from last
      const diff = pool.findIndex((p) => p.ratio !== last.ratio);
      pickIdx = diff === -1 ? 0 : diff;
    }
    result.push(pool.splice(pickIdx, 1)[0]);
  }
  return result;
}

export default function MasonryGrid() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selected, setSelected] = useState<Project | null>(null);
  const [swatches, setSwatches] = useState<Map<string, Swatch>>(new Map());
  const gridRef = useRef<HTMLDivElement>(null);
  // When true, the next useLayoutEffect run is a swatch-sort re-layout only —
  // skip the animation reset so items silently move to their new positions.
  const swatchSortRef = useRef(false);

  // Extract swatches for every thumbnail once, on mount. Cached.
  useEffect(() => {
    let cancelled = false;
    const targets = projects.filter((p) => p.thumbnail);
    Promise.allSettled(
      targets.map((p) => extractSwatch(p.thumbnail!).then((sw) => [p.id, sw] as const))
    ).then((results) => {
      if (cancelled) return;
      const next = new Map<string, Swatch>();
      results.forEach((r) => {
        if (r.status === 'fulfilled') next.set(r.value[0], r.value[1]);
      });
      if (next.size > 0) {
        swatchSortRef.current = true; // next layout is a silent swatch re-sort
        setSwatches(next);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Scroll to top of grid area whenever the filter changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeFilter]);

  const filtered = useMemo(() => {
    const base = activeFilter === 'all'
      ? projects
      : projects.filter((p) => p.cat === activeFilter);
    if (swatches.size > 0) {
      return [...base].sort((a, b) => sortKey(swatches.get(a.id)) - sortKey(swatches.get(b.id)));
    }
    return shuffleMixed(base);
  }, [activeFilter, swatches]);

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
      const gap = 8;

      const cols = colsForWidth(grid.clientWidth);
      const colW = (innerW - gap * (cols - 1)) / cols;
      const heights = new Array(cols).fill(0);

      // Landscape / square items get span-2 (big), portraits stay span-1.
      const items = grid.querySelectorAll<HTMLElement>('.masonry-item');
      items.forEach((el) => {
        const isWide = el.classList.contains('masonry-item-landscape');
        const span = Math.min(isWide ? 2 : 1, cols);

        let bestCol = 0;
        let bestH = Infinity;
        for (let c = 0; c <= cols - span; c++) {
          const h = Math.max(...heights.slice(c, c + span));
          if (h < bestH) {
            bestH = h;
            bestCol = c;
          }
        }

        const itemW = colW * span + gap * (span - 1);
        const x = padL + bestCol * (colW + gap);
        const y = padT + bestH;

        el.style.width = `${itemW}px`;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;

        const measured = el.offsetHeight;
        const newH = bestH + measured + gap;
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

    const isSilentSort = swatchSortRef.current;
    swatchSortRef.current = false;

    if (isSilentSort) {
      // Swatch-driven re-sort: items are already visible and animated in.
      // Just reposition them silently — no animation reset.
      apply();
    } else {
      // Full reveal with animation replay (page load, filter change, resize).
      grid.classList.remove('is-laid');
      grid.style.visibility = 'hidden';
      void grid.offsetHeight; // force a reflow so the browser registers the removal
      apply();
      grid.style.visibility = ''; // clear inline override so the CSS rule on .is-laid takes over
      grid.classList.add('is-laid');
    }

    const ro = new ResizeObserver(apply);
    ro.observe(grid);
    grid.querySelectorAll<HTMLElement>('.item-thumb').forEach((t) => ro.observe(t));

    return () => ro.disconnect();
  }, [filtered]);

  function getThumbStyle(item: Project) {
    const src = item.thumbnail ?? item.images?.[0];
    if (src) {
      return { backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    return { background: '#131313' };
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
        <div className="grid-coming-soon">
          <span className="grid-coming-dot" aria-hidden="true" />
          <p className="grid-coming-label">More work coming soon</p>
          <p className="grid-coming-sub">This section is being updated — check back shortly.</p>
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
              style={{ animationDelay: `${idx * CARD_STAGGER_MS}ms` }}
              onClick={() => setSelected(item)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const dx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
                const dy = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
                e.currentTarget.style.transform =
                  `perspective(${TILT_PERSPECTIVE}px) rotateX(${-dy * TILT_MULTIPLIER}deg) rotateY(${dx * TILT_MULTIPLIER}deg) scale(${TILT_SCALE})`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
              }}
            >
              <div className="item-media">
                <div
                  className={`item-thumb ${item.ratio}`}
                  style={getThumbStyle(item)}
                />
                {item.images && item.images.length > 1 && (
                  <div className="item-stack-badge" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="14" height="14" rx="2" />
                      <rect x="7" y="7" width="14" height="14" rx="2" />
                    </svg>
                    <span>{item.images.length}</span>
                  </div>
                )}
                <div className="item-view-hint" aria-hidden="true">
                  {item.videoUrl ? 'Play' : 'View'}
                </div>
              </div>
              <div className="item-caption">
                <div className="item-title">{item.title}</div>
                <div className="item-cat">{item.desc ?? item.cat}</div>
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
