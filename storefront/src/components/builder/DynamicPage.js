'use client';
import { useEffect, useState } from 'react';

/**
 * Renders a page built with GrapesJS
 * Fetches HTML+CSS from /api/settings/page/:page
 * Falls back to static content if not found
 */
export default function DynamicPage({ page, fallback = null }) {
  const [content, setContent] = useState(null);
  const [loaded,  setLoaded]  = useState(false);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
    fetch(`${apiBase}/settings/page/${page}`)
      .then(r => r.json())
      .then(res => {
        if (res.data?.html) setContent(res.data);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [page]);

  if (!loaded) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:32, height:32, border:'2px solid #b8860b', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // Use dynamic content if saved
  if (content?.html) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: content.css || '' }}/>
        <div dangerouslySetInnerHTML={{ __html: content.html }}/>
      </>
    );
  }

  // Fall back to static component
  return fallback;
}
