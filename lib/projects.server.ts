import 'server-only';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config';
import { clImg } from '@/lib/cloudinary';
import type { Project, Category, Ratio } from '@/lib/projects';

const reader = createReader(process.cwd(), keystaticConfig);

/**
 * Read every project from the Keystatic content store — including ones marked
 * hidden — and map each to the Project shape the UI expects. clImg() re-applies
 * the Cloudinary transform to stored raw image URLs (and passes non-Cloudinary
 * URLs through unchanged). Used by /manage so hidden items stay editable.
 */
export async function getAllProjects(): Promise<Project[]> {
  const entries = await reader.collections.projects.all();
  return entries
    .map(({ slug, entry }): Project => ({
      id: slug,
      title: entry.title,
      desc: entry.desc || undefined,
      cat: entry.cat as Category,
      ratio: entry.ratio as Ratio,
      videoUrl: entry.videoUrl || undefined,
      beforeVideoUrl: entry.beforeVideoUrl || undefined,
      afterVideoUrl: entry.afterVideoUrl || undefined,
      thumbnail: entry.thumbnail ? clImg(entry.thumbnail) : undefined,
      images:
        entry.images && entry.images.length
          ? entry.images.filter((u): u is string => !!u).map((u) => clImg(u))
          : undefined,
      tools: entry.tools || undefined,
      year: entry.year ?? undefined,
      hidden: entry.hidden ?? false,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Public-facing projects: everything except items marked hidden in the CMS.
 * Used by the Work grid and anywhere the live site lists projects.
 */
export async function getProjects(): Promise<Project[]> {
  const all = await getAllProjects();
  return all.filter((p) => !p.hidden);
}

/** Read the home-page showreel video URL from the Keystatic singleton. */
export async function getShowreelUrl(): Promise<string | null> {
  const home = await reader.singletons.home.read();
  return home?.showreelUrl || null;
}
