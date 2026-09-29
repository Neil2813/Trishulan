import React from 'react';
import HeroSection from './HeroSection';
import BentoGridCategory from '@/components/ui/bento-grid-category';
import TradeIntelligence from '@/components/ui/trade-intelligence';
import TopSellers from '@/components/ui/top-sellers';
import PricingSection from '@/components/PricingSection';

export default function LandingPage() {
  return (
    <div className="w-full">
      <HeroSection />
      <BentoGridCategory />
      <TopSellers />
      <TradeIntelligence />
      <PricingSection />
    </div>
  );
}
