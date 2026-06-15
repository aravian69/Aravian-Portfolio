import 'server-only';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config';
import { clImg } from '@/lib/cloudinary';
import type { Project, Category, Ratio } from '@/lib/projects';

const reader = createReader(process.cwd(), keystaticConfig);

/**
 * Read every project from the Keystatic content store and map it to the
 * Project shape the UI expects. clImg() re-applies the Cloudinary transform
 * to stored raw image URLs (and passes non-Cloudinary URLs through unchanged).
 */
export async function getProjects(): Promise<Project[]> {
  const entries = await reader.collections.projects.all();
  return entries
    .map(({ slug, entry }): Project => ({
      id: slug,
      title: entry.title,
      desc: entry.desc || undefined,
      cat: entry.cat as Category,
      ratio: entry.ratio as Ratio,
      videoUrl: entry.videoUrl || undefined,
      thumbnail: entry.thumbnail ? clImg(entry.thumbnail) : undefined,
      images:
        entry.images && entry.images.length
          ? entry.images.filter((u): u is string => !!u).map((u) => clImg(u))
          : undefined,
      tools: entry.tools || undefined,
      year: entry.year ?? undefined,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}
