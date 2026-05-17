'use client';
import { useEffect, useState } from 'react';
import { useTemplateContext } from '@/components/layout/TemplateLayout';
import dynamic from 'next/dynamic';

// Load all templates but only render the active one
const LuxuryDark    = dynamic(()=>import('@/templates/luxury-dark/HomePage'),    { ssr:false });
const CleanMinimal  = dynamic(()=>import('@/templates/clean-minimal/HomePage'),  { ssr:false });
const BoutiqueWarm  = dynamic(()=>import('@/templates/boutique-warm/HomePage'),  { ssr:false });
const DiamondDealer = dynamic(()=>import('@/templates/diamond-dealer/HomePage'), { ssr:false });

const TEMPLATE_COMPONENTS = {
  'luxury-dark':    LuxuryDark,
  'clean-minimal':  CleanMinimal,
  'boutique-warm':  BoutiqueWarm,
  'diamond-dealer': DiamondDealer,
};

export default function HomePage() {
  const ctx = useTemplateContext();
  const templateId = ctx?.template?.id || 'luxury-dark';
  const Component  = TEMPLATE_COMPONENTS[templateId] || LuxuryDark;
  return <Component />;
}
