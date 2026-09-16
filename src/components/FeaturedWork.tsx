"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Eye, Sparkles } from "lucide-react";
import { PORTFOLIO_ITEMS } from "../data/portfolio";
import { PortfolioItem } from "../lib/types";
import { PortfolioGraphic } from "./PortfolioGraphic";
import { LightboxModal } from "./LightboxModal";

export const FeaturedWork: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const featuredPieces = PORTFOLIO_ITEMS.slice(0, 6);

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 md:py-28 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 md:mb-16 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#160B36] border border-[#6A0DAD]/30 text-xs font-mono text-[#CCFF00] uppercase tracking-widest mb-4">
            Recent Commissions
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-[#F5F3FA] max-w-xl">
            Selected creative work across San Andreas.
          </h2>
        </div>

        <Link
          href="/work"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#160B36] hover:bg-[#1B0F3D] border border-[#6A0DAD]/40 text-xs font-bold text-[#F5F3FA] hover:text-[#CCFF00] transition-all shadow-card-subtle group"
        >
          <span>Explore All 2026 Works</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Grid of pieces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {featuredPieces.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
            onClick={() => setSelectedItem(item)}
            className="group cursor-pointer rounded-3xl bg-[#160B36] border border-[#6A0DAD]/30 hover:border-[#CCFF00]/50 transition-all duration-300 overflow-hidden shadow-card-subtle flex flex-col justify-between hover:-translate-y-1"
          >
            {/* Visual Canvas Box */}
            <div className="w-full h-64 sm:h-72 bg-[#0F0529] relative overflow-hidden flex items-center justify-center">
              <PortfolioGraphic item={item} className="w-full h-full group-hover:scale-105 transition-transform duration-500" />

              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-[#0F0529]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CCFF00] text-[#0F0529] font-bold text-xs shadow-glow-lime">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Spec</span>
                </span>
              </div>
            </div>

            {/* Info footer */}
            <div className="p-6 flex flex-col justify-between flex-grow">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-[#CCFF00] uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className="text-[11px] font-mono text-[#7A7099]">{item.year}</span>
                </div>
                <h3 className="text-xl font-display font-bold text-[#F5F3FA] group-hover:text-[#CCFF00] transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-[#B8AFD1] mt-1.5 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#7A7099]">
                <span>{item.clientName}</span>
                <span className="text-[#CCFF00] font-mono">In-Game Ready</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <LightboxModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </section>
  );
};
