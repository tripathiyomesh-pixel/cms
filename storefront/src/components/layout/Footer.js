'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const GOLD  = '#b8860b';
const CREAM = '#fdf8f3';

const COL1 = {
  heading: 'Jewellery',
  links: [
    { label: 'Rings',              href: '/jewellery?category=rings' },
    { label: 'Necklaces',          href: '/jewellery?category=necklaces' },
    { label: 'Bracelets',          href: '/jewellery?category=bracelets' },
    { label: 'Earrings',           href: '/jewellery?category=earrings' },
    { label: 'Pendants & Bangles', href: '/jewellery?category=pendants' },
    { label: 'Bridal Sets',        href: '/jewellery?collection=bridal' },
  ],
};

const COL2 = {
  heading: 'Diamonds',
  links: [
    { label: 'Natural Diamonds',   href: '/diamonds' },
    { label: 'Lab-Grown Diamonds', href: '/lab-grown' },
    { label: 'By Shape',           href: '/diamonds?view=shapes' },
    { label: 'GIA Certified',      href: '/diamonds?cert=gia' },
    { label: 'Pick a Diamond',     href: '/appointment?purpose=diamond' },
    { label: 'Verify Certificate', href: '/verify' },
  ],
};

const COL3 = {
  heading: 'Explore',
  links: [
    { label: 'Aurora Collection',  href: '/jewellery?collection=aurora' },
    { label: 'Bridal Edit',        href: '/jewellery?collection=bridal' },
    { label: 'New Arrivals',       href: '/jewellery?collection=new' },
    { label: 'Heritage Line',      href: '/jewellery?collection=heritage' },
    { label: 'Bespoke Design',     href: '/custom' },
    { label: 'Gold Rate Today',    href: '/gold-rate' },
  ],
};

const COL4 = {
  heading: 'About Tejori',
  links: [
    { label: 'Our Heritage',      href: '/about' },
    { label: 'Our Boutiques',     href: '/boutiques' },
    { label: 'Exhibitions',       href: '/exhibitions' },
    { label: 'Journal',           href: '/blog' },
    { label: 'Contact Us',        href: '/contact' },
    { label: 'Sitemap',           href: '/sitemap' },
  ],
};

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function FooterColumn({ col }) {
  return (
    <div>
      <p style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: GOLD,
        marginBottom: 20,
        paddingBottom: 10,
        borderBottom: `1px solid rgba(184,134,11,0.25)`,
      }}>
        {col.heading}
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {col.links.map((l) => (
          <li key={l.label} style={{ marginBottom: 10 }}>
            <Link
              href={l.href}
              style={{
                fontSize: 12,
                color: '#c8bfb0',
                textDecoration: 'none',
                letterSpacing: '0.04em',
                transition: 'color 150ms ease',
              }}
              onMouseOver={e => e.target.style.color = '#e8d5a3'}
              onMouseOut={e => e.target.style.color = '#c8bfb0'}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const [waNumber, setWaNumber] = useState('');

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    fetch(`${api}/settings/public`)
      .then(r => r.json())
      .then(d => {
        const data = d.data || d || {};
        const num = (data.store_whatsapp || data.whatsapp_number || '').replace(/^"|"$/g,'').replace(/\D/g,'');
        if (num) setWaNumber(num);
      })
      .catch(() => {});
  }, []);

  const waLink = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent('Hi Tejori, I have an enquiry about your jewellery collection.')}`
    : 'https://wa.me';

  return (
    <footer style={{ background: '#0e0c09', color: '#c8bfb0', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* WhatsApp CTA strip */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1208 0%, #241a0c 100%)',
        borderTop: `1px solid rgba(184,134,11,0.3)`,
        borderBottom: `1px solid rgba(184,134,11,0.15)`,
        padding: '32px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20,
      }}>
        <div>
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 22,
            fontWeight: 400,
            color: '#f5ebe0',
            marginBottom: 4,
          }}>
            Have a Question? Chat with Our Expert
          </p>
          <p style={{ fontSize: 12, color: '#8b7355' }}>
            Available 7 days · 9am–9pm · Dubai
          </p>
        </div>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '13px 28px',
            background: '#25D366',
            color: '#fff',
            textDecoration: 'none',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            transition: 'background 150ms ease',
          }}
          onMouseOver={e => e.currentTarget.style.background = '#1dba59'}
          onMouseOut={e => e.currentTarget.style.background = '#25D366'}
        >
          <WhatsAppIcon />
          Chat on WhatsApp
        </a>
      </div>

      {/* Main footer grid */}
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '64px 48px 40px',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
        gap: 40,
      }}>
        {/* Brand column */}
        <div style={{ paddingRight: 32 }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 32,
            fontWeight: 400,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#f5ebe0',
            marginBottom: 12,
          }}>
            Tejori
          </p>
          <p style={{
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: GOLD,
            marginBottom: 20,
          }}>
            Since 1985 · Dubai · Crafted with Passion
          </p>
          <p style={{ fontSize: 12, lineHeight: 1.8, color: '#8b7355', marginBottom: 28, maxWidth: 280 }}>
            Luxury Indian &amp; GCC jewellery. GIA and IGI certified diamonds. Bespoke design services. Boutiques across Dubai.
          </p>

          {/* Social links */}
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: 'Instagram', href: 'https://instagram.com', Icon: InstagramIcon },
              { label: 'WhatsApp',  href: waLink,                   Icon: WhatsAppIcon },
              { label: 'Facebook',  href: 'https://facebook.com',  Icon: FacebookIcon },
              { label: 'YouTube',   href: 'https://youtube.com',   Icon: YoutubeIcon },
            ].map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 38,
                  height: 38,
                  border: '1px solid rgba(184,134,11,0.3)',
                  color: '#8b7355',
                  textDecoration: 'none',
                  transition: 'color 150ms ease, border-color 150ms ease',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.color = GOLD;
                  e.currentTarget.style.borderColor = GOLD;
                }}
                onMouseOut={e => {
                  e.currentTarget.style.color = '#8b7355';
                  e.currentTarget.style.borderColor = 'rgba(184,134,11,0.3)';
                }}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <FooterColumn col={COL1} />
        <FooterColumn col={COL2} />
        <FooterColumn col={COL3} />
        <FooterColumn col={COL4} />
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '20px 48px',
        maxWidth: 1280,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <p style={{ fontSize: 11, color: '#5a5040' }}>
          © 2026 Tejori Jewellery LLC. All rights reserved. Dubai, UAE.
        </p>
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Cookie Policy', href: '/cookies' },
          ].map(l => (
            <Link
              key={l.label}
              href={l.href}
              style={{ fontSize: 11, color: '#5a5040', textDecoration: 'none', transition: 'color 150ms ease' }}
              onMouseOver={e => e.target.style.color = GOLD}
              onMouseOut={e => e.target.style.color = '#5a5040'}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Responsive */}
    </footer>
  );
}
