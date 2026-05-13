import MasonryGrid from '@/components/MasonryGrid';
import BackToTop from '@/components/BackToTop';

export default function WorkPage() {
  return (
    <div className="page page-enter">
      <div className="work-header">
        <div className="section-eyebrow">Portfolio</div>
        <h2 className="work-title">My Work</h2>
      </div>
      <MasonryGrid />
      <BackToTop />
    </div>
  );
}
