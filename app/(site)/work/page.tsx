import MasonryGrid from '@/components/MasonryGrid';
import BackToTop from '@/components/BackToTop';
import { getProjects } from '@/lib/projects.server';

export default async function WorkPage() {
  const projects = await getProjects();

  return (
    <div className="page page-enter work-page">
      <div className="work-header">
        <div className="section-eyebrow">Portfolio</div>
        <h2 className="work-title">My Work</h2>
      </div>
      <MasonryGrid projects={projects} />
      <BackToTop />
    </div>
  );
}
