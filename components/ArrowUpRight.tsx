/**
 * External-link arrow. Drawn rather than typed: the "↗" character (U+2197) has
 * emoji presentation on iOS, which rendered as a blue emoji tile instead of an
 * arrow. An SVG inherits currentColor and looks the same everywhere.
 */
export default function ArrowUpRight() {
  return (
    <svg
      className="social-arrow"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="8 7 17 7 17 16" />
    </svg>
  );
}
