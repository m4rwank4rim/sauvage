import React from "react";
import { HeroSection } from "../components/HeroSection";
import { StatsBar } from "../components/StatsBar";
import { HowItWorks } from "../components/HowItWorks";
import { FeaturedWork } from "../components/FeaturedWork";
import { PricingSection } from "../components/PricingSection";
import { TestimonialsStrip } from "../components/TestimonialsStrip";
import { FaqAccordion } from "../components/FaqAccordion";

export default function HomePage() {
  return (
    <div className="relative">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Trust & Stat Bar */}
      <StatsBar />

      {/* 3. How It Works (4 numbered steps) */}
      <HowItWorks />

      {/* 4. Featured Portfolio Showcase */}
      <FeaturedWork />

      {/* 5. Services & Pricing Tiers */}
      <PricingSection />

      {/* 6. In-Character Testimonials Strip */}
      <TestimonialsStrip />

      {/* 7. FAQ Accordion */}
      <FaqAccordion />
    </div>
  );
}
