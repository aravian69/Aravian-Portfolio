'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string | null;
}

export default function ShowreelModal({ isOpen, onClose, videoUrl }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay open"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-inner">
        {videoUrl ? (
          <iframe
            src={videoUrl}
            title="Showreel"
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
            style={{ width: '100%', aspectRatio: '16 / 9', border: 0, borderRadius: 8, display: 'block' }}
          />
        ) : (
          <div className="modal-placeholder">● SHOWREEL<br />Add your showreel link in the CMS (Home page settings)</div>
        )}
      </div>
      <button className="modal-close" onClick={onClose}>✕ &nbsp; Close</button>
    </div>,
    document.body
  );
}
