'use client';
import { useEffect, useState } from 'react';

/**
 * DynamicPage — renders a page saved by the admin Page Builder
 * Supports both:
 *   1. JSON section array (new PageBuilderPage format)
 *   2. Raw GrapesJS HTML/CSS (legacy GrapesJS format)
 *
 * Usage: <DynamicPage pageId="about" fallback={<StaticAboutPage />} />
 */
export default function DynamicPage({ pageId, fallback = null, className = '' }) {
  const [content, setContent] = useState(undefined); // undefined = loading
  const [type, setType]       = useState(null);       // 'sections' | 'html' | null

  useEffect(() => {
    if (!pageId) return;
    const api = process.env.NEXT_PUBLIC_API_URL || '/api';
    fetch(`${api}/settings/page/${pageId}`)
      .then(r => r.json())
      .then(res => {
        const data = res.data;
        if (!data) { setContent(null); setType(null); return; }
        // JSON section array from PageBuilderPage
        if (Array.isArray(data) && data.length > 0) {
          setContent(data); setType('sections'); return;
        }
        // Legacy GrapesJS format
        if (data?.html) {
          setContent(data); setType('html'); return;
        }
        setContent(null); setType(null);
      })
      .catch(() => { setContent(null); setType(null); });
  }, [pageId]);

  // Loading state — render nothing (no flash)
  if (content === undefined) return null;

  // No content saved — use fallback
  if (!content || type === null) return fallback;

  // Raw GrapesJS HTML
  if (type === 'html') {
    return (
      <div className={className}>
        {content.css && <style dangerouslySetInnerHTML={{ __html: content.css }} />}
        <div dangerouslySetInnerHTML={{ __html: content.html }} />
      </div>
    );
  }

  // JSON section array — rendered by SectionRenderer
  return (
    <div className={className}>
      {content.map((section, i) => (
        <SectionBlock key={section.id || i} section={section} />
      ))}
    </div>
  );
}

// Minimal section block renderer for DynamicPage
// For full rendering, the main page.js handles this with SectionFromJSON
function SectionBlock({ section }) {
  const { type, props } = section;

  // For types that need special rendering, delegate to inline components
  if (!props) return null;

  switch (type) {
    case 'spacer':
      return <div style={{ height: props.height || 80, background: props.bg || '#fff' }} />;

    case 'divider':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '32px 80px', background: props.bg || '#fff' }}>
          <div style={{ flex: 1, height: '0.5px', background: '#e5e0d8' }} />
          <span style={{ fontSize: 18, color: 'var(--color-accent)' }}>✦</span>
          <div style={{ flex: 1, height: '0.5px', background: '#e5e0d8' }} />
        </div>
      );

    default:
      // For all other section types, render a placeholder that shows type name
      // Full rendering happens in the page-level SectionFromJSON component
      return (
        <div data-section-type={type} data-section-props={JSON.stringify(props)} />
      );
  }
}
