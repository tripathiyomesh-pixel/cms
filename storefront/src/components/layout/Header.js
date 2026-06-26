'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Heart, Menu, X, ChevronDown, Phone } from 'lucide-react';

// ── BRAND CONSTANTS — use CSS vars so theme switching works ───
const GOLD  = 'var(--color-accent)';
const CREAM = 'var(--color-bg)';
const DARK  = 'var(--color-text)';
const MUTED = 'var(--color-text-muted)';

// ── MEGA MENU DATA ────────────────────────────────────────────
const JEWELLERY_MENU = {
  id: 'jewellery',
  cols: [
    {
      heading: 'Shop by Type',
      items: [
        { label: 'Rings',      href: '/jewellery?category=rings',      img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
        { label: 'Necklaces',  href: '/jewellery?category=necklaces',  img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80' },
        { label: 'Bracelets',  href: '/jewellery?category=bracelets',  img: 'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80' },
        { label: 'Earrings',   href: '/jewellery?category=earrings',   img: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80' },
        { label: 'Pendants',   href: '/jewellery?category=pendants',   img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80' },
        { label: 'Sets',       href: '/jewellery?category=sets',       img: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80' },
        { label: 'Bangles',    href: '/jewellery?category=bangles',    img: 'https://images.unsplash.com/photo-1544376798-89aa6b0de868?w=600&q=80' },
      ],
    },
    {
      heading: 'Collections',
      items: [
        { label: 'Aurora Collection', href: '/jewellery?collection=aurora',   img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80' },
        { label: 'Frost Collection',  href: '/jewellery?collection=frost',    img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
        { label: 'Vivid Collection',  href: '/jewellery?collection=vivid',    img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80' },
        { label: 'Bridal Edit',       href: '/jewellery?collection=bridal',   img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80' },
        { label: 'Heritage Line',     href: '/jewellery?collection=heritage', img: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80' },
        { label: 'New Arrivals',      href: '/jewellery?collection=new',      img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80' },
      ],
    },
  ],
  defaultImg: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  footerLink: { label: 'Book a Private Viewing', href: '/appointment' },
};

const DIAMONDS_MENU = {
  id: 'diamonds',
  cols: [
    {
      heading: 'Diamond Type',
      // BUSINESS RULE: Natural and Lab-Grown NEVER on same page or suggested together
      items: [
        { label: 'Natural Diamonds',   href: '/diamonds',   img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80', note: 'Earth-mined, GIA certified' },
        { label: 'Lab-Grown Diamonds', href: '/lab-grown',  img: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80', note: 'IGI certified, sustainable' },
      ],
    },
    {
      heading: 'By Shape',
      items: [
        { label: 'Round Brilliant', href: '/diamonds?shape=round',    img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
        { label: 'Princess',        href: '/diamonds?shape=princess', img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80' },
        { label: 'Oval',            href: '/diamonds?shape=oval',     img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80' },
        { label: 'Emerald',         href: '/diamonds?shape=emerald',  img: 'https://images.unsplash.com/photo-1573408301185-9519f94ae069?w=600&q=80' },
        { label: 'Pear',            href: '/diamonds?shape=pear',     img: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80' },
      ],
    },
  ],
  defaultImg: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
  footerLink: { label: 'Pick Your Diamond — Speak to an Expert', href: '/appointment?purpose=diamond' },
};

const NAV_LINKS = [
  { label: 'Jewellery',   href: '/jewellery',   mega: JEWELLERY_MENU },
  { label: 'Diamonds',    href: '/diamonds',    mega: DIAMONDS_MENU },
  { label: 'Collections', href: '/jewellery',   mega: null },
  { label: 'Bespoke',     href: '/custom',      mega: null },
  { label: 'About',       href: '/about',       mega: null },
];

// ── MEGA MENU PANEL ───────────────────────────────────────────
function MegaPanel({ menu, open }) {
  const [hoverImg, setHoverImg] = useState(menu.defaultImg);

  useEffect(() => {
    if (!open) setHoverImg(menu.defaultImg);
  }, [open, menu.defaultImg]);

  return (
    <div
      aria-hidden={!open}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        background: CREAM,
        borderTop: `1px solid var(--color-border)`,
        borderBottom: `3px solid ${GOLD}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transform: open ? 'translateY(0)' : 'translateY(-8px)',
        transition: 'opacity 200ms ease, transform 200ms ease',
        zIndex: 100,
      }}
    >
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '48px 48px 0',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 280px',
        gap: 40,
      }}>
        {/* Columns */}
        {menu.cols.map((col, ci) => (
          <div key={ci}>
            <p style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: MUTED,
              marginBottom: 20,
              paddingBottom: 10,
              borderBottom: `1px solid var(--color-border)`,
            }}>
              {col.heading}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {col.items.map((item) => (
                <li key={item.label} style={{ marginBottom: 4 }}>
                  <Link
                    href={item.href}
                    onMouseEnter={() => item.img && setHoverImg(item.img)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '7px 0',
                      textDecoration: 'none',
                      borderBottom: '1px solid transparent',
                      transition: 'border-color 150ms ease',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.querySelector('.mega-link-label').style.color = GOLD;
                      e.currentTarget.style.borderBottomColor = GOLD;
                    }}
                    onMouseOut={e => {
                      e.currentTarget.querySelector('.mega-link-label').style.color = DARK;
                      e.currentTarget.style.borderBottomColor = 'transparent';
                    }}
                  >
                    <span
                      className="mega-link-label"
                      style={{
                        fontSize: 13,
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 500,
                        color: DARK,
                        letterSpacing: '0.04em',
                        transition: 'color 150ms ease',
                      }}
                    >
                      {item.label}
                    </span>
                    {item.note && (
                      <span style={{ fontSize: 10, color: MUTED, marginTop: 1 }}>{item.note}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Image Panel */}
        <div style={{ position: 'relative', width: 280, height: 320, overflow: 'hidden', background: 'var(--color-bg)' }}>
          <img
            src={hoverImg}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'opacity 300ms ease, transform 400ms ease',
            }}
          />
        </div>
      </div>

      {/* Bottom strip */}
      {menu.footerLink && (
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '16px 48px 20px',
          borderTop: `1px solid #e8ddd0`,
          marginTop: 32,
        }}>
          <Link
            href={menu.footerLink.href}
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: GOLD,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            ✦ {menu.footerLink.label}
          </Link>
        </div>
      )}
    </div>
  );
}

// ── MOBILE DRAWER ─────────────────────────────────────────────
function MobileDrawer({ open, onClose }) {
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 200,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 250ms ease',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0, right: 0,
        width: 'min(340px, 90vw)',
        height: '100%',
        background: CREAM,
        zIndex: 201,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 280ms cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Drawer header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: `1px solid #e8ddd0`,
        }}>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 22,
            fontWeight: 400,
            letterSpacing: '0.12em',
            color: DARK,
          }}>
            TEJORI
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color={DARK} />
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV_LINKS.map((link) => (
            <div key={link.label}>
              {link.mega ? (
                <>
                  <button
                    onClick={() => toggle(link.label)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 24px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 500,
                      letterSpacing: '0.08em',
                      color: DARK,
                      textAlign: 'left',
                      borderBottom: `1px solid #f0e8dc`,
                    }}
                  >
                    {link.label}
                    <ChevronDown
                      size={14}
                      color={MUTED}
                      style={{
                        transform: expanded === link.label ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 200ms ease',
                      }}
                    />
                  </button>

                  {/* Accordion sub-items */}
                  <div style={{
                    maxHeight: expanded === link.label ? 600 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 250ms ease',
                    background: 'var(--color-surface, #f7f1e8)',
                  }}>
                    {link.mega.cols.map((col) => (
                      <div key={col.heading} style={{ padding: '12px 24px 4px' }}>
                        <p style={{
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: MUTED,
                          marginBottom: 10,
                        }}>
                          {col.heading}
                        </p>
                        {col.items.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={onClose}
                            style={{
                              display: 'block',
                              padding: '8px 0',
                              fontSize: 13,
                              color: DARK,
                              textDecoration: 'none',
                              borderBottom: `1px solid #ece4d8`,
                            }}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  href={link.href}
                  onClick={onClose}
                  style={{
                    display: 'block',
                    padding: '14px 24px',
                    fontSize: 13,
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    color: DARK,
                    textDecoration: 'none',
                    borderBottom: `1px solid #f0e8dc`,
                  }}
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Drawer footer */}
        <div style={{ padding: '20px 24px', borderTop: `1px solid #e8ddd0` }}>
          <Link
            href="/appointment"
            onClick={onClose}
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '13px 24px',
              background: GOLD,
              color: '#fff',
              textDecoration: 'none',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Book a Private Viewing
          </Link>
          <Link
            href="/jewellery"
            onClick={onClose}
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '13px 24px',
              border: `1px solid ${GOLD}`,
              color: GOLD,
              textDecoration: 'none',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Explore Collection
          </Link>
        </div>
      </div>
    </>
  );
}

// ── MAIN HEADER ───────────────────────────────────────────────
export default function Header() {
  const [openMenu, setOpenMenu]   = useState(null); // which mega menu is open
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleMouseEnter = useCallback((id) => {
    clearTimeout(closeTimer.current);
    setOpenMenu(id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  }, []);

  const navBg = scrolled
    ? `rgba(253,248,243,0.97)`
    : `rgba(253,248,243,0.96)`;

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 150,
          background: navBg,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: scrolled ? `1px solid #e8ddd0` : `1px solid transparent`,
          transition: 'background 250ms ease, border-color 250ms ease, box-shadow 250ms ease',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        {/* Top bar */}
        <div style={{
          background: 'var(--nav-bg)',
          color: 'var(--nav-text)',
          fontSize: 10,
          letterSpacing: '0.18em',
          textAlign: 'center',
          padding: '7px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>Free Consultation · GIA &amp; IGI Certified · Dubai</span>
          <Link
            href="/appointment"
            style={{
              color: GOLD,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 10,
              letterSpacing: '0.15em',
            }}
          >
            BOOK A VIEWING →
          </Link>
        </div>

        {/* Main nav bar */}
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 32px',
            height: 68,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onMouseLeave={handleMouseLeave}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 26,
              fontWeight: 400,
              letterSpacing: '0.18em',
              color: DARK,
              textDecoration: 'none',
              textTransform: 'uppercase',
              flexShrink: 0,
            }}
          >
            Tejori
          </Link>

          {/* Desktop nav */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              position: 'relative',
            }}
          >
            {NAV_LINKS.map((link) => (
              <div
                key={link.label}
                onMouseEnter={() => link.mega ? handleMouseEnter(link.label) : setOpenMenu(null)}
                style={{ position: 'relative' }}
                className="hide-mobile"
              >
                <Link
                  href={link.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '0 18px',
                    height: 68,
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: openMenu === link.label ? GOLD : DARK,
                    textDecoration: 'none',
                    transition: 'color 150ms ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {link.label}
                  {link.mega && (
                    <ChevronDown
                      size={10}
                      style={{
                        transform: openMenu === link.label ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 200ms ease',
                        color: MUTED,
                      }}
                    />
                  )}
                </Link>

                {/* Active indicator */}
                {openMenu === link.label && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 18,
                    right: 18,
                    height: 2,
                    background: GOLD,
                  }} />
                )}
              </div>
            ))}
          </nav>

          {/* Right icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <Link
              href="/search"
              style={{ display: 'flex', padding: 8, color: DARK, textDecoration: 'none' }}
              aria-label="Search"
              className="hide-mobile"
            >
              <Search size={18} strokeWidth={1.5} />
            </Link>
            <Link
              href="/wishlist"
              style={{ display: 'flex', padding: 8, color: DARK, textDecoration: 'none' }}
              aria-label="Wishlist"
              className="hide-mobile"
            >
              <Heart size={18} strokeWidth={1.5} />
            </Link>
            <Link
              href="/appointment"
              className="hide-mobile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '9px 18px',
                background: GOLD,
                color: '#fff',
                textDecoration: 'none',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                marginLeft: 8,
                transition: 'background 150ms ease',
              }}
            >
              Book Viewing
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="show-mobile"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                color: DARK,
              }}
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Mega menu panels */}
        <div
          onMouseEnter={() => clearTimeout(closeTimer.current)}
          onMouseLeave={handleMouseLeave}
          style={{ position: 'absolute', left: 0, right: 0 }}
        >
          <MegaPanel menu={JEWELLERY_MENU} open={openMenu === 'Jewellery'} />
          <MegaPanel menu={DIAMONDS_MENU}  open={openMenu === 'Diamonds'}  />
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 901px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}

