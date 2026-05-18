'use client';
import DynamicPage from '@/components/builder/DynamicPage';
import StaticHomePage from '@/templates/luxury-dark/HomePage';

export default function HomePage() {
  return (
    <DynamicPage
      page="homepage"
      fallback={<StaticHomePage/>}
    />
  );
}
