/**
 * One-time: pre-fill each project's `brand` from its title, since the title is
 * already the brand for client work. Normalises obvious case/name dupes and
 * leaves 3D (personal work) blank. Refine the rest in the CMS afterwards.
 *
 * Run: node scripts/add-brands.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'content', 'projects');

// title (or its normalized form) -> brand
const NORMALIZE = {
  MAKUKU: 'Makuku',
  'Makuku Motion': 'Makuku',
  ICHITAN: 'Ichitan',
  MOWILEX: 'Mowilex',
  'Amway Spring': 'Amway',
  'Amway Make Up': 'Amway',
};

const counts = {};
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.yaml'))) {
  const full = path.join(dir, file);
  const data = YAML.parse(fs.readFileSync(full, 'utf8')) || {};
  if (data.brand) continue; // already set — leave it

  const brand = data.cat === '3d' ? '' : (NORMALIZE[data.title] ?? data.title ?? '');

  // Rebuild in schema order so future CMS saves diff cleanly.
  const out = {
    hidden: data.hidden ?? false,
    title: data.title ?? '',
    cat: data.cat ?? 'motion',
    brand,
    ratio: data.ratio ?? 'portrait',
    desc: data.desc ?? '',
    ...(data.thumbnailUpload ? { thumbnailUpload: data.thumbnailUpload } : {}),
    thumbnail: data.thumbnail ?? '',
    media: data.media,
    tools: data.tools ?? '',
    year: data.year ?? null,
  };
  fs.writeFileSync(full, YAML.stringify(out), 'utf8');
  if (brand) counts[brand] = (counts[brand] || 0) + 1;
}

console.log('Brands assigned:\n' + Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([b, n]) => `  ${n}  ${b}`).join('\n'));
