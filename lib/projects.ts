/**
 * lib/projects.ts — portfolio content types & categories (client-safe)
 *
 * Projects are managed in the Keystatic CMS (admin at /keystatic); each is a
 * YAML file in content/projects/. Reading them happens server-side in
 * lib/projects.server.ts (getProjects) — kept separate so this module, which
 * client components import for types and CATEGORIES, never pulls in Node fs.
 */

export type Category = 'vfx' | 'color' | 'motion' | 'ai' | 'editing' | 'graphic' | '3d';
export type Ratio    = 'portrait' | 'landscape' | 'square';
export type FilterId = Category | 'all';

export interface Project {
  id:        string;
  title:     string;
  desc?:     string;
  cat:       Category;
  ratio:     Ratio;
  videoUrl?: string;
  /** Direct .mp4 of the raw/before plate. When set with afterVideoUrl, the modal shows a before/after slider. */
  beforeVideoUrl?: string;
  /** Direct .mp4 of the final/after composite, paired with beforeVideoUrl. */
  afterVideoUrl?: string;
  thumbnail?: string;
  /** Slideshow images. First image is used as the grid thumbnail unless `thumbnail` overrides it. */
  images?: string[];
  /** Optional quick-facts shown in the project modal, e.g. 'After Effects + Blender'. */
  tools?: string;
  /** Optional year shown in the project modal. */
  year?: number;
  /** When true, hidden from the public site but still editable in the CMS / /manage. */
  hidden?: boolean;
}

export const CATEGORIES: { id: FilterId; label: string }[] = [
  { id: 'all',     label: 'All' },
  { id: 'vfx',     label: 'VFX' },
  { id: 'color',   label: 'Color Grading' },
  { id: 'motion',  label: 'Motion Graphics' },
  { id: 'ai',      label: 'AI Video' },
  { id: 'editing', label: 'Video Editing' },
  { id: 'graphic', label: 'Graphic Design' },
  { id: '3d',      label: '3D' },
];
