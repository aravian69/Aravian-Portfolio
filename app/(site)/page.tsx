'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ShowreelModal from '@/components/ShowreelModal';

function letters(text: string, key: string) {
  return text.split('').map((ch, i) => (
    <span key={`${key}-${i}`} className="letter">{ch}</span>
  ));
}

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
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
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              <span className="play-dot" />
              Watch Showreel
            </button>
            <Link href="/work" className="btn-ghost">
              View Work
            </Link>
          </div>
          <div className="home-avail">
            <span className="avail-dot" />
            Available for projects
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

      <ShowreelModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
