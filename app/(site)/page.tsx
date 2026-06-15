import HomeHero from '@/components/HomeHero';
import { getShowreelUrl } from '@/lib/projects.server';

export default async function HomePage() {
  const showreelUrl = await getShowreelUrl();
  return <HomeHero showreelUrl={showreelUrl} />;
}
