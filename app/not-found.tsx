import Link from 'next/link';
import './globals.css';

/**
 * Branded 404. Lives at the root so it catches both unmatched URLs and any
 * notFound() thrown deeper (e.g. an unknown /work/<category> slug). It renders
 * under the minimal root layout, so it styles itself and offers the way back.
 */
export default function NotFound() {
  return (
    <main className="nf-wrap">
      <div className="nf-eyebrow">Error 404</div>
      <h1 className="nf-title">
        <span className="outline">Frame</span>
        <br />
        <span className="acc">not found.</span>
      </h1>
      <p className="nf-lead">
        This shot isn&apos;t in the reel. The rest of it is.
      </p>
      <div className="nf-actions">
        <Link href="/work" className="btn-primary">View Work</Link>
        <Link href="/" className="btn-ghost">Back Home</Link>
      </div>
    </main>
  );
}
