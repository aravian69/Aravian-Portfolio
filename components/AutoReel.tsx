'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import type { ReelClip } from '@/lib/projects';

const CLIP_SECONDS = 3.2; // screen time per clip
const START_AT = 1;       // skip each clip's first second (fade-ins, black frames)

/**
 * A showreel cut on the fly from the projects' own 720p clips: a few seconds of
 * each, back to back, then an end card. Stands in until a real showreel video
 * is set in the CMS. Only the current and next clip ever load.
 *
 * Tap the right of the frame (or →) for the next clip, the left (or ←) for the
 * previous one; the progress segments jump straight to a clip.
 */
export default function AutoReel({ clips }: { clips: ReelClip[] }) {
  const [idx, setIdx] = useState(0); // idx === clips.length shows the end card
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const failed = useRef(new Set<number>());
  const ended = idx >= clips.length;

  const go = useCallback((i: number) => setIdx(Math.max(0, Math.min(i, clips.length))), [clips.length]);

  // Start the active clip from START_AT, pause the others, and sync the
  // progress segments (done here, not in render, because the loop below
  // writes the active segment's width straight to the DOM).
  useEffect(() => {
    if (failed.current.has(idx)) { go(idx + 1); return; }
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === idx) {
        v.currentTime = START_AT;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
    fills.current.forEach((f, i) => {
      if (f) f.style.transform = `scaleX(${i < idx ? 1 : 0})`;
    });
  }, [idx, go]);

  // Progress follows the video's own clock, so a clip that stalls to buffer
  // simply holds instead of being cut short.
  useEffect(() => {
    if (ended) return;
    let raf = 0;
    const tick = () => {
      const v = videos.current[idx];
      if (v) {
        const p = Math.min(1, Math.max(0, v.currentTime - START_AT) / CLIP_SECONDS);
        const f = fills.current[idx];
        if (f) f.style.transform = `scaleX(${p})`;
        if (p >= 1 || v.ended) { go(idx + 1); return; }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [idx, ended, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(idx + 1);
      if (e.key === 'ArrowLeft') go(idx - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, go]);

  const onStageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (ended) return;
    const r = e.currentTarget.getBoundingClientRect();
    go((e.clientX - r.left) / r.width < 0.3 ? idx - 1 : idx + 1);
  };

  const current = clips[idx];

  return (
    <div className="reel" onClick={onStageClick}>
      {clips.map((c, i) => {
        // Keep the previous clip (fading out), the current, and the next (buffering).
        const near = i >= idx - 1 && i <= idx + 1;
        return (
          <div key={c.id} className={`reel-clip${i === idx ? ' is-active' : ''}`} aria-hidden="true">
            {c.poster && <div className="reel-backdrop" style={{ backgroundImage: `url(${c.poster})` }} />}
            <video
              ref={(el) => { videos.current[i] = el; }}
              className="reel-video"
              src={near ? c.src : undefined}
              poster={c.poster}
              muted
              playsInline
              preload={i === idx + 1 ? 'auto' : 'metadata'}
              onError={() => {
                failed.current.add(i);
                if (i === idx) go(idx + 1);
              }}
            />
          </div>
        );
      })}

      {current && (
        <div className="reel-caption" key={current.id}>
          <span className="reel-caption-label">{current.label}</span>
          <span className="reel-caption-cat">{current.cat}</span>
        </div>
      )}

      <div className="reel-progress">
        {clips.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className="reel-seg"
            aria-label={`Clip ${i + 1} of ${clips.length}: ${c.label}`}
            aria-current={i === idx ? 'true' : undefined}
            onClick={(e) => { e.stopPropagation(); go(i); }}
          >
            <span className="reel-seg-track">
              <span className="reel-seg-fill" ref={(el) => { fills.current[i] = el; }} />
            </span>
          </button>
        ))}
      </div>

      {ended && (
        <div className="reel-end">
          <div className="reel-end-eyebrow">Showreel · {clips.length} clips</div>
          <p className="reel-end-title">That&apos;s the taste.<br />The rest is in the work.</p>
          <div className="reel-end-actions">
            <Link href="/work" className="btn-primary">View Work</Link>
            <Link href="/contact" className="btn-ghost">Get in Touch</Link>
          </div>
          <button type="button" className="reel-replay" onClick={() => go(0)}>↺ Replay</button>
        </div>
      )}
    </div>
  );
}
