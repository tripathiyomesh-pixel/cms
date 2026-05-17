import HeroBanner from '@/components/ui/HeroBanner';
import CategoryGrid from '@/components/ui/CategoryGrid';
import DiamondSearchTeaser from '@/components/diamond/DiamondSearchTeaser';
import FeaturedProducts from '@/components/product/FeaturedProducts';
import TrustBadges from '@/components/ui/TrustBadges';
import MetalRates from '@/components/ui/MetalRates';
import AppointmentCTA from '@/components/ui/AppointmentCTA';

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <HeroBanner />
      <CategoryGrid />
      <DiamondSearchTeaser />
      <FeaturedProducts title="Featured Jewellery" type="JEWELLERY" />
      <TrustBadges />
      <MetalRates />
      <AppointmentCTA />
    </div>
  );
}
