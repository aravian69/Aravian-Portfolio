import type { Metadata } from 'next';
import { getAllProjects } from '@/lib/projects.server';
import { CATEGORIES } from '@/lib/projects';
import styles from './manage.module.css';

export const metadata: Metadata = {
  title: 'Manage Projects',
  robots: { index: false, follow: false },
};

const catLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

// GitHub mode routes go through /branch/<default>; local mode omits the branch.
const KS_BASE =
  process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB === 'true'
    ? '/keystatic/branch/main/collection/projects'
    : '/keystatic/collection/projects';

export default async function ManagePage() {
  const projects = await getAllProjects();
  const hiddenCount = projects.filter((p) => p.hidden).length;

  return (
    <div className={styles.shell}>
      <div className={styles.bar}>
        <span className={styles.title}>Manage Projects</span>
        <span className={styles.count}>
          {projects.length} items{hiddenCount > 0 ? ` · ${hiddenCount} hidden` : ''}
        </span>
        <span className={styles.spacer} />
        <a className={styles.btn} href={KS_BASE}>List view</a>
        <a className={styles.btnPrimary + ' ' + styles.btn} href={`${KS_BASE}/create`}>
          ＋ Add new
        </a>
      </div>
      <p className={styles.sub}>
        Thumbnail view. Click any project to edit it (toggle “Hide from site” there), or “Add new” to create one.
      </p>

      <div className={styles.grid}>
        {projects.map((p) => {
          const src = p.thumbnail ?? p.images?.[0] ?? null;
          return (
            <a
              key={p.id}
              className={p.hidden ? styles.card + ' ' + styles.cardHidden : styles.card}
              href={`${KS_BASE}/item/${encodeURIComponent(p.id)}`}
            >
              <div
                className={styles.thumb}
                style={src ? { backgroundImage: `url(${src})` } : undefined}
              >
                <span className={styles.badge}>{catLabel(p.cat)}</span>
                {p.hidden && (
                  <span className={styles.hiddenBadge}>
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                    Hidden
                  </span>
                )}
                {!src && <span className={styles.thumbEmpty}>No image</span>}
                <span className={styles.editHint}>Edit</span>
              </div>
              <div className={styles.meta}>
                <div className={styles.cardTitle}>{p.title}</div>
                <div className={styles.cardDesc}>{p.desc || p.id}</div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
