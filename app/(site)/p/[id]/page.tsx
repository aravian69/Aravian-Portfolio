import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import WorkScreen from '@/components/WorkScreen';
import { getProjects } from '@/lib/projects.server';
import { CATEGORIES, projectPath } from '@/lib/projects';

// A project's shareable page: the Work grid with that project's popup open
// (MasonryGrid reads the id from the path). It exists so a shared link unfurls
// with the project's own title and preview image; see ./opengraph-image.tsx.

export const dynamicParams = false;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = (await getProjects()).find((p) => p.id === id);
  if (!project) return {};
  const cat = CATEGORIES.find((c) => c.id === project.cat)?.label ?? project.cat;
  const forBrand =
    project.brand && project.brand.toLowerCase() !== project.title.toLowerCase() ? ` for ${project.brand}` : '';
  const title = `${project.title} · ${cat} by Abdul Aziz`;
  const description = `${cat}${forBrand} by Abdul Aziz, a VFX, motion and AI video artist in Jakarta.`;
  const url = `https://www.rav709.site${projectPath(id)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'Abdul Aziz Portfolio', locale: 'en_US', type: 'website' },
    twitter: { card: 'summary_large_image', title, description, creator: '@aziizaravian' },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exists = (await getProjects()).some((p) => p.id === id);
  if (!exists) notFound();
  return <WorkScreen />;
}
