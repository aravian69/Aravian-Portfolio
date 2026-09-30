import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getProjects } from '@/lib/projects.server';
import { CATEGORIES } from '@/lib/projects';
import { ASPECT_RATIO } from '@/lib/aspectRatio';

// The link-preview card for one project (WhatsApp, Instagram DMs, X, LinkedIn…):
// its thumbnail beside its name, set in the site's own Syne + Manrope.
// Rendered at build for every public project.
export const alt = 'A project by Abdul Aziz';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BG = '#0a0a0f';
const TEXT = '#f4f4f6';
const MUTED = '#9a9aa2';
const ACCENT = '#b4ff00';
const PAD = 64;
const SITE = 'https://www.rav709.site/';

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ id: p.id }));
}

/**
 * Load the thumbnail as a data URI (the renderer only takes JPEG/PNG), from
 * public/ for uploads or over the network otherwise. Any failure just drops
 * the image; the card still renders with the text.
 */
async function thumbDataUri(src?: string): Promise<string | null> {
  if (!src) return null;
  try {
    if (src.startsWith('/')) {
      const ext = src.split('.').pop()?.toLowerCase();
      const mime = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : null;
      if (!mime) return null;
      const buf = await readFile(join(process.cwd(), 'public', src));
      return `data:${mime};base64,${buf.toString('base64')}`;
    }
    // Cloudinary's f_auto may answer with WebP/AVIF, so ask for a JPEG. Bunny
    // only serves thumbnails to requests that come from the site.
    const res = await fetch(src.replace('f_auto', 'f_jpg'), { headers: { Referer: SITE } });
    const type = (res.headers.get('content-type') ?? '').split(';')[0];
    if (!res.ok || !/^image\/(jpeg|png)$/.test(type)) return null;
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
  } catch {
    return null;
  }
}

/** A Google Font cut down to just `text`'s glyphs (a few KB), as TrueType. */
async function googleFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await fetch(url).then((r) => r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = (await getProjects()).find((p) => p.id === id);
  const title = project?.title ?? 'Abdul Aziz';
  const cat = CATEGORIES.find((c) => c.id === project?.cat)?.label ?? '';
  const brand = project?.brand && project.brand.toLowerCase() !== title.toLowerCase() ? project.brand : null;

  const displayText = `${title}Abdul Aziz`;
  const bodyText = `${cat.toUpperCase()}for ${brand ?? ''}rav709.site`;
  const [img, syne, manrope] = await Promise.all([
    thumbDataUri(project?.thumbnail ?? project?.images?.[0]),
    googleFont('Syne', 800, displayText),
    googleFont('Manrope', 600, bodyText),
  ]);
  // Both or neither: with a partial set, text in the missing face has no glyphs.
  const fonts = syne && manrope
    ? [
        { name: 'Syne', data: syne, weight: 800 as const, style: 'normal' as const },
        { name: 'Manrope', data: manrope, weight: 600 as const, style: 'normal' as const },
      ]
    : undefined;

  // Fit the thumbnail, at its true shape, into the right-hand box.
  const GAP = 56;
  const boxH = size.height - PAD * 2;
  const boxW = 500;
  const aspect =
    (project && ASPECT_RATIO[project.id]) ||
    (project?.ratio === 'landscape' ? 16 / 9 : project?.ratio === 'square' ? 1 : 9 / 16);
  const imgW = img ? Math.round(Math.min(boxW, boxH * aspect)) : 0;
  const imgH = Math.round(imgW / aspect);

  // Syne ExtraBold runs wide (capitals wider still). Step the size down as the
  // name gets longer, and never let its longest word outgrow the text column,
  // since a single word can't wrap.
  const colW = size.width - PAD * 2 - (img ? imgW + GAP : 0);
  const longest = title.split(/\s+/).reduce((a, w) => (w.length > a.length ? w : a), '');
  const emPerChar = longest === longest.toUpperCase() ? 1.3 : 1.0; // measured, with a little slack
  const byLength = title.length <= 10 ? 80 : title.length <= 16 ? 62 : title.length <= 24 ? 50 : 42;
  const titleSize = Math.min(byLength, Math.floor(colW / (Math.max(longest.length, 1) * emPerChar)));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: GAP,
          padding: PAD,
          background: `radial-gradient(1000px 640px at 18% 0%, rgba(180,255,0,0.12), rgba(10,10,15,0) 60%), ${BG}`,
          fontFamily: 'Manrope',
          fontWeight: 600,
        }}
      >
        <div style={{ width: colW, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 22, letterSpacing: 5, color: ACCENT }}>
            <div style={{ width: 40, height: 3, background: ACCENT }} />
            <div style={{ display: 'flex' }}>{cat.toUpperCase()}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Syne',
                fontWeight: 800,
                fontSize: titleSize,
                color: TEXT,
                letterSpacing: -1,
                lineHeight: 1.02,
              }}
            >
              {title}
            </div>
            {brand && <div style={{ display: 'flex', fontSize: 30, color: MUTED }}>for {brand}</div>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', fontFamily: 'Syne', fontWeight: 800, fontSize: 30, color: TEXT }}>Abdul Aziz</div>
            <div style={{ display: 'flex', fontSize: 24, color: ACCENT }}>rav709.site</div>
          </div>
        </div>

        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            width={imgW}
            height={imgH}
            style={{ objectFit: 'cover', borderRadius: 14, border: '2px solid rgba(255,255,255,0.1)' }}
          />
        )}
      </div>
    ),
    { ...size, fonts },
  );
}
