/**
 * sync-bunny.mjs
 * ──────────────
 * Pulls every video from your Bunny.net Stream library and regenerates the
 * VFX / 3D / Editing / AI / etc. sections of lib/projects.ts in one command.
 *
 * Setup (one time):
 *   1. Go to Bunny.net → Stream → your library → API
 *   2. Copy the "API Key" (not the account key – the *library* key)
 *   3. Add it to .env.local:   BUNNY_API_KEY=xxxxxxxxxxxxxxxx
 *   4. Name your Bunny collections exactly like the category IDs:
 *        vfx  |  3d  |  editing  |  ai  |  color  |  motion  |  graphic
 *
 * Usage:
 *   node scripts/sync-bunny.mjs              # dry-run: prints code, no writes
 *   node scripts/sync-bunny.mjs --write      # writes directly into lib/projects.ts
 *   node scripts/sync-bunny.mjs --collection vfx   # single collection only
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Config ────────────────────────────────────────────────────────────────────

const LIBRARY_ID    = '657161';
const CDN_HOST      = 'vz-cbc45619-72d.b-cdn.net';
const PLAYER_BASE   = 'https://player.mediadelivery.net/play';

// Load API key from .env.local (no dotenv dep needed)
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const [k, ...rest] = line.split('=');
    if (k && rest.length) process.env[k.trim()] = rest.join('=').trim();
  }
}
loadEnv();

const API_KEY = process.env.BUNNY_API_KEY;
if (!API_KEY) {
  console.error('\n❌  Set BUNNY_API_KEY in .env.local first.\n');
  process.exit(1);
}

const args         = process.argv.slice(2);
const WRITE_MODE   = args.includes('--write');
const ONLY_CAT     = args.find((a, i) => args[i - 1] === '--collection') ?? null;

// ── Bunny API helpers ─────────────────────────────────────────────────────────

async function bunnyGet(path) {
  const res = await fetch(`https://video.bunnycdn.com/library/${LIBRARY_ID}${path}`, {
    headers: { AccessKey: API_KEY, accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Bunny API ${res.status}: ${await res.text()}`);
  return res.json();
}

// Fetch all pages of videos (Bunny paginates at 100)
async function fetchAllVideos(collectionId) {
  const videos = [];
  let page = 1;
  while (true) {
    const qs = new URLSearchParams({ page, itemsPerPage: 100, orderBy: 'date' });
    if (collectionId) qs.set('collection', collectionId);
    const data = await bunnyGet(`/videos?${qs}`);
    videos.push(...(data.items ?? []));
    if (videos.length >= data.totalItems) break;
    page++;
  }
  return videos;
}

// ── Ratio detection ───────────────────────────────────────────────────────────

function detectRatio(w, h) {
  if (!w || !h) return 'landscape';
  const r = w / h;
  if (r > 1.4)  return 'landscape';
  if (r < 0.72) return 'portrait';
  return 'square';
}

// ── Code generation ───────────────────────────────────────────────────────────

function videoToCode(v, cat) {
  const ratio     = detectRatio(v.width, v.height);
  const videoUrl  = `${PLAYER_BASE}/${LIBRARY_ID}/${v.guid}`;
  const thumbnail = `https://${CDN_HOST}/${v.guid}/thumbnail.jpg`;
  const title     = (v.title ?? 'Untitled').replace(/'/g, "\\'");
  return `  { id: '${v.guid.slice(0, 8)}', title: '${title}', desc: 'TODO', cat: '${cat}', ratio: '${ratio}', color: '#131313', videoUrl: '${videoUrl}', thumbnail: '${thumbnail}' },`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🐰  Fetching Bunny.net collections…');
  const collectionsData = await bunnyGet('/collections?page=1&itemsPerPage=100');
  const collections = collectionsData.items ?? [];

  if (collections.length === 0) {
    console.warn('⚠️  No collections found. Add collections named after your categories (vfx, 3d, editing, ai, …).');
  }

  const VALID_CATS = new Set(['vfx', '3d', 'editing', 'ai', 'color', 'motion', 'graphic']);
  const matched = collections.filter(c =>
    VALID_CATS.has(c.name?.toLowerCase()) &&
    (!ONLY_CAT || c.name?.toLowerCase() === ONLY_CAT)
  );

  if (matched.length === 0) {
    console.error(`\n❌  No collections match category names.\nYour collections: ${collections.map(c => c.name).join(', ') || 'none'}\nRename them to: ${[...VALID_CATS].join(', ')}\n`);
    process.exit(1);
  }

  const lines = [];
  let total = 0;

  for (const col of matched) {
    const cat = col.name.toLowerCase();
    console.log(`\n   📂  ${col.name}  (${col.videoCount ?? '?'} videos)`);

    const videos = await fetchAllVideos(col.guid);
    total += videos.length;

    lines.push(`\n  // ── ${col.name} ─────────────────────────────────────────────────────`);
    for (const v of videos) {
      const line = videoToCode(v, cat);
      lines.push(line);
      console.log(`      ✔  ${v.title ?? v.guid}`);
    }
  }

  // Also pick up videos with NO collection as a catch-all report
  const uncollected = await fetchAllVideos(null);
  const orphans = uncollected.filter(v => !v.collectionId);
  if (orphans.length) {
    console.log(`\n⚠️   ${orphans.length} video(s) have no collection (skipped):`);
    orphans.forEach(v => console.log(`      – ${v.title ?? v.guid}`));
  }

  const generated = lines.join('\n');

  if (!WRITE_MODE) {
    console.log('\n── Generated code (copy into lib/projects.ts) ─────────────────────────\n');
    console.log(generated);
    console.log('\n────────────────────────────────────────────────────────────────────────');
    console.log(`\n✅  ${total} video(s) across ${matched.length} collection(s).`);
    console.log('Run with --write to patch lib/projects.ts automatically.\n');
    return;
  }

  // ── Patch lib/projects.ts ────────────────────────────────────────────────
  const __dir   = path.dirname(fileURLToPath(import.meta.url));
  const tsPath  = path.join(__dir, '..', 'lib', 'projects.ts');
  const source  = fs.readFileSync(tsPath, 'utf8');

  // Replace everything between the AUTO-SYNC markers (or append them)
  const START_MARKER = '  // ── AUTO-SYNC START (bunny) ──';
  const END_MARKER   = '  // ── AUTO-SYNC END (bunny) ──';

  const block = `${START_MARKER}\n${generated}\n  ${END_MARKER}`;

  let patched;
  if (source.includes(START_MARKER)) {
    const startIdx = source.indexOf(START_MARKER);
    const endIdx   = source.indexOf(END_MARKER) + END_MARKER.length;
    patched = source.slice(0, startIdx) + block + source.slice(endIdx);
  } else {
    // First time: insert before the closing `];`
    patched = source.replace(/^];/m, `${block}\n];`);
  }

  fs.writeFileSync(tsPath, patched, 'utf8');
  console.log(`\n✅  lib/projects.ts updated — ${total} video(s) written.\n`);
}

main().catch(err => {
  console.error('\n❌ ', err.message);
  process.exit(1);
});
