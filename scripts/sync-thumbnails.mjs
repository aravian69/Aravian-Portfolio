/**
 * sync-thumbnails.mjs
 * Fetches the current thumbnailFileName for every Bunny video in projects.ts
 * and updates the thumbnail URLs automatically.
 *
 * Usage:
 *   node scripts/sync-thumbnails.mjs
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECTS_PATH = path.join(__dirname, '..', 'lib', 'projects.ts');
const LIBRARY_ID = '657161';
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

const ACCESS_KEY = process.env.BUNNY_API_KEY;
if (!ACCESS_KEY) {
  console.error('\n❌  Set BUNNY_API_KEY in .env.local first.\n');
  process.exit(1);
}

function fetchJSON(urlPath) {
  return new Promise((res, rej) => {
    const opts = {
      hostname: 'video.bunnycdn.com',
      path: urlPath,
      headers: { AccessKey: ACCESS_KEY },
    };
    https.get(opts, r => {
      let d = '';
      r.on('data', c => (d += c));
      r.on('end', () => {
        try { res(JSON.parse(d)); } catch (e) { rej(e); }
      });
    }).on('error', rej);
  });
}

// Extract all unique GUIDs from projects.ts
let src = fs.readFileSync(PROJECTS_PATH, 'utf8');
const guids = [...new Set([...src.matchAll(new RegExp(`${LIBRARY_ID}/([a-f0-9-]{36})'`, 'g'))].map(m => m[1]))];

console.log(`Found ${guids.length} videos — fetching thumbnail filenames...`);

const results = await Promise.all(
  guids.map(async guid => {
    const data = await fetchJSON(`/library/${LIBRARY_ID}/videos/${guid}`);
    const fname = data.thumbnailFileName ?? 'thumbnail.jpg';
    return { guid, fname };
  })
);

let updated = 0;

for (const { guid, fname } of results) {
  if (fname === 'thumbnail.jpg') continue; // nothing to change

  // Replace any existing thumbnail filename for this guid
  const pattern = new RegExp(
    `(https://vz-[^/]+/${guid}/)(thumbnail[^'"]*)`,
    'g'
  );
  const before = src;
  src = src.replace(pattern, `$1${fname}`);
  if (src !== before) {
    console.log(`  ✓ ${guid.slice(0, 8)}… → ${fname}`);
    updated++;
  }
}

if (updated > 0) {
  fs.writeFileSync(PROJECTS_PATH, src, 'utf8');
  console.log(`\nUpdated ${updated} thumbnail(s) in lib/projects.ts`);
} else {
  console.log('\nAll thumbnails already up to date.');
}
