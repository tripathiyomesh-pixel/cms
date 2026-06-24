'use client';
import { useEffect, useState } from 'react';

const API  = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const GOLD = '#b8860b';

export default function WhatsAppFloat() {
  const [waNumber, setWaNumber] = useState('');
  const [visible, setVisible]   = useState(false);
  const [tooltip, setTooltip]   = useState(false);

  useEffect(() => {
    fetch(`${API}/settings/public`)
      .then(r => r.json())
      .then(d => {
        const data = d.data || d || {};
        const num = (data.store_whatsapp || data.whatsapp_number || '')
          .replace(/^"|"$/g, '').replace(/\D/g, '');
        if (num) setWaNumber(num);
      })
      .catch(() => {});

    // Show after slight delay
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  if (!waNumber) return null;

  const waMsg = encodeURIComponent('Hi Tejori, I have an enquiry about your jewellery collection.');
  const waHref = `https://wa.me/${waNumber}?text=${waMsg}`;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 10,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 400ms ease, transform 400ms ease',
      }}
    >
      {/* Tooltip */}
      {tooltip && (
        <div style={{
          background: '#1a1208',
          color: '#f5ebe0',
          fontSize: 12,
          padding: '8px 14px',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          animation: 'fadeIn 150ms ease',
        }}>
          Chat with Our Expert
        </div>
      )}

      {/* Button */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 56,
          height: 56,
          background: '#25D366',
          borderRadius: '50%',
          textDecoration: 'none',
          boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
          transition: 'transform 150ms ease, box-shadow 150ms ease',
        }}
        onMouseOver={e => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,211,102,0.5)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.4)';
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
