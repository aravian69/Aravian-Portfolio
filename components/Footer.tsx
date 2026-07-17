import ArrowUpRight from '@/components/ArrowUpRight';

export default function Footer() {
  return (
    <footer className="site-footer">
      <a className="footer-avail" href="/contact">
        <span className="avail-dot" />
        Available for projects
      </a>
      <a
        className="social-link"
        href="https://instagram.com/aziizaravian"
        target="_blank"
        rel="noopener noreferrer"
      >
        Instagram <ArrowUpRight />
      </a>
      <span className="site-footer-copy">© 2026 Abdul Aziz</span>
      <span className="site-footer-loc">Jakarta, Indonesia</span>
    </footer>
  );
}
