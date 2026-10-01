'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ShowreelModal from '@/components/ShowreelModal';
import { CATEGORIES, type ReelClip } from '@/lib/projects';
import styles from './reelPicker.module.css';

export type PickerItem = ReelClip & { title: string; catId: string };

const SECRET_KEY = 'thumb-secret'; // shared with the frame picker (/pick)
const CLIP_SECONDS = 3.2;          // matches AutoReel

function readSecret() {
  try { return sessionStorage.getItem(SECRET_KEY) ?? ''; } catch { return ''; }
}
function storeSecret(v: string | null) {
  try { if (v) sessionStorage.setItem(SECRET_KEY, v); else sessionStorage.removeItem(SECRET_KEY); } catch { /* private mode */ }
}

/**
 * Visual picker for the automatic showreel: click clips to add them in order,
 * reorder by dragging or with the arrows, preview with the real player, save.
 * Saving writes content/home.yaml (reelClips) through /api/set-reel.
 */
export default function ReelPicker({ items, initial, auto }: { items: PickerItem[]; initial: string[]; auto: string[] }) {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [picked, setPicked] = useState<string[]>(initial);
  const [saved, setSaved] = useState<string[]>(initial);
  const [filter, setFilter] = useState('all');
  const [previewing, setPreviewing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const dragFrom = useRef<number | null>(null);

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const dirty = picked.join(',') !== saved.join(',');
  const usingAuto = picked.length === 0;
  const reel = (usingAuto ? auto : picked).map((id) => byId.get(id)).filter((i): i is PickerItem => !!i);

  const cats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of items) counts.set(i.catId, (counts.get(i.catId) ?? 0) + 1);
    return CATEGORIES.filter((c) => c.id === 'all' || counts.has(c.id)).map((c) => ({
      id: c.id as string,
      label: c.label,
      count: c.id === 'all' ? items.length : counts.get(c.id)!,
    }));
  }, [items]);
  const shown = filter === 'all' ? items : items.filter((i) => i.catId === filter);

  useEffect(() => {
    const s = readSecret();
    if (s) { setSecret(s); setAuthed(true); }
  }, []);

  // Don't lose a half-built reel to an accidental tab close.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const edit = (next: string[]) => {
    setPicked(next);
    if (status !== 'saving') { setStatus('idle'); setMessage(''); }
  };
  const toggle = (id: string) => edit(picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id]);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= picked.length || from === to) return;
    const next = [...picked];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    edit(next);
  };

  const save = async () => {
    setStatus('saving');
    setMessage('Saving…');
    try {
      const res = await fetch('/api/set-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ ids: picked }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        storeSecret(null);
        setAuthed(false);
        throw new Error('Wrong passphrase. Enter it again, then press Save.');
      }
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setSaved(picked);
      setStatus('done');
      setMessage(
        json.local
          ? 'Saved to content/home.yaml on this computer. Commit and push to publish it.'
          : 'Saved. The site is redeploying; the new reel is live in about a minute.'
      );
    } catch (e) {
      setStatus('error');
      setMessage(e instanceof Error ? e.message : 'Save failed');
    }
  };

  if (!authed) {
    return (
      <div className={styles.shell}>
        <h1 className={styles.title}>Showreel Picker</h1>
        <p className={styles.sub}>Enter the admin passphrase (the same one as the frame picker).</p>
        <form
          className={styles.authRow}
          onSubmit={(e) => {
            e.preventDefault();
            if (!secret) return;
            storeSecret(secret);
            setAuthed(true);
          }}
        >
          <input
            className={styles.input}
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Passphrase"
            aria-label="Passphrase"
            autoFocus
          />
          <button className={styles.btnPrimary} type="submit">Enter</button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <div>
          <h1 className={styles.title}>Showreel Picker</h1>
          <p className={styles.sub}>
            Click clips to add them in order; drag or use the arrows to reorder. Each plays about {CLIP_SECONDS.toFixed(0)} seconds.
          </p>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnGhost} onClick={() => setPreviewing(true)} disabled={reel.length === 0}>
            ▶ Preview
          </button>
          <button className={styles.btnPrimary} onClick={save} disabled={!dirty || status === 'saving'}>
            {status === 'saving' ? 'Saving…' : dirty ? 'Save' : 'Saved'}
          </button>
        </div>
      </header>

      {message && <div className={status === 'error' ? styles.msgError : styles.msgOk} role="status">{message}</div>}

      <section className={styles.reel} aria-label="Your showreel">
        <div className={styles.reelHead}>
          <strong>{usingAuto ? 'Automatic pick' : 'Your reel'}</strong>
          <span className={styles.count}>
            {reel.length} clips · about {Math.round(reel.length * CLIP_SECONDS)}s
          </span>
          <span className={styles.spacer} />
          {usingAuto ? (
            <button className={styles.btnGhost} onClick={() => edit(auto)}>Start from this pick</button>
          ) : (
            <button className={styles.btnGhost} onClick={() => edit([])}>Clear (go back to automatic)</button>
          )}
        </div>
        {usingAuto && (
          <p className={styles.hint}>
            Nothing picked yet, so the site chooses these {auto.length} itself. Click any clip below to start your own reel.
          </p>
        )}
        <ol className={usingAuto ? `${styles.strip} ${styles.stripAuto}` : styles.strip}>
          {reel.map((c, i) => (
            <li
              key={c.id}
              className={styles.tile}
              draggable={!usingAuto}
              onDragStart={() => { dragFrom.current = i; }}
              onDragOver={(e) => { if (dragFrom.current !== null) e.preventDefault(); }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragFrom.current !== null) move(dragFrom.current, i);
                dragFrom.current = null;
              }}
              onDragEnd={() => { dragFrom.current = null; }}
            >
              <div className={styles.tileThumb} style={c.poster ? { backgroundImage: `url(${c.poster})` } : undefined}>
                <span className={styles.num}>{i + 1}</span>
              </div>
              <span className={styles.tileTitle} title={c.title}>{c.label}</span>
              {!usingAuto && (
                <div className={styles.tileCtrls}>
                  <button onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move ${c.label} earlier`}>‹</button>
                  <button onClick={() => toggle(c.id)} aria-label={`Remove ${c.label}`}>✕</button>
                  <button onClick={() => move(i, i + 1)} disabled={i === reel.length - 1} aria-label={`Move ${c.label} later`}>›</button>
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      <div className={styles.filters} role="group" aria-label="Filter by category">
        {cats.map((c) => (
          <button
            key={c.id}
            className={filter === c.id ? `${styles.chip} ${styles.chipOn}` : styles.chip}
            aria-pressed={filter === c.id}
            onClick={() => setFilter(c.id)}
          >
            {c.label} <span>{c.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {shown.map((item) => {
          const n = picked.indexOf(item.id);
          return (
            <button
              key={item.id}
              className={n >= 0 ? `${styles.card} ${styles.cardOn}` : styles.card}
              aria-pressed={n >= 0}
              onClick={() => toggle(item.id)}
              onMouseEnter={(e) => {
                const v = e.currentTarget.querySelector('video');
                if (!v) return;
                if (!v.src) v.src = item.src;
                v.play().catch(() => {});
              }}
              onMouseLeave={(e) => e.currentTarget.querySelector('video')?.pause()}
            >
              <div className={styles.thumb} style={item.poster ? { backgroundImage: `url(${item.poster})` } : undefined}>
                <video className={styles.hoverVideo} muted loop playsInline preload="none" aria-hidden="true" />
                {n >= 0 && <span className={styles.num}>{n + 1}</span>}
              </div>
              <span className={styles.cardTitle} title={item.title}>{item.label}</span>
              <span className={styles.cardMeta}>{item.cat} · {item.id}</span>
            </button>
          );
        })}
      </div>

      {reel.length > 0 && (
        <ShowreelModal
          isOpen={previewing}
          onClose={() => setPreviewing(false)}
          videoUrl={null}
          clips={reel}
          reelLinks={false}
        />
      )}
    </div>
  );
}
