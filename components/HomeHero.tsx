'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import ShowreelModal from '@/components/ShowreelModal';
import type { ReelItem } from '@/components/ShowreelSpace';

// The 3D gallery pulls in Three.js — load it only when the showreel opens so it
// never weighs down the home page's first paint.
const ShowreelSpace = dynamic(() => import('@/components/ShowreelSpace'), { ssr: false });

function letters(text: string, key: string) {
  return text.split('').map((ch, i) => (
    <span key={`${key}-${i}`} className="letter">{ch}</span>
  ));
}

export default function HomeHero({ showreelUrl, reel }: { showreelUrl: string | null; reel: ReelItem[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [spaceOpen, setSpaceOpen] = useState(false);

  useEffect(() => {
    // The single-screen no-scroll layout is a desktop conceit. On phones the
    // stacked content is taller than the viewport, so let it scroll normally.
    if (!window.matchMedia('(min-width: 769px)').matches) return;
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = ''; };
  }, []);

  // Lock page scroll while the 3D space is open (its own scroll flies the camera).
  useEffect(() => {
    if (!spaceOpen) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = prev; };
  }, [spaceOpen]);

  // Desktop gets the 3D flythrough; phones keep the lighter single-video modal.
  const watchShowreel = () => {
    const desktop = window.matchMedia('(min-width: 769px)').matches;
    if (desktop && reel.length > 0) setSpaceOpen(true);
    else setModalOpen(true);
  };

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
            <button className="btn-primary" onClick={watchShowreel}>
              <span className="play-dot" />
              Watch Showreel
            </button>
            <Link href="/work" className="btn-ghost">
              View Work
            </Link>
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

      <ShowreelModal isOpen={modalOpen} onClose={() => setModalOpen(false)} videoUrl={showreelUrl} />
      {spaceOpen && <ShowreelSpace items={reel} onClose={() => setSpaceOpen(false)} />}
    </>
  );
}
