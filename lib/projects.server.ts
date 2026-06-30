import 'server-only';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config';
import { clImg } from '@/lib/cloudinary';
import type { Project, Category, Ratio } from '@/lib/projects';

const reader = createReader(process.cwd(), keystaticConfig);

// Bunny CDN host for this library — used to build direct MP4 URLs when only the
// player URL is available (most cards derive the MP4 from the thumbnail instead).
const BUNNY_CDN_HOST = 'vz-cbc45619-72d.b-cdn.net';
const GUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/**
 * Bunny serves a direct 720p MP4 next to every video's thumbnail.jpg (MP4
 * fallback). Derive it so grid cards can play the real footage on hover, and the
 * modal can play it natively (far faster to start than the iframe player). 720p
 * already exceeds both surfaces' display size, so it looks sharp while staying
 * light. Prefers the thumbnail (same id); falls back to the video URL's id.
 * Returns undefined when neither yields a Bunny id (keeps the static thumbnail).
 */
function bunnyDirectVideo(thumbnail?: string | null, videoUrl?: string): string | undefined {
  if (thumbnail && /\.b-cdn\.net\/[^/]+\/thumbnail\.jpg$/.test(thumbnail)) {
    return thumbnail.replace(/\/thumbnail\.jpg$/, '/play_720p.mp4');
  }
  const guid = videoUrl?.match(GUID_RE)?.[0];
  return guid ? `https://${BUNNY_CDN_HOST}/${guid}/play_720p.mp4` : undefined;
}

/**
 * Read every project from the Keystatic content store — including ones marked
 * hidden — and map each to the Project shape the UI expects. clImg() re-applies
 * the Cloudinary transform to stored raw image URLs (and passes non-Cloudinary
 * URLs through unchanged). Used by /manage so hidden items stay editable.
 */
/**
 * Flatten the Keystatic `media` conditional (video | gallery | comparison) back
 * into the flat fields the UI's Project shape uses, so the components don't need
 * to know about the discriminated structure.
 */
function readMedia(media: Awaited<ReturnType<typeof reader.collections.projects.all>>[number]['entry']['media']) {
  if (media.discriminant === 'video') {
    return { videoUrl: media.value.videoUrl || undefined };
  }
  if (media.discriminant === 'comparison') {
    return {
      beforeVideoUrl: media.value.beforeVideoUrl || undefined,
      afterVideoUrl: media.value.afterVideoUrl || undefined,
    };
  }
  // gallery
  const images = media.value.images.filter((u): u is string => !!u).map((u) => clImg(u));
  return { images: images.length ? images : undefined };
}

/** Normalise a Keystatic image-field value (bare filename or full path) to a usable src. */
function thumbUploadSrc(v?: string | null): string | undefined {
  if (!v) return undefined;
  return v.startsWith('/') ? v : `/uploads/thumbnails/${v}`;
}

export async function getAllProjects(): Promise<Project[]> {
  const entries = await reader.collections.projects.all();
  return entries
    .map(({ slug, entry }): Project => {
      const m = readMedia(entry.media);
      return {
        id: slug,
        title: entry.title,
        desc: entry.desc || undefined,
        cat: entry.cat as Category,
        ratio: entry.ratio as Ratio,
        videoUrl: m.videoUrl,
        beforeVideoUrl: m.beforeVideoUrl,
        afterVideoUrl: m.afterVideoUrl,
        images: m.images,
        // Uploaded image wins; otherwise fall back to the pasted URL. Keystatic
        // may return the upload as a bare filename or a full public path, so
        // normalise both to a usable /uploads/thumbnails/* src.
        thumbnail: thumbUploadSrc(entry.thumbnailUpload) || (entry.thumbnail ? clImg(entry.thumbnail) : undefined),
        // Hover preview is derived from the Bunny URL / video, not the upload.
        directVideoUrl: bunnyDirectVideo(entry.thumbnail, m.videoUrl),
        tools: entry.tools || undefined,
        year: entry.year ?? undefined,
        hidden: entry.hidden ?? false,
      };
    })
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

export interface AboutInfo {
  portraitUrl: string | null;
  skills: string;
  clients: string;
  toolkit: string;
  bio: string;
}

const ABOUT_DEFAULTS: AboutInfo = {
  portraitUrl: null,
  skills: 'VFX · Color Grading · Motion Graphics · AI Video · Graphic Design',
  clients: 'Le Minerale · Ichitan · Charm · Teh Celup Sosro · Amway · Tugu Insurance · Makuku · Mowilex',
  toolkit: 'After Effects · Blender · DaVinci Resolve · Photoshop',
  bio: 'I craft visual stories that blur the line between reality and imagination. Every frame I touch is treated as art. Based in Jakarta, available for projects worldwide.',
};

/** Read editable About-page content from the Keystatic singleton (with fallbacks). */
export async function getAbout(): Promise<AboutInfo> {
  const a = await reader.singletons.about.read();
  if (!a) return ABOUT_DEFAULTS;
  return {
    portraitUrl: a.portraitUrl || null,
    skills: a.skills || ABOUT_DEFAULTS.skills,
    clients: a.clients || ABOUT_DEFAULTS.clients,
    toolkit: a.toolkit || ABOUT_DEFAULTS.toolkit,
    bio: a.bio || ABOUT_DEFAULTS.bio,
  };
}

export interface ContactInfo {
  email: string;
  whatsapp: string;
  instagram: string;
  availabilityNote: string;
  location: string;
}

const CONTACT_DEFAULTS: ContactInfo = {
  email: 'azizaravian@gmail.com',
  whatsapp: '',
  instagram: 'aziizaravian',
  availabilityNote: 'Available for projects, usually replies within a day',
  location: 'Jakarta, Indonesia · GMT+7',
};

/** Read editable contact details from the Keystatic singleton (with fallbacks). */
export async function getContact(): Promise<ContactInfo> {
  const c = await reader.singletons.contact.read();
  if (!c) return CONTACT_DEFAULTS;
  return {
    email: c.email || CONTACT_DEFAULTS.email,
    whatsapp: c.whatsapp || '',
    instagram: c.instagram || '',
    availabilityNote: c.availabilityNote || CONTACT_DEFAULTS.availabilityNote,
    location: c.location || CONTACT_DEFAULTS.location,
  };
}
