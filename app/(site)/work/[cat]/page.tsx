import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import WorkScreen from '@/components/WorkScreen';
import { CATEGORIES } from '@/lib/projects';

// Pre-render one static page per category (/work/ai-video, /work/vfx, …).
export function generateStaticParams() {
  return CATEGORIES.filter((c) => c.slug).map((c) => ({ cat: c.slug! }));
}

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }): Promise<Metadata> {
  const { cat } = await params;
  const category = CATEGORIES.find((c) => c.slug === cat);
  if (!category) return {};
  return {
    title: `${category.label} — Abdul Aziz`,
    alternates: { canonical: `https://www.rav709.site/work/${category.slug}` },
  };
}

export default async function WorkCategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params;
  const category = CATEGORIES.find((c) => c.slug === cat);
  if (!category) notFound();
  return <WorkScreen initialFilter={category.id} />;
}
