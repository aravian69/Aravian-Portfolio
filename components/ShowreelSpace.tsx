'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';

export type ReelItem = { id: string; title: string; thumb: string; video?: string; ratio: string };

const MAX_VIDEOS = 4;     // browser can only decode a handful at once
const GAP = 2.05;         // z-spacing between panels (smaller = denser)
const START_Z = 7;
const PANEL_H = 3.5;      // base panel height

const ASPECT: Record<string, number> = { portrait: 9 / 16, landscape: 16 / 9, square: 1 };

// Deterministic RNG so panel positions are stable across renders.
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeVideo(src: string) {
  const v = document.createElement('video');
  v.src = src;
  v.crossOrigin = 'anonymous';
  v.muted = true;
  v.loop = true;
  v.playsInline = true;
  v.preload = 'auto';
  void v.play().catch(() => {});
  return v;
}

function Scene({ items, targetZ, onPick }: { items: ReelItem[]; targetZ: React.MutableRefObject<number>; onPick: (id: string) => void }) {
  const { camera } = useThree();

  // Static per-panel data: geometry is shared (unit plane), meshes are scaled.
  const geom = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const data = useMemo(() => {
    const rand = mulberry32(97);
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    return items.map((item, i) => {
      const ar = ASPECT[item.ratio] ?? 1.4;
      const thumb = loader.load(item.thumb);
      thumb.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshBasicMaterial({ map: thumb, transparent: true, toneMapped: false });
      // Scatter in a tube around the fly-through path — tighter so panels stay
      // in view and fill the frame instead of flying off into empty black.
      const ang = rand() * Math.PI * 2;
      const radius = 2.4 + rand() * 5.4;
      const pos = new THREE.Vector3(Math.cos(ang) * radius, (rand() - 0.5) * 8, -6 - i * GAP);
      const rot = new THREE.Euler((rand() - 0.5) * 0.25, (rand() - 0.5) * 0.4, (rand() - 0.5) * 0.12);
      return { item, mat, thumb, pos, rot, w: PANEL_H * ar, h: PANEL_H, playing: false as boolean, video: null as HTMLVideoElement | null, vtex: null as THREE.VideoTexture | null };
    });
  }, [items, geom]);

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useEffect(() => () => {
    // cleanup all videos + textures on unmount
    data.forEach((d) => { if (d.video) { d.video.pause(); d.video.removeAttribute('src'); d.video.load(); } d.vtex?.dispose(); d.thumb.dispose(); d.mat.dispose(); });
    geom.dispose();
  }, [data, geom]);

  useFrame(() => {
    // Fly the camera toward the scrolled target.
    camera.position.z += (targetZ.current - camera.position.z) * 0.075;
    const cz = camera.position.z;

    // Choose which panels play video: nearest few just ahead of the camera.
    const inBand = data
      .map((d, i) => ({ i, ahead: cz - d.pos.z })) // >0 = ahead of camera
      .filter((o) => o.ahead > -2.5 && o.ahead < 26 && data[o.i].item.video)
      .sort((a, b) => Math.abs(a.ahead - 7) - Math.abs(b.ahead - 7));
    const active = new Set(inBand.slice(0, MAX_VIDEOS).map((o) => o.i));

    data.forEach((d, i) => {
      const ahead = cz - d.pos.z;
      // Fade panels out just after the camera passes them; the fog handles the
      // far fade, so panels dissolve into the starfield at distance.
      d.mat.opacity = ahead < -1 ? Math.max(0, 1 + (ahead + 1) * 0.7) : 1;

      const shouldPlay = active.has(i);
      if (shouldPlay && !d.playing) {
        d.video = makeVideo(d.item.video!);
        d.vtex = new THREE.VideoTexture(d.video);
        d.vtex.colorSpace = THREE.SRGBColorSpace;
        d.mat.map = d.vtex;
        d.mat.needsUpdate = true;
        d.playing = true;
      } else if (!shouldPlay && d.playing) {
        d.video?.pause();
        d.video?.removeAttribute('src');
        d.video?.load();
        d.vtex?.dispose();
        d.video = null; d.vtex = null;
        d.mat.map = d.thumb;
        d.mat.needsUpdate = true;
        d.playing = false;
      }
    });
  });

  return (
    <>
      <Stars radius={120} depth={80} count={4000} factor={4} saturation={0} fade speed={0.6} />
      {data.map((d, i) => (
        <mesh
          key={d.item.id}
          ref={(el) => { meshRefs.current[i] = el; }}
          geometry={geom}
          material={d.mat}
          position={d.pos}
          rotation={d.rot}
          scale={[d.w, d.h, 1]}
          onPointerDown={(e) => { e.stopPropagation(); onPick(d.item.id); }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = ''; }}
        />
      ))}
    </>
  );
}

export default function ShowreelSpace({ items, onClose }: { items: ReelItem[]; onClose: () => void }) {
  const targetZ = useRef(START_Z);
  const endZ = useRef(-6 - (items.length - 1) * GAP - 8);
  const overlayRef = useRef<HTMLDivElement>(null);
  const touchY = useRef<number | null>(null);

  const nudge = (delta: number) => {
    targetZ.current = Math.min(START_Z, Math.max(endZ.current, targetZ.current - delta));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.cursor = ''; };
  }, [onClose]);

  const pick = (id: string) => { window.location.href = `/work?p=${id}`; };

  return (
    <div
      ref={overlayRef}
      className="reel-space"
      onWheel={(e) => nudge(e.deltaY * 0.02)}
      onTouchStart={(e) => { touchY.current = e.touches[0].clientY; }}
      onTouchMove={(e) => {
        if (touchY.current == null) return;
        const dy = touchY.current - e.touches[0].clientY;
        touchY.current = e.touches[0].clientY;
        nudge(-dy * 0.05);
      }}
    >
      <Canvas camera={{ position: [0, 0, START_Z], fov: 50 }} dpr={[1, 1.75]} gl={{ antialias: true }}>
        <color attach="background" args={['#05060b']} />
        <fog attach="fog" args={['#05060b', 18, 58]} />
        <Scene items={items} targetZ={targetZ} onPick={pick} />
      </Canvas>

      <div className="reel-hint">Scroll to fly · click a piece to open</div>
      <button className="reel-close" onClick={onClose} aria-label="Close showreel">✕</button>
    </div>
  );
}
