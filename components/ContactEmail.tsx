'use client';

import { useRef, useState } from 'react';

const isMac = () => /Mac|iPhone|iPad/.test(navigator.userAgent);

/**
 * The big contact email: a plain mailto link (opens whatever mail app the
 * visitor uses, not a webmail they may not be signed into) plus a Copy button
 * for people who'd rather paste it into their own client.
 */
export default function ContactEmail({ email }: { email: string }) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [status, setStatus] = useState<'idle' | 'copied' | 'selected'>('idle');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setStatus('copied');
    } catch {
      // Clipboard blocked: select the address so Ctrl/Cmd+C still works.
      if (linkRef.current) window.getSelection()?.selectAllChildren(linkRef.current);
      setStatus('selected');
    }
    setTimeout(() => setStatus('idle'), 1800);
  };

  return (
    <div className="contact-email-row">
      <a ref={linkRef} className="contact-email" href={`mailto:${email}`}>
        {email}
      </a>
      <button type="button" className="contact-copy" onClick={copy} aria-label={`Copy email address ${email}`}>
        {status === 'copied' ? 'Copied' : status === 'selected' ? `Press ${isMac() ? '⌘' : 'Ctrl'}+C` : 'Copy'}
      </button>
      <span className="sr-only" aria-live="polite">
        {status === 'copied' ? 'Email address copied' : ''}
      </span>
    </div>
  );
}
