import type { Metadata } from 'next';
import { getAllProjects } from '@/lib/projects.server';
import FramePicker from '@/components/FramePicker';

export const metadata: Metadata = {
  title: 'Thumbnail Frame Picker',
  robots: { index: false, follow: false },
};

export default async function PickPage() {
  const projects = (await getAllProjects())
    .filter((p) => p.directVideoUrl)
    .map((p) => ({ id: p.id, title: p.title, videoSrc: p.directVideoUrl!, thumb: p.thumbnail ?? null }));

  return <FramePicker projects={projects} />;
}
