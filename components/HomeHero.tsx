'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ShowreelModal from '@/components/ShowreelModal';
import type { ReelClip } from '@/lib/projects';

function letters(text: string, key: string) {
  return text.split('').map((ch, i) => (
    <span key={`${key}-${i}`} className="letter">{ch}</span>
  ));
}

export default function HomeHero({ showreelUrl, reelClips }: { showreelUrl: string | null; reelClips: ReelClip[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  // Clips come from the showreel picker, or the automatic pick when none are
  // chosen; either way, whatever is there gets played.
  const hasReel = !!showreelUrl || reelClips.length > 0;

  useEffect(() => {
    // The single-screen no-scroll layout is a desktop conceit. On phones the
    // stacked content is taller than the viewport, so let it scroll normally.
    if (!window.matchMedia('(min-width: 769px)').matches) return;
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = ''; };
  }, []);

  return (
    <>
      <div className="home-page">
        <div className="home-left">
          <div className="home-eyebrow">VFX · Motion · AI · Color · Jakarta</div>
          <h1 className="home-title">
            {letters('I', 'h1a')}{' '}{letters('make', 'h1b')}<br />
            {letters('the', 'h2a')}{' '}<span className="outline">{letters('ordinary,', 'h2b')}</span><br />
            <span className="acc">{letters('cinematic.', 'h3')}</span>
          </h1>
          <p className="home-lead">
            VFX artist, motion designer, and AI video creator based in Jakarta. I turn ideas into visual stories that move people.
          </p>
          <div className="home-actions">
            {/* Plays the showreel video set in the CMS, or else an automatic
                reel cut from the projects' own clips. With neither, the work
                itself leads. */}
            {hasReel ? (
              <>
                <button type="button" className="btn-primary" onClick={() => setModalOpen(true)}>
                  <span className="play-dot" />
                  Watch Showreel
                </button>
                <Link href="/work" className="btn-ghost">
                  View Work
                </Link>
              </>
            ) : (
              <>
                <Link href="/work" className="btn-primary">
                  View Work
                </Link>
                <Link href="/contact" className="btn-ghost">
                  Get in Touch
                </Link>
              </>
            )}
          </div>
          <div className="home-clients" aria-label="Selected clients">
            <span className="home-clients-eyebrow">Selected clients</span>
            <ul className="home-clients-list">
              {['Le Minerale', 'Ichitan', 'Charm', 'Teh Celup Sosro', 'Amway', 'Tugu Insurance', 'Makuku', 'Mowilex'].map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="home-right" />
      </div>

      {hasReel && (
        <ShowreelModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          videoUrl={showreelUrl}
          clips={reelClips}
        />
      )}
    </>
  );
}
