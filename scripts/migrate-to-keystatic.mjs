/**
 * migrate-to-keystatic.mjs  (one-time)
 * ────────────────────────────────────
 * Reads the legacy `projects` array from lib/projects.ts and writes one
 * Keystatic YAML entry per project into content/projects/<id>.yaml, matching
 * the schema in keystatic.config.ts. URLs are stored raw (no Cloudinary
 * transform) — lib/projects.ts re-applies clImg() when reading.
 *
 *   node scripts/migrate-to-keystatic.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const tsPath = path.join(__dir, '..', 'lib', 'projects.ts');
const outDir = path.join(__dir, '..', 'content', 'projects');

// Identity clImg so stored URLs stay raw (cloudinary transform is re-applied
// at read time in lib/projects.ts).
const clImg = (u) => u;

const src = fs.readFileSync(tsPath, 'utf8');

// Extract the array literal: from `export const projects ... = [` to the
// final `];`. The array is the last statement in the file.
const startMarker = src.indexOf('export const projects');
const openBracket = src.indexOf('[', startMarker);
const closeBracket = src.lastIndexOf('];');
const arrayText = src.slice(openBracket, closeBracket + 1);

// Evaluate it with our identity clImg in scope.
const projects = new Function('clImg', `return ${arrayText};`)(clImg);

function yamlString(s) {
  return `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function toYaml(p) {
  const lines = [];
  lines.push(`title: ${yamlString(p.title)}`);
  lines.push(`cat: ${p.cat}`);
  lines.push(`ratio: ${p.ratio}`);
  lines.push(`desc: ${yamlString(p.desc ?? '')}`);
  lines.push(`videoUrl: ${p.videoUrl ? yamlString(p.videoUrl) : 'null'}`);
  lines.push(`thumbnail: ${p.thumbnail ? yamlString(p.thumbnail) : 'null'}`);
  if (p.images && p.images.length) {
    lines.push('images:');
    for (const img of p.images) lines.push(`  - ${yamlString(img)}`);
  } else {
    lines.push('images: []');
  }
  lines.push(`tools: ${yamlString(p.tools ?? '')}`);
  lines.push(`year: ${typeof p.year === 'number' ? p.year : 'null'}`);
  return lines.join('\n') + '\n';
}

fs.mkdirSync(outDir, { recursive: true });
let n = 0;
for (const p of projects) {
  if (!p.id) continue;
  fs.writeFileSync(path.join(outDir, `${p.id}.yaml`), toYaml(p), 'utf8');
  n++;
}
console.log(`\n✅  Wrote ${n} project files to content/projects/\n`);
