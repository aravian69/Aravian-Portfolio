import HomeHero from '@/components/HomeHero';
import type { ReelItem } from '@/components/ShowreelSpace';
import { getShowreelUrl, getProjects } from '@/lib/projects.server';

export default async function HomePage() {
  const [showreelUrl, projects] = await Promise.all([getShowreelUrl(), getProjects()]);
  // Only pieces with a thumbnail can float in the 3D space.
  const reel: ReelItem[] = projects
    .filter((p) => p.thumbnail)
    .map((p) => ({ id: p.id, title: p.title, thumb: p.thumbnail!, video: p.directVideoUrl, ratio: p.ratio }));
  return <HomeHero showreelUrl={showreelUrl} reel={reel} />;
}
