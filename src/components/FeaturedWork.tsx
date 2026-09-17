"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Eye } from "lucide-react";
import { PORTFOLIO_ITEMS } from "../data/portfolio";
import { PortfolioItem } from "../lib/types";
import { PortfolioGraphic } from "./PortfolioGraphic";
import { LightboxModal } from "./LightboxModal";

export const FeaturedWork: React.FC<{ items?: PortfolioItem[] }> = ({ items }) => {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const source = items && items.length ? items : PORTFOLIO_ITEMS;
  const featuredPieces = [...source]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 6);
  const isBento = featuredPieces.length >= 6;

  const gridClass = isBento
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-5 lg:auto-rows-[210px]"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5";

  const tileClass = (idx: number): string => {
    if (!isBento) return "h-64 sm:h-72";
    if (idx === 0) return "md:col-span-2 h-80 md:h-96 lg:h-auto lg:col-span-3 lg:row-span-2";
    if (idx === 1 || idx === 2) return "h-64 lg:h-auto lg:col-span-3";
    return "h-64 lg:h-auto lg:col-span-2";
  };

  return (
    <section className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28 relative">
      {/* Editorial heading row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 md:mb-16 gap-7">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-electric-lime">
              Selected Commissions
            </span>
            <span className="h-px w-12 bg-white/[0.15]" />
          </div>
          <h2 className="font-display font-medium text-3xl sm:text-4xl md:text-5xl tracking-tightest text-text-primary text-balance">
            Work that makes businesses unforgettable.
          </h2>
          <p className="mt-4 text-base text-text-secondary max-w-xl leading-relaxed">
            A curated glimpse at identities delivered to Los Santos enterprises — filters from the
            full archive live on the portfolio page.
          </p>
        </motion.div>

        <Link
          href="/work"
          className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-[13px] font-semibold text-text-primary border border-white/[0.12] hover:border-electric-lime/50 hover:text-electric-lime transition-all duration-300 bg-white/[0.02] w-fit shrink-0"
        >
          <span>Explore All 2026 Works</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Bento grid */}
      <div className={gridClass}>
        {featuredPieces.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: (idx % 3) * 0.08 }}
            onClick={() => setSelectedItem(item)}
            className={`group relative cursor-pointer rounded-3xl border border-white/[0.08] bg-surface overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-electric-lime/50 hover:shadow-glow-lime ${tileClass(idx)}`}
          >
            {/* Art */}
            <div className="absolute inset-0 overflow-hidden">
              <PortfolioGraphic
                item={item}
                className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.045]"
              />
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D]/85 via-[#0B0B0D]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Meta overlay */}
            <div className={`absolute inset-x-0 bottom-0 ${idx === 0 ? "p-6 md:p-8" : "p-5 md:p-6"} translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300`}>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-electric-lime/40 bg-electric-lime/[0.08] backdrop-blur-sm font-mono text-[9px] uppercase tracking-[0.18em] text-electric-lime">
                  {item.category}
                </span>
                <span className="font-mono text-[10px] text-text-muted">{item.year}</span>
              </div>
              <h3 className={`font-display font-medium text-text-primary leading-tight ${idx === 0 ? "text-2xl md:text-4xl max-w-xl" : "text-xl md:text-2xl"}`}>
                {item.title}
              </h3>
              <p className="mt-1.5 text-xs text-text-muted">{item.clientName}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.tags?.slice(0, idx === 0 ? 4 : 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-electric-lime">
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect spec</span>
              </div>
            </div>

            {/* Persistent top-right hint (non-hover legibility) */}
            <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#0B0B0D]/60 backdrop-blur-sm border border-white/[0.12] flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300">
              <ArrowUpRight className="w-4 h-4 text-text-secondary" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <LightboxModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </section>
  );
};