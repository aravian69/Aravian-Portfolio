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
        thumbnail: fields.url({
          label: 'Thumbnail image URL',
          description: 'The image shown on the Work grid card. For Bunny videos this is usually the .../thumbnail.jpg link.',
        }),
        // Pick the content type, then only the fields for that type appear.
        media: fields.conditional(
          fields.select({
            label: 'Content type',
            description: 'What this project shows when opened. Pick one and fill the fields that appear.',
            options: [
              { label: 'Normal video', value: 'video' },
              { label: 'Image gallery', value: 'gallery' },
              { label: 'Before / After comparison', value: 'comparison' },
            ],
            defaultValue: 'video',
          }),
          {
            video: fields.object({
              videoUrl: fields.url({
                label: 'Video URL',
                description: 'Bunny player link (or any embed). Plays in the modal.',
              }),
            }),
            gallery: fields.object({
              images: fields.array(
                fields.url({ label: 'Image URL' }),
                { label: 'Images', description: 'One or more frames. A single image is fine (the thumbnail also works on its own).', itemLabel: (p) => p.value || 'Image' }
              ),
            }),
            comparison: fields.object({
              beforeVideoUrl: fields.url({
                label: 'Before video (.mp4)',
                description: 'Raw / green-screen plate as a DIRECT .mp4 link (Bunny → enable "MP4 Fallback").',
              }),
              afterVideoUrl: fields.url({
                label: 'After video (.mp4)',
                description: 'Final composite as a DIRECT .mp4 link, same length / size / fps as the Before video.',
              }),
            }),
          }
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

    about: singleton({
      label: 'About page',
      path: 'content/about',
      format: { data: 'yaml' },
      schema: {
        portraitUrl: fields.url({
          label: 'Portrait image URL',
          description: 'Optional. A vertical photo works best. It appears faded into the right side of the page, behind your name.',
        }),
        skills: fields.text({
          label: 'Skills line (top-left)',
          defaultValue: 'VFX · Color Grading · Motion Graphics · AI Video · Graphic Design',
        }),
        clients: fields.text({
          label: 'Selected clients (top-right)',
          defaultValue: 'Le Minerale · Ichitan · Charm · Teh Celup Sosro · Amway · Tugu Insurance · Makuku · Mowilex',
        }),
        toolkit: fields.text({
          label: 'Toolkit (bottom-left)',
          defaultValue: 'After Effects · Blender · DaVinci Resolve · Photoshop',
        }),
        bio: fields.text({
          label: 'Bio paragraph (bottom-right)',
          multiline: true,
          defaultValue:
            'I craft visual stories that blur the line between reality and imagination. Every frame I touch is treated as art. Based in Jakarta, available for projects worldwide.',
        }),
      },
    }),

    contact: singleton({
      label: 'Contact page',
      path: 'content/contact',
      format: { data: 'yaml' },
      schema: {
        email: fields.text({
          label: 'Email',
          description: 'Shown as the big email link.',
          defaultValue: 'azizaravian@gmail.com',
        }),
        whatsapp: fields.text({
          label: 'WhatsApp number',
          description: 'Country code + number, digits only (e.g. 6281234567890). Leave blank to hide the WhatsApp button.',
          defaultValue: '',
        }),
        instagram: fields.text({
          label: 'Instagram handle',
          description: 'Without the @ (e.g. aziizaravian). Leave blank to hide the Instagram button.',
          defaultValue: 'aziizaravian',
        }),
        availabilityNote: fields.text({
          label: 'Availability note',
          description: 'The line next to the green dot.',
          defaultValue: 'Available for projects, usually replies within a day',
        }),
        location: fields.text({
          label: 'Location / timezone',
          defaultValue: 'Jakarta, Indonesia · GMT+7',
        }),
      },
    }),
  },
});
