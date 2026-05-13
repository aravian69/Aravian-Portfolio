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
const ACCESS_KEY = process.env.BUNNY_API_KEY ?? '35eef73a-c081-4722-8a97cba1649d-f40f-41ec';

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
