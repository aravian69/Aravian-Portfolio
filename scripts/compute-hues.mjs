/**
 * compute-hues.mjs
 * ────────────────
 * Samples the dominant colour of every project thumbnail and bakes a stable
 * "hue sort key" per project id into lib/hueOrder.ts.
 *
 * Why: MasonryGrid sorts the grid by thumbnail hue. Doing that in the browser
 * means the grid first paints in a placeholder order, then re-sorts once the
 * colours are sampled — a visible flash on load / refresh. Precomputing the
 * order here lets the grid render its final order on the very first paint.
 *
 * Run after adding or changing thumbnails:
 *   node scripts/compute-hues.mjs
 *
 * Mirrors the sampling logic in components/MasonryGrid.tsx (extractSwatch +
 * sortKey) so the baked order matches what the browser would have produced.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import YAML from 'yaml';

const __dir       = path.dirname(fileURLToPath(import.meta.url));
const contentDir  = path.join(__dir, '..', 'content', 'projects');
const publicDir   = path.join(__dir, '..', 'public');
const outPath     = path.join(__dir, '..', 'lib', 'hueOrder.ts');

// ── Constants (keep in sync with MasonryGrid.tsx) ──────────────────────────
const SWATCH_SIZE        = 24;
const LUMA_MIN           = 18;
const LUMA_WEIGHT_SCALE  = 32;
const SAT_GRAY_THRESHOLD = 0.12;
const MISSING_KEY        = 9999; // items we couldn't sample sort to the end

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0, s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { hue: h, sat: s, light: l };
}

function sortKey(sw) {
  if (!sw) return MISSING_KEY;
  if (sw.sat < SAT_GRAY_THRESHOLD) return 360 + sw.light * 100;
  return sw.hue;
}

// Resolve clImg() wrappers the same way lib/cloudinary.ts does.
function clImg(url, transforms = 'w_1200,q_auto,f_auto') {
  if (!url.includes('res.cloudinary.com/')) return url;
  return url.replace('/upload/', `/upload/${transforms}/`);
}

// ── Read id + thumbnail URL from the Keystatic YAML content files ──────────
// Parses YAML properly (values may be quoted or not, and gallery images live
// under the `media` conditional) rather than regex-matching specific formatting.
function parseProjects() {
  const out = [];
  if (!fs.existsSync(contentDir)) return out;
  for (const file of fs.readdirSync(contentDir)) {
    if (!file.endsWith('.yaml')) continue;
    const id = file.replace(/\.yaml$/, '');
    const data = YAML.parse(fs.readFileSync(path.join(contentDir, file), 'utf8')) || {};
    // Prefer an uploaded image, then a thumbnail URL, then the first gallery image.
    let url = data.thumbnailUpload || data.thumbnail || null;
    if (!url && data.media?.discriminant === 'gallery') {
      url = (data.media.value?.images || []).find(Boolean) || null;
    }
    out.push({ id, url: url ? clImg(url) : null });
  }
  return out;
}

// Bunny's CDN rejects plain server requests — send browser-like headers so the
// thumbnails resolve the same way they do in the page.
const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'Referer': 'https://www.rav709.site/',
  'Accept': 'image/avif,image/webp,image/png,image/*,*/*;q=0.8',
};

// Fetch remote URLs; read uploaded thumbnails (local public-path or bare
// filename from Keystatic's image field) straight off disk.
async function getBuffer(url) {
  if (/^https?:\/\//.test(url)) {
    const res = await fetch(url, { headers: FETCH_HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }
  const candidates = [
    path.join(publicDir, url.replace(/^\//, '')),
    path.join(publicDir, 'uploads', 'thumbnails', path.basename(url)),
  ];
  for (const p of candidates) if (fs.existsSync(p)) return fs.readFileSync(p);
  throw new Error(`local file not found: ${url}`);
}

async function sampleUrl(url) {
  const buf = await getBuffer(url);
  const { data } = await sharp(buf)
    .resize(SWATCH_SIZE, SWATCH_SIZE, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let r = 0, g = 0, b = 0, weight = 0;
  for (let i = 0; i < data.length; i += 3) {
    const pr = data[i], pg = data[i + 1], pb = data[i + 2];
    const luma = (pr + pg + pb) / 3;
    if (luma < LUMA_MIN) continue;
    const w = Math.min(luma / LUMA_WEIGHT_SCALE, 1);
    r += pr * w; g += pg * w; b += pb * w; weight += w;
  }
  if (weight === 0) return null; // all dark → unsortable
  return rgbToHsl(r / weight, g / weight, b / weight);
}

async function main() {
  const items = parseProjects();
  console.log(`\n🎨  Sampling ${items.length} thumbnails…\n`);

  const order = {};
  let ok = 0, miss = 0;
  // Small concurrency so we don't hammer the CDN.
  const CONC = 8;
  for (let i = 0; i < items.length; i += CONC) {
    const slice = items.slice(i, i + CONC);
    await Promise.all(slice.map(async ({ id, url }) => {
      if (!url) { order[id] = MISSING_KEY; miss++; return; }
      try {
        const key = sortKey(await sampleUrl(url));
        order[id] = Math.round(key * 10) / 10;
        if (key === MISSING_KEY) miss++; else ok++;
      } catch (e) {
        order[id] = MISSING_KEY; miss++;
        console.warn(`   ⚠️  ${id}: ${e.message}`);
      }
    }));
  }

  const body = Object.entries(order)
    .map(([id, k]) => `  ${JSON.stringify(id)}: ${k},`)
    .join('\n');

  const file = `// AUTO-GENERATED by scripts/compute-hues.mjs — do not edit by hand.
// Maps project id → colour sort key (hue band, grayscale tones tail-bucketed).
// MasonryGrid sorts the grid by this so it renders its final order on the first
// paint, with no async re-sort flash. Regenerate after changing thumbnails:
//   node scripts/compute-hues.mjs
export const HUE_ORDER: Record<string, number> = {
${body}
};
`;
  fs.writeFileSync(outPath, file, 'utf8');
  console.log(`\n✅  Wrote lib/hueOrder.ts — ${ok} sampled, ${miss} unsortable.\n`);
}

// Never fail the build over hue ordering — a missing/partial hueOrder just
// sends affected items to the end of the grid.
main().catch((e) => { console.error('\n⚠️  compute-hues skipped:', e?.message ?? e); });
