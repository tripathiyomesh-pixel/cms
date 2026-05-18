'use client';
import { useEffect, useState } from 'react';
import StaticHomePage from '@/templates/luxury-dark/HomePage';

// Reads section config from admin and renders sections in correct order
export default function HomePage() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL || '/api';
    // Load page builder content first
    fetch(`${api}/settings/page/homepage`)
      .then(r=>r.json())
      .then(res => {
        if (res.data?.html) { setConfig({ type:'custom', html:res.data.html, css:res.data.css }); return; }
      })
      .catch(() => {});
    // Load section config
    fetch(`${api}/settings`)
      .then(r=>r.json())
      .then(res => {
        const map = {};
        (res.data||[]).forEach(s => { map[s.key] = typeof s.value==='string'?s.value.replace(/^"|"$/g,''):String(s.value||''); });
        if (map.homepage_sections_config) {
          try { setConfig({ type:'sections', sections: JSON.parse(map.homepage_sections_config), content: map }); }
          catch {}
        }
      })
      .catch(()=>{});
  }, []);

  // Custom page builder content
  if (config?.type === 'custom') {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: config.css||'' }}/>
        <div dangerouslySetInnerHTML={{ __html: config.html }}/>
      </>
    );
  }

  // Always render static homepage (section config is passed as props for dynamic content)
  return <StaticHomePage sectionConfig={config?.sections} contentConfig={config?.content}/>;
}
