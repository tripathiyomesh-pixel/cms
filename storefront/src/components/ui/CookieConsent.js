'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent({ settings = {} }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!settings.cookie_enabled || settings.cookie_enabled === 'false') return;
    const accepted = localStorage.getItem('cookie_consent');
    if (!accepted) setTimeout(() => setVisible(true), 1500);
  }, [settings]);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };
  const decline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9000,
      background: '#0a0a0a', borderTop: '1px solid #2a2a2a',
      padding: '16px 24px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
    }}>
      <div style={{ flex: 1, minWidth: 280 }}>
        <p style={{ fontSize: 13, color: '#f5f0e8', margin: 0, lineHeight: 1.5 }}>
          🍪 {settings.cookie_message || 'We use cookies to enhance your experience.'}
          {settings.cookie_more_link && (
            <Link href={settings.cookie_more_link} style={{ color: '#c9a84c', marginLeft: 6, textDecoration: 'underline' }}>
              Learn more
            </Link>
          )}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button onClick={decline} style={{
          padding: '8px 18px', borderRadius: 6, border: '1px solid #444',
          background: 'transparent', color: '#888', fontSize: 12, cursor: 'pointer',
        }}>
          {settings.cookie_decline_label || 'Decline'}
        </button>
        <button onClick={accept} style={{
          padding: '8px 18px', borderRadius: 6, border: 'none',
          background: '#c9a84c', color: '#0a0a0a', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>
          {settings.cookie_accept_label || 'Accept'}
        </button>
      </div>
    </div>
  );
}
