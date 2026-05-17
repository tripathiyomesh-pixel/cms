import { TEMPLATES, getTemplate } from '@/lib/templates';

// Dynamic template import based on env
async function getTemplateComponent() {
  const template = getTemplate();
  switch(template.id) {
    case 'luxury-dark':
      const { default: LuxuryDark }    = await import('@/templates/luxury-dark/HomePage');
      return LuxuryDark;
    case 'clean-minimal':
      const { default: CleanMinimal }  = await import('@/templates/clean-minimal/HomePage');
      return CleanMinimal;
    case 'boutique-warm':
      const { default: BoutiqueWarm }  = await import('@/templates/boutique-warm/HomePage');
      return BoutiqueWarm;
    case 'diamond-dealer':
      const { default: DiamondDealer } = await import('@/templates/diamond-dealer/HomePage');
      return DiamondDealer;
    default:
      const { default: Default }       = await import('@/templates/luxury-dark/HomePage');
      return Default;
  }
}

export default async function HomePage() {
  const TemplateComponent = await getTemplateComponent();
  return <TemplateComponent />;
}
