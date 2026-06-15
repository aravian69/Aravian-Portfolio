import { config, collection, fields } from '@keystatic/core';

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
});
