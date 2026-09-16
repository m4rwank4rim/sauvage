"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, Zap, Clock, ShieldCheck } from "lucide-react";
import { siteConfig } from "../config/siteConfig";

export const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="max-w-7xl mx-auto px-6 py-20 md:py-28 relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#6A0DAD]/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex flex-col items-center text-center mb-16 md:mb-20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#160B36] border border-[#6A0DAD]/30 text-xs font-mono text-[#CCFF00] uppercase tracking-widest mb-4">
          Transparent In-Game Rates
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-[#F5F3FA] max-w-2xl">
          Fixed tiers with zero hidden fees.
        </h2>
        <p className="text-sm md:text-base text-[#B8AFD1] max-w-xl mt-4 leading-relaxed">
          Paid securely via Fleeca Bank Gateway. Every project includes revisions, vector source
          deliverables, and official GTAW forum formatting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {siteConfig.services.map((tier, index) => {
          const isPopular = tier.popular;
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 ${
                isPopular
                  ? "bg-gradient-to-b from-[#220E4D] via-[#1A0B3D] to-[#12072D] border-2 border-[#CCFF00] shadow-glow-violet scale-[1.02]"
                  : "bg-gradient-to-b from-[#180C3D] to-[#12072D] border border-[#6A0DAD]/30 hover:border-[#CCFF00]/40 shadow-card-subtle"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#CCFF00] text-[#0F0529] font-bold text-[10px] uppercase font-mono tracking-wider shadow-glow-lime flex items-center gap-1.5">
                  <Zap className="w-3 h-3 fill-current" />
                  <span>Most Popular in LS</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono text-[#CCFF00] uppercase font-bold tracking-wider">
                    {tier.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-[#B8AFD1] font-mono">
                    <Clock className="w-3 h-3 text-[#CCFF00]" />
                    <span>{tier.deliveryTime}</span>
                  </div>
                </div>

                <h3 className="text-xl font-display font-black text-[#F5F3FA] mb-2">{tier.name}</h3>
                <p className="text-xs text-[#B8AFD1] mb-6 leading-relaxed">{tier.tagline}</p>

                {/* Price Tag */}
                <div className="pb-6 mb-6 border-b border-white/10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-[#B8AFD1]">Starting at</span>
                    <span className="font-display font-black text-3xl sm:text-4xl text-[#CCFF00] font-mono">
                      ${tier.price.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#7A7099] font-mono block mt-1">
                    In-game Fleeca payment • 50% deposit
                  </span>
                </div>

                {/* Feature List */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-xs text-[#B8AFD1]">
                      <div className="w-4 h-4 rounded-full bg-[#6A0DAD]/40 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div>
                <Link
                  href={`/request?service=${encodeURIComponent(tier.id)}&price=${tier.price}`}
                  className={`w-full py-3.5 px-6 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                    isPopular
                      ? "bg-[#CCFF00] text-[#0F0529] hover:bg-[#B8E600] shadow-glow-lime"
                      : "bg-[#160B36] hover:bg-[#CCFF00] text-[#F5F3FA] hover:text-[#0F0529] border border-[#6A0DAD]/40 hover:border-[#CCFF00]"
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

      <div className="mt-12 rounded-2xl bg-[#160B36]/60 border border-[#6A0DAD]/30 p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div>
          <div className="text-sm font-bold text-[#F5F3FA]">
            Need a custom enterprise bundle or faction overhaul?
          </div>
          <p className="text-xs text-[#B8AFD1] mt-0.5">
            We handle multi-vehicle corporate transit fleets, government agency identities, and
            recurring monthly retainers.
          </p>
        </div>
        <Link
          href="/request?service=custom"
          className="px-6 py-2.5 rounded-full bg-[#1F0E3D] hover:bg-[#6A0DAD] text-xs font-bold text-[#CCFF00] border border-[#6A0DAD]/50 transition-colors flex-shrink-0"
        >
          Request Custom Estimate
        </Link>
      </div>
    </section>
  );
};
