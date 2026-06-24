import { getAbout } from '@/lib/projects.server';

export default async function AboutPage() {
  const about = await getAbout();

  return (
    <div className="page page-enter about-hero">

      {/* Faded portrait into the right side — only when a URL is set */}
      {about.portraitUrl && (
        <div
          className="about-portrait"
          style={{ backgroundImage: `url(${about.portraitUrl})` }}
          aria-hidden="true"
        />
      )}

      {/* Top-left corner — green skills */}
      <div className="about-corner-tl">
        <div className="about-skills-inline">{about.skills}</div>
      </div>

      {/* Top-right corner — selected clients */}
      <div className="about-corner-tr">
        <div className="about-meta-label">Selected clients</div>
        <div className="about-meta-list">{about.clients}</div>
      </div>

      {/* Bottom-left corner — toolkit */}
      <div className="about-corner-bl">
        <div className="about-meta-label">Toolkit</div>
        <div className="about-meta-list">{about.toolkit}</div>
      </div>

      {/* Centre — giant name */}
      <h2 className="about-big-name">
        <span className="outline">
          {'Abdul'.split('').map((ch, i) => (
            <span key={`a-${i}`} className="letter">{ch}</span>
          ))}
        </span>
        <br />
        <span className="acc">
          {'Aziz.'.split('').map((ch, i) => (
            <span key={`b-${i}`} className="letter">{ch}</span>
          ))}
        </span>
      </h2>

      {/* Bottom-right corner — prose */}
      <div className="about-corner-br">
        <p className="about-lead">{about.bio}</p>
      </div>

    </div>
  );
}
