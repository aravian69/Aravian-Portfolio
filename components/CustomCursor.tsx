'use client';

import { useEffect, useRef } from 'react';

const RING_LERP      = 0.11; // trailing smoothness (0 = frozen, 1 = instant)
const CONVERGE_PX    = 0.05; // stop lerping when this close to target

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only engage on pointer-capable (non-touch) devices
    if (!window.matchMedia('(hover: hover)').matches) return;

    const dot  = dotRef.current!;
    const ring = ringRef.current!;

    let x = 0, y = 0;
    let rx = 0, ry = 0;
    let raf: number;
    let shown = false;
    let moving = false;

    const show = () => {
      if (shown) return;
      shown = true;
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    };

    const hide = () => {
      shown = false;
      dot.style.opacity  = '0';
      ring.style.opacity = '0';
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate(${x}px,${y}px)`;
      show();
      if (!moving) {
        moving = true;
        raf = requestAnimationFrame(tick);
      }
    };

    // Ring trails with lerp; stops when converged to save GPU work
    const tick = () => {
      rx += (x - rx) * RING_LERP;
      ry += (y - ry) * RING_LERP;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      if (Math.abs(x - rx) > CONVERGE_PX || Math.abs(y - ry) > CONVERGE_PX) {
        raf = requestAnimationFrame(tick);
      } else {
        moving = false;
      }
    };

    // Expand ring when hovering interactive elements
    const onOver = (e: MouseEvent) => {
      const el = e.target as Element;
      const interactive = !!el.closest(
        'a, button, .masonry-item, .filter-tab, .back-to-top, .theme-toggle, .slideshow-btn, .modal-close'
      );
      ring.classList.toggle('cursor-hover', interactive);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseleave', hide);
    document.addEventListener('mouseenter', show);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseleave', hide);
      document.removeEventListener('mouseenter', show);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
