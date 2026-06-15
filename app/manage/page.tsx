import type { Metadata } from 'next';
import { getProjects } from '@/lib/projects.server';
import { CATEGORIES } from '@/lib/projects';
import styles from './manage.module.css';

export const metadata: Metadata = {
  title: 'Manage Projects',
  robots: { index: false, follow: false },
};

const catLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

export default async function ManagePage() {
  const projects = await getProjects();

  return (
    <div className={styles.shell}>
      <div className={styles.bar}>
        <span className={styles.title}>Manage Projects</span>
        <span className={styles.count}>{projects.length} items</span>
        <span className={styles.spacer} />
        <a className={styles.btn} href="/keystatic/collection/projects">List view</a>
        <a className={styles.btnPrimary + ' ' + styles.btn} href="/keystatic/collection/projects/create">
          ＋ Add new
        </a>
      </div>
      <p className={styles.sub}>Thumbnail view. Click any project to edit it, or “Add new” to create one.</p>

      <div className={styles.grid}>
        {projects.map((p) => {
          const src = p.thumbnail ?? p.images?.[0] ?? null;
          return (
            <a
              key={p.id}
              className={styles.card}
              href={`/keystatic/collection/projects/item/${encodeURIComponent(p.id)}`}
            >
              <div
                className={styles.thumb}
                style={src ? { backgroundImage: `url(${src})` } : undefined}
              >
                <span className={styles.badge}>{catLabel(p.cat)}</span>
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
