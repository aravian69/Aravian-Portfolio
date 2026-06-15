export default function AboutPage() {
  return (
    <div className="page page-enter about-hero">

      {/* Top-left corner — green skills */}
      <div className="about-corner-tl">
        <div className="about-skills-inline">
          VFX · Color Grading · Motion Graphics · AI Video · Graphic Design
        </div>
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
        <p className="about-lead">
          I craft visual stories that blur the line between reality and imagination.
          Every frame I touch is treated as art. Based in Jakarta,
          available for projects worldwide.
        </p>
      </div>

    </div>
  );
}
