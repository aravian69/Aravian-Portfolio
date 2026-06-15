function letters(text: string, key: string) {
  return text.split('').map((ch, i) => (
    <span key={`${key}-${i}`} className="letter">{ch}</span>
  ));
}

export default function ContactPage() {
  return (
    <div className="page page-enter">
      <div className="contact-wrapper">
        <div className="contact-body">
          <div className="contact-eyebrow">Let&apos;s work together</div>
          <h2 className="contact-big">
            <span className="outline">{letters('Get', 'c1a')}{' '}{letters('In', 'c1b')}</span><br />
            <span className="acc">{letters('Touch.', 'c2')}</span>
          </h2>
          <div className="contact-divider" />
          <p className="contact-lead">
            Have a project in mind? Reach out and let&apos;s make something cinematic.
          </p>
          <a
            className="contact-email"
            href="https://mail.google.com/mail/?view=cm&to=azizaravian@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            azizaravian@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
