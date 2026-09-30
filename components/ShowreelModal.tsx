'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export default function ShowreelModal({ isOpen, onClose, videoUrl }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Move focus into the dialog on open, restore it to the trigger on close.
  useEffect(() => {
    if (!isOpen) return;
    const prevFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => prevFocused?.focus?.();
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay open"
      role="dialog"
      aria-modal="true"
      aria-label="Showreel"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-inner">
        <iframe
          src={videoUrl}
          title="Showreel"
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          style={{ width: '100%', aspectRatio: '16 / 9', border: 0, borderRadius: 8, display: 'block' }}
        />
      </div>
      <button ref={closeRef} type="button" className="modal-close" onClick={onClose}>✕ &nbsp; Close</button>
    </div>,
    document.body
  );
}
