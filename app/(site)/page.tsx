import HomeHero from '@/components/HomeHero';
import { getReelClips, getShowreelUrl } from '@/lib/projects.server';

export default async function HomePage() {
  const [showreelUrl, reelClips] = await Promise.all([getShowreelUrl(), getReelClips()]);
  return <HomeHero showreelUrl={showreelUrl} reelClips={reelClips} />;
}
