'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './framePicker.module.css';

type Proj = { id: string; title: string; videoSrc: string; thumb: string | null };

export default function FramePicker({ projects }: { projects: Proj[] }) {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [active, setActive] = useState<Proj | null>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const s = sessionStorage.getItem('thumb-secret');
    if (s) { setSecret(s); setAuthed(true); }
  }, []);

  const open = (p: Proj) => {
    setActive(p);
    setTime(0);
    setDuration(0);
    setStatus('idle');
    setMessage('');
  };

  const onScrub = (t: number) => {
    setTime(t);
    if (videoRef.current) videoRef.current.currentTime = t;
  };

  const capture = async () => {
    const video = videoRef.current;
    if (!video || !active) return;

    // Make sure the frame at the chosen time is decoded before grabbing it.
    if (Math.abs(video.currentTime - time) > 0.05) {
      video.currentTime = time;
      await new Promise<void>((res) => video.addEventListener('seeked', () => res(), { once: true }));
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let dataUrl: string;
    try {
      dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    } catch {
      setStatus('error');
      setMessage('Could not read the video frame (CORS). Try again or report this.');
      return;
    }

    setStatus('saving');
    setMessage('Saving frame and committing…');
    try {
      const res = await fetch('/api/set-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ projectId: active.id, imageBase64: dataUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setStatus('done');
      setMessage('Saved. Vercel is deploying — the new thumbnail appears in ~1–2 min.');
    } catch (e) {
      setStatus('error');
      setMessage(e instanceof Error ? e.message : 'Save failed');
    }
  };

  if (!authed) {
    return (
      <div className={styles.shell}>
        <h1 className={styles.title}>Frame Picker</h1>
        <p className={styles.sub}>Enter the admin passphrase to continue.</p>
        <form
          className={styles.authRow}
          onSubmit={(e) => {
            e.preventDefault();
            if (!secret) return;
            sessionStorage.setItem('thumb-secret', secret);
            setAuthed(true);
          }}
        >
          <input
            className={styles.input}
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Passphrase"
            autoFocus
          />
          <button className={styles.btnPrimary} type="submit">Enter</button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <div className={styles.bar}>
        <h1 className={styles.title}>Frame Picker</h1>
        <span className={styles.count}>{projects.length} videos</span>
      </div>
      <p className={styles.sub}>Pick a project, scrub to the frame you want, then “Set as thumbnail”.</p>

      {active && (
        <div className={styles.stage}>
          <div className={styles.stageHead}>
            <strong>{active.title}</strong>
            <button className={styles.btnGhost} onClick={() => setActive(null)}>Close</button>
          </div>
          <video
            ref={videoRef}
            className={styles.video}
            src={active.videoSrc}
            crossOrigin="anonymous"
            muted
            playsInline
            preload="metadata"
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          />
          <input
            className={styles.scrub}
            type="range"
            min={0}
            max={duration || 0}
            step={0.05}
            value={time}
            onChange={(e) => onScrub(parseFloat(e.target.value))}
          />
          <div className={styles.scrubMeta}>
            <span>{time.toFixed(2)}s / {duration.toFixed(2)}s</span>
            <button className={styles.btnPrimary} onClick={capture} disabled={status === 'saving'}>
              {status === 'saving' ? 'Saving…' : 'Set as thumbnail'}
            </button>
          </div>
          {message && (
            <div className={status === 'error' ? styles.msgError : styles.msgOk}>{message}</div>
          )}
        </div>
      )}

      <div className={styles.grid}>
        {projects.map((p) => (
          <button
            key={p.id}
            className={p.id === active?.id ? styles.card + ' ' + styles.cardActive : styles.card}
            onClick={() => open(p)}
          >
            <div
              className={styles.thumb}
              style={p.thumb ? { backgroundImage: `url(${p.thumb})` } : undefined}
            />
            <span className={styles.cardTitle}>{p.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
