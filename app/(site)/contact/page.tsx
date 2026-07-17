import ArrowUpRight from '@/components/ArrowUpRight';
import { getContact } from '@/lib/projects.server';

function letters(text: string, key: string) {
  return text.split('').map((ch, i) => (
    <span key={`${key}-${i}`} className="letter">{ch}</span>
  ));
}

export default async function ContactPage() {
  const contact = await getContact();
  const waDigits = contact.whatsapp.replace(/\D/g, '');

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
            href={`https://mail.google.com/mail/?view=cm&to=${contact.email}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {contact.email}
          </a>

          <div className="contact-avail">
            <span className="avail-dot" />
            {contact.availabilityNote}
          </div>

          <div className="contact-channels">
            {waDigits && (
              <a
                className="contact-channel"
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp <ArrowUpRight />
              </a>
            )}
            {contact.instagram && (
              <a
                className="contact-channel"
                href={`https://instagram.com/${contact.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram <ArrowUpRight />
              </a>
            )}
          </div>

          {contact.location && <div className="contact-loc">{contact.location}</div>}
        </div>
      </div>
    </div>
  );
}
