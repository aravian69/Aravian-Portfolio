import { config, collection, singleton, fields } from '@keystatic/core';

export default config({
  // Defaults to local-filesystem editing so the site always builds. Set the
  // public flag NEXT_PUBLIC_KEYSTATIC_GITHUB=true (plus the three KEYSTATIC_*
  // GitHub App vars) on Vercel to switch to GitHub mode, where saving in the
  // admin commits to the repo and triggers a deploy. See SETUP-CMS.md.
  storage:
    process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB === 'true'
      ? { kind: 'github', repo: 'aravian69/Aravian-Portfolio' }
      : { kind: 'local' },

  ui: {
    brand: { name: 'Aravian Portfolio' },
  },

  collections: {
    projects: collection({
      label: 'Projects',
      path: 'content/projects/*',
      format: { data: 'yaml' },
      slugField: 'title',
      columns: ['title', 'cat'],
      schema: {
        hidden: fields.checkbox({
          label: 'Hide from site',
          description: 'When on, this project is hidden from the public site (Work grid). It stays in the CMS so you can show it again anytime.',
          defaultValue: false,
        }),
        title: fields.slug({
          name: { label: 'Title', validation: { isRequired: true } },
          slug: {
            label: 'ID (filename)',
            description: 'Unique id, e.g. mg27. Used as the filename.',
          },
        }),
        cat: fields.select({
          label: 'Category',
          options: [
            { label: 'VFX', value: 'vfx' },
            { label: 'Color Grading', value: 'color' },
            { label: 'Motion Graphics', value: 'motion' },
            { label: 'AI Video', value: 'ai' },
            { label: 'Video Editing', value: 'editing' },
            { label: 'Graphic Design', value: 'graphic' },
            { label: '3D', value: '3d' },
          ],
          defaultValue: 'motion',
        }),
        ratio: fields.select({
          label: 'Orientation',
          options: [
            { label: 'Portrait (vertical)', value: 'portrait' },
            { label: 'Landscape (horizontal)', value: 'landscape' },
            { label: 'Square', value: 'square' },
          ],
          defaultValue: 'portrait',
        }),
        desc: fields.text({ label: 'Short description', description: 'e.g. "Motion Graphics 07"' }),
        videoUrl: fields.url({ label: 'Video URL', description: 'Bunny player link (leave blank for image-only projects)' }),
        beforeVideoUrl: fields.url({
          label: 'Before video (.mp4) — comparison slider',
          description: 'Optional. Raw / green-screen plate as a DIRECT .mp4 link (Bunny → enable "MP4 Fallback"). Fill BOTH this and the After field below to show a drag-to-compare before/after slider instead of the normal player.',
        }),
        afterVideoUrl: fields.url({
          label: 'After video (.mp4) — comparison slider',
          description: 'Optional. Final composite as a DIRECT .mp4 link, same length / size / fps as the Before video.',
        }),
        thumbnail: fields.url({ label: 'Thumbnail image URL' }),
        images: fields.array(
          fields.url({ label: 'Image URL' }),
          { label: 'Slideshow images', description: 'For image projects with multiple frames', itemLabel: (p) => p.value || 'Image' }
        ),
        tools: fields.text({ label: 'Tools used', description: 'Optional, e.g. "After Effects + Blender"' }),
        year: fields.integer({ label: 'Year', description: 'Optional' }),
      },
    }),
  },

  singletons: {
    home: singleton({
      label: 'Home page',
      path: 'content/home',
      format: { data: 'yaml' },
      schema: {
        showreelUrl: fields.url({
          label: 'Showreel video URL',
          description:
            'The video shown in the "Watch Showreel" popup. Paste a Bunny / YouTube / Vimeo embed (player) URL. Leave blank to show a placeholder.',
        }),
      },
    }),
  },
});
