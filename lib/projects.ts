import { clImg } from '@/lib/cloudinary';

/**
 * lib/projects.ts — portfolio content
 *
 * Adding a new video project:
 *   1. Copy an existing entry that matches your ratio (portrait/landscape/square).
 *   2. Give it a unique `id`.
 *   3. Set `videoUrl` and `thumbnail` using the helpers from lib/bunny.ts:
 *        import { bunnyPlayer, bunnyThumb } from '@/lib/bunny';
 *        videoUrl:  bunnyPlayer('your-guid')
 *        thumbnail: bunnyThumb('your-guid')
 *   4. After setting a custom thumbnail in the Bunny dashboard, run `npm run thumbs`
 *      to auto-update the thumbnail filename in this file.
 *
 * Adding a new image project (3D / graphic):
 *   - Use `thumbnail` for a single image, or `images: [...]` for a slideshow.
 *   - No `videoUrl` needed.
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
  thumbnail?: string;
  /** Slideshow images. First image is used as the grid thumbnail unless `thumbnail` overrides it. */
  images?: string[];
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

export const projects: Project[] = [
  // 3D — Blender + Photoshop
  { id: '3d1', title: 'Train',                cat: '3d', ratio: 'landscape', desc: 'Blender + Photoshop', thumbnail: clImg('https://res.cloudinary.com/dnnkz3rzd/image/upload/v1778394685/train3_00000_ezzhtb.png') },
  { id: '3d2', title: 'Mist',                 cat: '3d', ratio: 'landscape', desc: 'Blender + Photoshop', thumbnail: clImg('https://res.cloudinary.com/dnnkz3rzd/image/upload/v1778394684/mist_00000_iz0czl.png') },
  { id: '3d3', title: 'Is There Someone Else',cat: '3d', ratio: 'landscape', desc: 'Blender + Photoshop', thumbnail: clImg('https://res.cloudinary.com/dnnkz3rzd/image/upload/v1778394683/istheresomeoneelse_00000_t9bdn7.png') },
  { id: '3d4', title: '3D Render 01',         cat: '3d', ratio: 'landscape', desc: 'Blender + Photoshop', thumbnail: clImg('https://res.cloudinary.com/dnnkz3rzd/image/upload/v1778394688/Untitled-3_00000_vjfnwk.png') },
  { id: '3d5', title: '3D Render 02',         cat: '3d', ratio: 'landscape', desc: 'Blender + Photoshop', thumbnail: clImg('https://res.cloudinary.com/dnnkz3rzd/image/upload/v1778394687/untitled1_tmgzqd.png') },
  { id: '3d6', title: '3D Render 03',         cat: '3d', ratio: 'landscape', desc: 'Blender + Photoshop', thumbnail: clImg('https://res.cloudinary.com/dnnkz3rzd/image/upload/v1778394681/1-1_00000_rcujrh.png') },
  {
    id: '3d7',
    title: 'Series',
    desc: 'Blender + Photoshop · 6 frames',
    cat: '3d',
    ratio: 'portrait',
    images: [
      clImg('https://res.cloudinary.com/dnnkz3rzd/image/upload/v1778394677/1_1_xvgdjz.png'),
      clImg('https://res.cloudinary.com/dnnkz3rzd/image/upload/v1778394677/1_2_ca7v3b.png'),
      clImg('https://res.cloudinary.com/dnnkz3rzd/image/upload/v1778394677/1_3_onl5fn.png'),
      clImg('https://res.cloudinary.com/dnnkz3rzd/image/upload/v1778394678/1_4_cpitws.png'),
      clImg('https://res.cloudinary.com/dnnkz3rzd/image/upload/v1778394679/1_5_pg9x25.png'),
      clImg('https://res.cloudinary.com/dnnkz3rzd/image/upload/v1778394679/1_6_ckjnsq.png'),
    ],
  },

  // VFX — Sutra (Skin Retouch)
  { id: 'vfx1', title: 'Sutra', desc: 'Skin Retouch + Pack Fingerprint Removal 01', cat: 'vfx', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/416dd24a-fd6d-47bb-a2fa-54a479bef8fb', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/416dd24a-fd6d-47bb-a2fa-54a479bef8fb/thumbnail.jpg' },
  { id: 'vfx2', title: 'Sutra', desc: 'Skin Retouch + Pack Fingerprint Removal 02', cat: 'vfx', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/e679a5b5-4c49-4c73-8cfd-c00857b13c76', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/e679a5b5-4c49-4c73-8cfd-c00857b13c76/thumbnail.jpg' },
  { id: 'vfx3', title: 'Sutra', desc: 'Skin Retouch + Pack Fingerprint Removal 03', cat: 'vfx', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/35bdb33c-1e9f-45e3-9910-c0abbe125be6', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/35bdb33c-1e9f-45e3-9910-c0abbe125be6/thumbnail.jpg' },
  { id: 'vfx4', title: 'Sutra', desc: 'Skin Retouch + Pack Fingerprint Removal 04', cat: 'vfx', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/c4e5959d-1116-4bce-8379-bfffc3aa99f1', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/c4e5959d-1116-4bce-8379-bfffc3aa99f1/thumbnail.jpg' },
  { id: 'vfx5', title: 'MOWILEX', desc: 'Video Cleaning + Shadow Fix + BG Replace', cat: 'vfx', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/85dee85e-8d4e-4044-8040-6c3ed796c1ff', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/85dee85e-8d4e-4044-8040-6c3ed796c1ff/thumbnail_2615f63b.jpg' },
  { id: 'vfx6', title: 'ICHITAN', desc: 'Compositing + Rotoscope + Sound Design 01', cat: 'vfx', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/e1c4623d-d042-478a-832a-fd6da0a90529', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/e1c4623d-d042-478a-832a-fd6da0a90529/thumbnail.jpg' },
  { id: 'vfx7', title: 'ICHITAN', desc: 'Compositing + Rotoscope + Sound Design 02', cat: 'vfx', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/ef2039f0-8d3f-47c2-ad03-bcc5a6bec661', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/ef2039f0-8d3f-47c2-ad03-bcc5a6bec661/thumbnail.jpg' },
  { id: 'vfx8', title: 'Latitude Communication', desc: '3D Animation + Compositing', cat: '3d', ratio: 'square', videoUrl: 'https://player.mediadelivery.net/play/657161/5bddbd6e-fe26-4188-ba94-4dc258705562', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/5bddbd6e-fe26-4188-ba94-4dc258705562/thumbnail.jpg' },

  // Video Editing — Reels
  { id: 'edit1',  title: 'Teh Celup Sosro', desc: 'Reels Video 01', cat: 'editing', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/9f5e22a9-08ec-4695-bc0b-1a99157a7963', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/9f5e22a9-08ec-4695-bc0b-1a99157a7963/thumbnail.jpg' },
  { id: 'edit2',  title: 'Teh Celup Sosro', desc: 'Reels Video 02', cat: 'editing', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/2a88c3d7-e155-41ae-80ac-1bb4c5e9e897', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/2a88c3d7-e155-41ae-80ac-1bb4c5e9e897/thumbnail.jpg' },
  { id: 'edit3',  title: 'Chocodrink',     desc: 'Reels Video 01', cat: 'editing', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/083b4e1c-a0ff-4eaa-afee-51f5a975c6ae', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/083b4e1c-a0ff-4eaa-afee-51f5a975c6ae/thumbnail.jpg' },
  { id: 'edit4',  title: 'Chocodrink',     desc: 'Reels Video 02', cat: 'editing', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/f3a57429-13b4-430c-8cb0-5787d856e40b', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/f3a57429-13b4-430c-8cb0-5787d856e40b/thumbnail.jpg' },
  { id: 'edit5',  title: 'Wow Spageti',    desc: 'Reels Video 01', cat: 'editing', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/81e0e2dc-93a2-4ef0-a913-49895686ac0a', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/81e0e2dc-93a2-4ef0-a913-49895686ac0a/thumbnail.jpg' },
  { id: 'edit6',  title: 'Wow Spageti',    desc: 'Reels Video 02', cat: 'editing', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/1f51cffd-ba96-49af-9d70-f76d7e133337', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/1f51cffd-ba96-49af-9d70-f76d7e133337/thumbnail.jpg' },
  { id: 'edit7',  title: 'Milkjus',        desc: 'Reels Video 01', cat: 'editing', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/69254eac-ebdd-44f9-bef0-202cbc55b073', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/69254eac-ebdd-44f9-bef0-202cbc55b073/thumbnail.jpg' },
  { id: 'edit8',  title: 'Milkjus',        desc: 'Reels Video 02', cat: 'editing', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/5d0a828d-0c00-4634-b2b7-fb47438757f5', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/5d0a828d-0c00-4634-b2b7-fb47438757f5/thumbnail.jpg' },
  { id: 'edit9',  title: 'Milkjus',        desc: 'Reels Video 03', cat: 'editing', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/bcf26c7e-8421-4718-bc00-7fbe89b85050', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/bcf26c7e-8421-4718-bc00-7fbe89b85050/thumbnail.jpg' },
  { id: 'edit10', title: 'Charm',          desc: 'Reels Video 01', cat: 'editing', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/d0e37c85-df76-4a01-b840-434d616a9555', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/d0e37c85-df76-4a01-b840-434d616a9555/thumbnail.jpg' },
  { id: 'edit11', title: 'Charm',          desc: 'Reels Video 02', cat: 'editing', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/d7423a86-47a6-49c2-9f4f-ce9cad6c6575', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/d7423a86-47a6-49c2-9f4f-ce9cad6c6575/thumbnail_74cd4536.jpg' },
  { id: 'edit12', title: 'Charm',          desc: 'Reels Video 03', cat: 'editing', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/c816602b-c37f-43d5-bcfa-d4a8139e03b8', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/c816602b-c37f-43d5-bcfa-d4a8139e03b8/thumbnail.jpg' },

  // Video Editing — YouTube
  { id: 'edit13', title: 'Casper SMC',      desc: 'YouTube Edit + Motion Graphics 01', cat: 'editing', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/577737af-3ffe-4928-b134-ce681971250b', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/577737af-3ffe-4928-b134-ce681971250b/thumbnail.jpg' },
  { id: 'edit14', title: 'Casper SMC',      desc: 'YouTube Edit + Motion Graphics 02', cat: 'editing', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/23513ed6-b0e0-415f-a7a4-3f27ced38895', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/23513ed6-b0e0-415f-a7a4-3f27ced38895/thumbnail.jpg' },
  { id: 'edit15', title: 'Casper SMC',      desc: 'YouTube Edit + Motion Graphics 03', cat: 'editing', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/763fd0fb-9998-417d-ba3d-036263def1c6', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/763fd0fb-9998-417d-ba3d-036263def1c6/thumbnail.jpg' },
  { id: 'edit16', title: 'Casper SMC',      desc: 'YouTube Edit + Motion Graphics 04', cat: 'editing', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/dd89a3c8-3640-48e8-aa38-509cda671a05', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/dd89a3c8-3640-48e8-aa38-509cda671a05/thumbnail.jpg' },
  { id: 'edit17', title: 'Make Money Matt', desc: 'YouTube Edit + Motion Graphics',    cat: 'editing', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/de6118ed-5f60-455a-a836-6bac54120d3e', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/de6118ed-5f60-455a-a836-6bac54120d3e/thumbnail.jpg' },

  // Video Editing — Tugu Insurance
  { id: 'tugu1', title: 'Tugu Insurance', desc: 'Video Editing, VFX', cat: 'editing', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/80a65acd-64b2-4f38-aeea-7fbff8ebf72b', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/80a65acd-64b2-4f38-aeea-7fbff8ebf72b/thumbnail.jpg' },
  { id: 'tugu2', title: 'Tugu Insurance', desc: 'Video Editing, VFX', cat: 'editing', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/7c3d93ce-7a7a-45b8-8415-a6af5bdef653', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/7c3d93ce-7a7a-45b8-8415-a6af5bdef653/thumbnail.jpg' },
  { id: 'tugu3', title: 'Tugu Insurance', desc: 'Video Editing, VFX', cat: 'editing', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/fc1e6db2-6f88-4c17-a0de-db8da71a5cce', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/fc1e6db2-6f88-4c17-a0de-db8da71a5cce/thumbnail.jpg' },
  { id: 'tugu4', title: 'Tugu Insurance', desc: 'Video Editing, VFX', cat: 'editing', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/0565cecc-d545-4659-8e87-4fe791781e3c', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/0565cecc-d545-4659-8e87-4fe791781e3c/thumbnail.jpg' },
  { id: 'tugu5', title: 'Tugu Insurance', desc: 'Video Editing, VFX', cat: 'editing', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/478c7ef7-70c7-495b-ae73-87a4365737e7', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/478c7ef7-70c7-495b-ae73-87a4365737e7/thumbnail.jpg' },
  { id: 'tugu6', title: 'Tugu Insurance', desc: 'Video Editing, VFX', cat: 'editing', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/9967d092-0703-48e1-9ac5-737907b5c6c4', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/9967d092-0703-48e1-9ac5-737907b5c6c4/thumbnail.jpg' },
  { id: 'tugu7', title: 'Tugu Insurance', desc: 'Video Editing, VFX', cat: 'editing', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/bda85093-6778-405f-999c-126ab1e573d9', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/bda85093-6778-405f-999c-126ab1e573d9/thumbnail.jpg' },
  { id: 'tugu8', title: 'Tugu Insurance', desc: 'Video Editing, VFX', cat: 'editing', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/984f9f29-8766-4a1d-9be0-ccff0eec1039', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/984f9f29-8766-4a1d-9be0-ccff0eec1039/thumbnail.jpg' },

  // Motion Graphics — Milkjus
  { id: 'mg1',  title: 'Milkjus',        desc: 'Motion Graphics 01', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/c6bca9a1-c8ea-4920-a064-fa809893f56f', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/c6bca9a1-c8ea-4920-a064-fa809893f56f/thumbnail.jpg' },
  { id: 'mg2',  title: 'Milkjus',        desc: 'Motion Graphics 02', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/4001bd04-4f2e-464d-8629-96bd57429d6a', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/4001bd04-4f2e-464d-8629-96bd57429d6a/thumbnail.jpg' },

  // Motion Graphics — Chocodrink
  { id: 'mg3',  title: 'Chocodrink',     desc: 'Motion Graphics 01', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/eaa07b42-d67c-42cf-92ae-3c713f57104a', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/eaa07b42-d67c-42cf-92ae-3c713f57104a/thumbnail.jpg' },
  { id: 'mg4',  title: 'Chocodrink',     desc: 'Motion Graphics 02', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/20f4e143-5526-4955-bf96-047b49684d81', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/20f4e143-5526-4955-bf96-047b49684d81/thumbnail.jpg' },
  { id: 'mg5',  title: 'Chocodrink',     desc: 'Motion Graphics 03', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/d316f391-9e2d-410d-827c-04df495e7cf1', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/d316f391-9e2d-410d-827c-04df495e7cf1/thumbnail.jpg' },
  { id: 'mg6',  title: 'Chocodrink',     desc: 'Motion Graphics 04', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/b0b0c7e5-1078-4da9-8d8c-eac0c14b6b9d', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/b0b0c7e5-1078-4da9-8d8c-eac0c14b6b9d/thumbnail.jpg' },

  // Motion Graphics — ICHITAN
  { id: 'mg7',  title: 'ICHITAN',        desc: 'Motion Graphics 01', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/291fe949-b274-42d9-a499-c368b663d354', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/291fe949-b274-42d9-a499-c368b663d354/thumbnail.jpg' },
  { id: 'mg8',  title: 'ICHITAN',        desc: 'Motion Graphics 02', cat: 'motion', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/8c58f461-1655-402b-a3e2-2cbfac050f94', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/8c58f461-1655-402b-a3e2-2cbfac050f94/thumbnail.jpg' },

  // Motion Graphics — Le Minerale
  { id: 'mg9',  title: 'Le Minerale',    desc: 'Motion Graphics 01', cat: 'motion', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/6f396c67-b53b-4508-b776-98e1e922f928', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/6f396c67-b53b-4508-b776-98e1e922f928/thumbnail.jpg' },
  { id: 'mg10', title: 'Le Minerale',    desc: 'Motion Graphics 02', cat: 'motion', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/63ab1d54-448d-42dd-81ca-fbd13ae6763e', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/63ab1d54-448d-42dd-81ca-fbd13ae6763e/thumbnail.jpg' },
  { id: 'mg11', title: 'Le Minerale',    desc: 'Motion Graphics 03', cat: 'motion', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/f66fb2fd-d62d-4443-a747-698d5f6812b8', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/f66fb2fd-d62d-4443-a747-698d5f6812b8/thumbnail.jpg' },
  { id: 'mg12', title: 'Le Minerale',    desc: 'Motion Graphics 04', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/c33ae17b-6662-41a0-bef9-fdeff1384e00', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/c33ae17b-6662-41a0-bef9-fdeff1384e00/thumbnail.jpg' },

  // Motion Graphics — Charm
  { id: 'mg13', title: 'Charm',          desc: 'Motion Graphics 01', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/3e1513e4-ea06-499e-be19-fc0a079c7bd2', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/3e1513e4-ea06-499e-be19-fc0a079c7bd2/thumbnail_fa1a983b.jpg' },
  { id: 'mg14', title: 'Charm',          desc: 'Motion Graphics 02', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/29b0bbdf-7eac-4755-b1de-1fecc921d207', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/29b0bbdf-7eac-4755-b1de-1fecc921d207/thumbnail.jpg' },
  { id: 'mg15', title: 'Charm',          desc: 'Motion Graphics 03', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/b19d703d-002a-417f-aaf8-0e0cd195e418', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/b19d703d-002a-417f-aaf8-0e0cd195e418/thumbnail.jpg' },
  { id: 'mg16', title: 'Charm',          desc: 'Motion Graphics 04', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/2d0357ca-c261-485a-9e1c-abe984b1df50', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/2d0357ca-c261-485a-9e1c-abe984b1df50/thumbnail.jpg' },
  { id: 'mg17', title: 'Charm',          desc: 'Motion Graphics 05', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/a353ce85-e4b7-4a6d-8a45-3676759912d9', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/a353ce85-e4b7-4a6d-8a45-3676759912d9/thumbnail.jpg' },
  { id: 'mg18', title: 'Charm',          desc: 'Motion Graphics 06', cat: 'motion', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/5b2a7ddf-805a-4172-9560-2f28146566b3', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/5b2a7ddf-805a-4172-9560-2f28146566b3/thumbnail.jpg' },

  // Motion Graphics — Teh Celup Sosro
  { id: 'mg19', title: 'Teh Celup Sosro', desc: 'Motion Graphics 01', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/63264d21-d215-40d7-af8a-ae95871d7b8f', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/63264d21-d215-40d7-af8a-ae95871d7b8f/thumbnail.jpg' },
  { id: 'mg20', title: 'Teh Celup Sosro', desc: 'Motion Graphics 02', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/a5132755-5524-4d46-98e1-7989e0f6cc62', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/a5132755-5524-4d46-98e1-7989e0f6cc62/thumbnail.jpg' },
  { id: 'mg21', title: 'Teh Celup Sosro', desc: 'Motion Graphics 03', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/ff6e5af2-5119-4027-949d-80c3cca574ea', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/ff6e5af2-5119-4027-949d-80c3cca574ea/thumbnail.jpg' },
  { id: 'mg22', title: 'Teh Celup Sosro', desc: 'Motion Graphics 04', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/5a55e3e6-da38-4f1c-8716-753fbcec0236', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/5a55e3e6-da38-4f1c-8716-753fbcec0236/thumbnail.jpg' },
  { id: 'mg23', title: 'Teh Celup Sosro', desc: 'Motion Graphics 05', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/62bc877e-ea57-4567-93a5-8d8e3f5ae2da', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/62bc877e-ea57-4567-93a5-8d8e3f5ae2da/thumbnail.jpg' },
  { id: 'mg24', title: 'Teh Celup Sosro', desc: 'Motion Graphics 06', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/df8a06dc-0992-438c-963a-464917661a2f', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/df8a06dc-0992-438c-963a-464917661a2f/thumbnail.jpg' },
  { id: 'mg25', title: 'Teh Celup Sosro', desc: 'Motion Graphics 07', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/0da11828-5130-4608-88bd-45c416893950', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/0da11828-5130-4608-88bd-45c416893950/thumbnail.jpg' },
  { id: 'mg26', title: 'Teh Celup Sosro', desc: 'Motion Graphics 08', cat: 'motion', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/05171907-959f-4f4f-9b54-dab3232c1663', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/05171907-959f-4f4f-9b54-dab3232c1663/thumbnail.jpg' },

  // AI — MAKUKU
  { id: 'ai1', title: 'MAKUKU', desc: 'AI Animation Video', cat: 'ai', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/19e9587a-e6fd-479a-ad17-109add641840', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/19e9587a-e6fd-479a-ad17-109add641840/thumbnail.jpg' },
  { id: 'ai2', title: 'MAKUKU', desc: 'Teaser Animation',   cat: 'ai', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/4f40e774-82af-4062-b82b-0b6279afd390', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/4f40e774-82af-4062-b82b-0b6279afd390/thumbnail_74bba5fc.jpg' },
  { id: 'ai3', title: 'MAKUKU', desc: 'AI Video Stillo',    cat: 'ai', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/dd49b8ed-4e70-4a77-af4e-049b5adf0908', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/dd49b8ed-4e70-4a77-af4e-049b5adf0908/thumbnail.jpg' },

  // AI — ASIX
  { id: 'ai4', title: 'ASIX', desc: 'AI Video + VFX + Motion Graphic', cat: 'ai', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/61e82430-8faf-4cb7-b51a-b9a7a4d5fe43', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/61e82430-8faf-4cb7-b51a-b9a7a4d5fe43/thumbnail.jpg' },

  // AI — Amway Spring
  { id: 'ai5', title: 'Amway Spring', desc: 'AI Video 01', cat: 'ai', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/a19fa35b-66eb-42a0-bfe3-824a23742aaf', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/a19fa35b-66eb-42a0-bfe3-824a23742aaf/thumbnail.jpg' },
  { id: 'ai6', title: 'Amway Spring', desc: 'AI Video 02', cat: 'ai', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/8c39b453-f4d5-4e4e-8fdd-dac3f20b646e', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/8c39b453-f4d5-4e4e-8fdd-dac3f20b646e/thumbnail.jpg' },

  // AI — Enfagrow
  { id: 'ai7', title: 'Enfagrow', desc: 'AI Video + Motion Graphic', cat: 'ai', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/def7933c-00c0-4c21-b29c-ff47db84ce2b', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/def7933c-00c0-4c21-b29c-ff47db84ce2b/thumbnail.jpg' },

  // AI — Friendship
  { id: 'ai8', title: 'Friendship', desc: 'AI Video 01', cat: 'ai', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/c7e7a96f-f197-45cd-b062-8d65cfd12587', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/c7e7a96f-f197-45cd-b062-8d65cfd12587/thumbnail.jpg' },
  { id: 'ai9', title: 'Friendship', desc: 'AI Video 02', cat: 'ai', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/d0eb4136-03ea-4034-b0b4-6e7e8ae1edd3', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/d0eb4136-03ea-4034-b0b4-6e7e8ae1edd3/thumbnail.jpg' },

  // AI — Dahlia Heritage Series
  { id: 'ai10', title: 'Dahlia Heritage Series', desc: 'AI Video', cat: 'ai', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/0a1ebe4e-9cc0-4a2c-97d5-2750e0a08595', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/0a1ebe4e-9cc0-4a2c-97d5-2750e0a08595/thumbnail.jpg' },

  // AI — Tasseo
  { id: 'ai11', title: 'Tasseo', desc: 'AI Video 01', cat: 'ai', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/301d9028-54c8-448b-aafd-71676775905b', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/301d9028-54c8-448b-aafd-71676775905b/thumbnail.jpg' },
  { id: 'ai12', title: 'Tasseo', desc: 'AI Video 02', cat: 'ai', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/44105515-f4dd-4db0-8f3d-b3e98b5935ba', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/44105515-f4dd-4db0-8f3d-b3e98b5935ba/thumbnail.jpg' },
  { id: 'ai13', title: 'Tasseo', desc: 'AI Video 03', cat: 'ai', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/f0d91dee-4d6b-4ae1-a959-fc7dcdc19b9c', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/f0d91dee-4d6b-4ae1-a959-fc7dcdc19b9c/thumbnail.jpg' },
  { id: 'ai14', title: 'Tasseo', desc: 'AI Video 04', cat: 'ai', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/697c827c-4c6f-4481-9c00-a3c04f210676', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/697c827c-4c6f-4481-9c00-a3c04f210676/thumbnail.jpg' },
  { id: 'ai15', title: 'Tasseo', desc: 'AI Video 05', cat: 'ai', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/55d6761f-7de8-4a69-bdc0-38d237cb258f', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/55d6761f-7de8-4a69-bdc0-38d237cb258f/thumbnail.jpg' },
  { id: 'ai16', title: 'Tasseo', desc: 'AI Video 06', cat: 'ai', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/556345c9-c796-4171-ab50-f95f9ac07828', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/556345c9-c796-4171-ab50-f95f9ac07828/thumbnail.jpg' },
  { id: 'ai17', title: 'Tasseo', desc: 'AI Video 07', cat: 'ai', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/d5407b1b-dc62-4412-be5a-a332466a597f', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/d5407b1b-dc62-4412-be5a-a332466a597f/thumbnail.jpg' },

  // AI — Ekonomi
  { id: 'ai18', title: 'Ekonomi', desc: 'AI Video + Motion Graphic', cat: 'ai', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/439758bb-c041-4da1-aa0b-a4c00d594cc1', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/439758bb-c041-4da1-aa0b-a4c00d594cc1/thumbnail.jpg' },

  // AI — Amway Make up
  { id: 'ai19', title: 'Amway Make Up', desc: 'AI Video', cat: 'ai', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/4ede6b03-b12b-4898-9cdf-00f9c0808f78', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/4ede6b03-b12b-4898-9cdf-00f9c0808f78/thumbnail.jpg' },

  // AI — Teh Celup Sosro
  { id: 'ai20', title: 'Teh Celup Sosro', desc: 'AI Video + Motion Graphic 01', cat: 'ai', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/0b2b5544-9926-4767-a237-13863621a280', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/0b2b5544-9926-4767-a237-13863621a280/thumbnail.jpg' },
  { id: 'ai21', title: 'Teh Celup Sosro', desc: 'AI Video + Motion Graphic 02', cat: 'ai', ratio: 'portrait', videoUrl: 'https://player.mediadelivery.net/play/657161/9729df3c-eae0-483f-8c0a-efaf1c17b5f1', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/9729df3c-eae0-483f-8c0a-efaf1c17b5f1/thumbnail.jpg' },

  // AI — JUTA
  { id: 'ai22', title: 'JUTA', desc: 'AI Video 01', cat: 'ai', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/2f50021e-428e-41d4-810c-f4b67eed4687', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/2f50021e-428e-41d4-810c-f4b67eed4687/thumbnail.jpg' },
  { id: 'ai23', title: 'JUTA', desc: 'AI Video 02', cat: 'ai', ratio: 'landscape', videoUrl: 'https://player.mediadelivery.net/play/657161/8f2aa6da-74a3-421c-b6a0-20b1f0358873', thumbnail: 'https://vz-cbc45619-72d.b-cdn.net/8f2aa6da-74a3-421c-b6a0-20b1f0358873/thumbnail.jpg' },
];
