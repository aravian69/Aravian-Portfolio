import type { Metadata } from 'next';
// The preview plays the real showreel player, which is styled by the site CSS.
import '../globals.css';
import ReelPicker, { type PickerItem } from '@/components/ReelPicker';
import { getReelSource, toReelClip } from '@/lib/projects.server';
import { CATEGORIES } from '@/lib/projects';

export const metadata: Metadata = {
  title: 'Showreel Picker',
  robots: { index: false, follow: false },
};

const CAT_ORDER = CATEGORIES.map((c) => c.id as string);

export default async function ReelPage() {
  const { playable, chosen, auto } = await getReelSource();
  const items: PickerItem[] = playable
    .map((p) => ({ ...toReelClip(p), title: p.title, catId: p.cat }))
    .sort((a, b) => CAT_ORDER.indexOf(a.catId) - CAT_ORDER.indexOf(b.catId) || a.id.localeCompare(b.id, undefined, { numeric: true }));

  return <ReelPicker items={items} initial={chosen.map((p) => p.id)} auto={auto.map((p) => p.id)} />;
}
