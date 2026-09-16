"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles, Clock } from "lucide-react";
import { siteConfig } from "../config/siteConfig";

export const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28 relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[340px] bg-electric-lime/[0.04] rounded-full blur-[130px] pointer-events-none" />

      <div className="flex flex-col items-center text-center mb-14 md:mb-20 relative">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-10 bg-white/[0.15]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-electric-lime">
              Transparent In-Game Rates
            </span>
            <span className="h-px w-10 bg-white/[0.15]" />
          </div>
          <h2 className="font-display font-medium text-3xl sm:text-4xl md:text-5xl tracking-tightest text-text-primary text-balance">
            Fixed tiers with zero hidden fees.
          </h2>
          <p className="text-sm md:text-base text-text-secondary max-w-xl mx-auto mt-4 leading-relaxed">
            Paid securely via the Fleeca Bank Gateway. Every project includes revisions, vector
            source deliverables, and official GTAW forum formatting.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-5 relative z-10 items-start">
        {siteConfig.services.map((tier, index) => {
          const isPopular = tier.popular;
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-3xl p-7 md:p-8 flex flex-col justify-between transition-all duration-300 ${
                isPopular
                  ? "bg-gradient-to-b from-surface-2 to-surface border border-electric-lime/70 shadow-glow-lime-strong lg:-translate-y-4 lg:scale-[1.02]"
                  : "bg-surface border border-white/[0.08] hover:border-electric-lime/40 hover:-translate-y-1 shadow-card-subtle"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full border border-electric-lime/50 bg-electric-lime/[0.1] backdrop-blur-sm text-electric-lime font-semibold text-[10px] uppercase font-mono tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                  <Sparkles className="w-3 h-3" />
                  <span>Most Popular</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono text-electric-lime uppercase font-bold tracking-wider">
                    {tier.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-text-secondary font-mono">
                    <Clock className="w-3 h-3 text-electric-lime" />
                    <span>{tier.deliveryTime}</span>
                  </div>
                </div>

                <h3 className="text-xl font-display font-medium text-text-primary mb-2">
                  {tier.name}
                </h3>
                <p className="text-xs text-text-secondary mb-7 leading-relaxed">{tier.tagline}</p>

                {/* Price */}
                <div className="pb-6 mb-6 border-b border-white/[0.08]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display italic text-sm text-text-muted">from</span>
                    <span className="font-display font-medium text-4xl tracking-tight text-text-primary">
                      ${tier.price.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted font-mono block mt-1.5">
                    In-game Fleeca payment • 50% deposit
                  </span>
                </div>

                {/* Feature list */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-xs text-text-secondary">
                      <div className="w-5 h-5 rounded-full border border-electric-lime/40 bg-electric-lime/[0.06] flex items-center justify-center text-electric-lime flex-shrink-0 mt-[-1px]">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div>
                <Link
                  href={`/request?service=${encodeURIComponent(tier.id)}&price=${tier.price}`}
                  className={`w-full py-3.5 px-6 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                    isPopular
                      ? "bg-electric-lime text-[#0B0B0D] hover:bg-electric-lime-hover shadow-glow-lime hover:shadow-glow-lime-strong"
                      : "bg-white/[0.03] hover:bg-electric-lime text-text-primary hover:text-[#0B0B0D] border border-white/[0.12] hover:border-electric-lime"
                  }`}
                >
                  <span>Request this package</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Custom enterprise banner */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mt-14 rounded-3xl bg-surface/60 backdrop-blur-sm border border-white/[0.08] p-6 md:p-7 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left"
      >
        <div className="flex items-start gap-4">
          <div className="hidden md:flex w-10 h-10 rounded-xl border border-electric-lime/40 bg-electric-lime/[0.06] items-center justify-center">
            <Sparkles className="w-4 h-4 text-electric-lime" />
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">
              Need a custom enterprise bundle or faction overhaul?
            </div>
            <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
              We handle multi-vehicle corporate transit fleets, government agency identities, and
              recurring monthly retainers.
            </p>
          </div>
        </div>
        <Link
          href="/request?service=custom"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/[0.12] bg-transparent text-xs font-semibold text-electric-lime hover:bg-electric-lime hover:text-[#0B0B0D] transition-colors flex-shrink-0"
        >
          <span>Request Custom Estimate</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </motion.div>
    </section>
  );
};