'use client';
import { getTemplate } from '@/lib/templates';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

export default function TemplateLayout({ children }) {
  const template = getTemplate();

  // Apply template CSS variables globally
  const cssVars = {
    '--t-bg':           template.colors.bg,
    '--t-bg-secondary': template.colors.bgSecondary,
    '--t-bg-card':      template.colors.bgCard,
    '--t-border':       template.colors.border,
    '--t-text':         template.colors.text,
    '--t-text-muted':   template.colors.textMuted,
    '--t-accent':       template.colors.accent,
    '--t-accent-hover': template.colors.accentHover,
    '--t-nav-bg':       template.colors.navBg,
  };

  return (
    <div style={{ ...cssVars, background: template.colors.bg, minHeight:'100vh' }}>
      <Header template={template}/>
      <main>{children}</main>
      <Footer template={template}/>
      <WhatsAppButton/>
    </div>
  );
}
