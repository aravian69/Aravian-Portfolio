import MasonryGrid from '@/components/MasonryGrid';
import BackToTop from '@/components/BackToTop';
import { getProjects } from '@/lib/projects.server';

/**
 * The Work screen, shared by /work (all) and /work/<category> so the two
 * routes never drift. `initialFilter` is the category id the grid opens on.
 */
export default async function WorkScreen({ initialFilter = 'all' }: { initialFilter?: string }) {
  const projects = await getProjects();

  return (
    <div className="page page-enter work-page">
      <div className="work-header">
        <div className="section-eyebrow">Portfolio</div>
        <h2 className="work-title">My Work</h2>
      </div>
      <MasonryGrid projects={projects} initialFilter={initialFilter} />
      <BackToTop />
    </div>
  );
}
