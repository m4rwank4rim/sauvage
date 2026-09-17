import React from "react";
import { HeroSection } from "../components/HeroSection";
import { StatsBar } from "../components/StatsBar";
import { HowItWorks } from "../components/HowItWorks";
import { FeaturedWork } from "../components/FeaturedWork";
import { PricingSection } from "../components/PricingSection";
import { TestimonialsStrip } from "../components/TestimonialsStrip";
import { FaqAccordion } from "../components/FaqAccordion";
import { dbStore } from "../lib/db/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const items = await dbStore.getAllPortfolio();

  return (
    <div className="relative">
      {/* 1. Hero Section */}
      <HeroSection items={items} />

      {/* 2. Trust & Stat Bar */}
      <StatsBar />

      {/* 3. How It Works (4 numbered steps) */}
      <HowItWorks />

      {/* 4. Featured Portfolio Showcase */}
      <FeaturedWork items={items} />

      {/* 5. Services & Pricing Tiers */}
      <PricingSection />

      {/* 6. In-Character Testimonials Strip */}
      <TestimonialsStrip />

      {/* 7. FAQ Accordion */}
      <FaqAccordion />
    </div>
  );
}
