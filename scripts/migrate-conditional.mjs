/**
 * One-time migration: flatten media fields (videoUrl / images / before+after)
 * into the new Keystatic `media` conditional field.
 *
 *   discriminant: 'video' | 'gallery' | 'comparison'
 *
 * Run: node scripts/migrate-conditional.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dir, '..', 'content', 'projects');

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.yaml'));
const counts = { video: 0, gallery: 0, comparison: 0 };
const notes = [];

for (const file of files) {
  const full = path.join(dir, file);
  const data = YAML.parse(fs.readFileSync(full, 'utf8')) || {};

  // Already migrated? Skip.
  if (data.media && data.media.discriminant) continue;

  const hasBefore = !!(data.beforeVideoUrl && data.afterVideoUrl);
  const hasVideo = !!data.videoUrl;
  const hasImages = Array.isArray(data.images) && data.images.filter(Boolean).length > 0;

  let media;
  if (hasBefore) {
    media = { discriminant: 'comparison', value: { beforeVideoUrl: data.beforeVideoUrl, afterVideoUrl: data.afterVideoUrl } };
    counts.comparison++;
    if (hasVideo || hasImages) notes.push(`${file}: comparison (dropped ${hasVideo ? 'videoUrl ' : ''}${hasImages ? 'images' : ''})`);
  } else if (hasVideo) {
    media = { discriminant: 'video', value: { videoUrl: data.videoUrl } };
    counts.video++;
    if (hasImages) notes.push(`${file}: video (dropped images — they were ignored anyway)`);
  } else if (hasImages) {
    media = { discriminant: 'gallery', value: { images: data.images.filter(Boolean) } };
    counts.gallery++;
  } else {
    // thumbnail-only / nothing → image gallery with no extra frames
    media = { discriminant: 'gallery', value: { images: [] } };
    counts.gallery++;
  }

  // Rebuild in schema order so future CMS saves produce clean diffs.
  const out = {
    hidden: data.hidden ?? false,
    title: data.title ?? '',
    cat: data.cat ?? 'motion',
    ratio: data.ratio ?? 'portrait',
    desc: data.desc ?? '',
    thumbnail: data.thumbnail ?? '',
    media,
    tools: data.tools ?? '',
    year: data.year ?? null,
  };

  fs.writeFileSync(full, YAML.stringify(out), 'utf8');
}

console.log('Migrated:', counts);
if (notes.length) console.log('\nNotes:\n' + notes.join('\n'));
