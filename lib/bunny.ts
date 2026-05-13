/**
 * lib/bunny.ts
 * Shared Bunny Stream constants and URL helpers.
 * Used by lib/projects.ts (project data) and scripts/sync-thumbnails.mjs.
 *
 * When adding a new project, use these helpers instead of building
 * URLs by hand:
 *
 *   import { bunnyPlayer, bunnyThumb } from '@/lib/bunny';
 *
 *   {
 *     id: 'mg99',
 *     title: 'My Project',
 *     desc: 'Motion Graphics',
 *     cat: 'motion',
 *     ratio: 'portrait',
 *     videoUrl: bunnyPlayer('your-video-guid-here'),
 *     thumbnail: bunnyThumb('your-video-guid-here'),   // default thumbnail.jpg
 *     // thumbnail: bunnyThumb('guid', 'thumbnail_abc123.jpg'), // after npm run thumbs
 *   }
 */

export const BUNNY_LIBRARY_ID = '657161';
export const BUNNY_CDN_HOST   = 'vz-cbc45619-72d.b-cdn.net';

/** Bunny Stream player embed URL. */
export const bunnyPlayer = (guid: string): string =>
  `https://player.mediadelivery.net/play/${BUNNY_LIBRARY_ID}/${guid}`;

/**
 * Bunny CDN thumbnail URL.
 * Pass the custom filename (e.g. 'thumbnail_abc123.jpg') when you have set
 * a manual thumbnail via the Bunny dashboard and run `npm run thumbs`.
 */
export const bunnyThumb = (guid: string, file = 'thumbnail.jpg'): string =>
  `https://${BUNNY_CDN_HOST}/${guid}/${file}`;
