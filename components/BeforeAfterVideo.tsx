'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Before/after video comparison. Two muted, looping videos play in sync; the
 * top ("before") layer is clipped to a draggable divider so the viewer wipes
 * between the raw plate and the final composite in real time.
 *
 * Both sources must be DIRECT video files (e.g. Bunny's MP4-fallback .mp4
 * URLs), not iframe embeds — iframes can't be clipped or kept in sync.
 */
export default function BeforeAfterVideo({
  beforeSrc,
  afterSrc,
  portrait = false,
  beforeLabel = 'Before',
  afterLabel = 'After',
}: {
  beforeSrc: string;
  afterSrc: string;
  portrait?: boolean;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLVideoElement>(null);
  const afterRef = useRef<HTMLVideoElement>(null);
  const draggingRef = useRef(false);
  const [pos, setPos] = useState(50); // divider position, % from left

  // Keep the two videos locked together — the "after" video is the master and
  // the "before" video is nudged back into sync whenever it drifts.
  useEffect(() => {
    const a = afterRef.current;
    const b = beforeRef.current;
    if (!a || !b) return;
    let raf = 0;
    const tick = () => {
      if (b.readyState >= 2 && a.readyState >= 2 && Math.abs(b.currentTime - a.currentTime) > 0.12) {
        b.currentTime = a.currentTime;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const setFromClientX = (clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = ((clientX - r.left) / r.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  };

  return (
    <div
      ref={wrapRef}
      className={`ba-wrap${portrait ? ' ba-portrait' : ''}`}
      role="slider"
      aria-label="Drag to compare before and after"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      tabIndex={0}
      onPointerDown={(e) => {
        draggingRef.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => { if (draggingRef.current) setFromClientX(e.clientX); }}
      onPointerUp={() => { draggingRef.current = false; }}
      onPointerCancel={() => { draggingRef.current = false; }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); setPos((p) => Math.max(0, p - 3)); }
        if (e.key === 'ArrowRight') { e.preventDefault(); setPos((p) => Math.min(100, p + 3)); }
      }}
    >
      <video
        ref={afterRef}
        className="ba-video"
        src={afterSrc}
        autoPlay
        muted
        loop
        playsInline
      />
      <video
        ref={beforeRef}
        className="ba-video ba-video-top"
        src={beforeSrc}
        autoPlay
        muted
        loop
        playsInline
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />
      <span className="ba-label ba-label-before">{beforeLabel}</span>
      <span className="ba-label ba-label-after">{afterLabel}</span>
      <div className="ba-divider" style={{ left: `${pos}%` }} aria-hidden="true">
        <div className="ba-handle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="11 7 6 12 11 17" />
            <polyline points="13 7 18 12 13 17" />
          </svg>
        </div>
      </div>
    </div>
  );
}
