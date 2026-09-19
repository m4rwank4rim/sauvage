"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Eye } from "lucide-react";
import { PortfolioItem } from "../lib/types";
import { PortfolioGraphic } from "./PortfolioGraphic";
import { LightboxModal } from "./LightboxModal";
import { EmptyWorkArchive } from "./EmptyState";

const CATEGORIES = [
  "All",
  "Logos",
  "Print",
  "Digital/Social",
  "Signage",
  "Other",
];

export const PortfolioGallery: React.FC<{ items: PortfolioItem[] }> = ({ items }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory);

  const currentIndex = filteredItems.findIndex((item) => item.id === selectedItem?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < filteredItems.length - 1 && currentIndex !== -1;
  const onPrev = () => {
    if (hasPrev) setSelectedItem(filteredItems[currentIndex - 1]);
  };
  const onNext = () => {
    if (hasNext) setSelectedItem(filteredItems[currentIndex + 1]);
  };

  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32 px-5 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-electric-lime">
              Agency Archives
            </span>
            <span className="h-px w-12 bg-white/[0.15]" />
          </div>
          <h1 className="font-display font-medium text-4xl sm:text-5xl md:text-6xl tracking-tightest text-text-primary text-balance">
            Visual identities forged for San Andreas.
          </h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl mt-4 leading-relaxed">
            Explore our collection of commercial branding, high-octane racing wraps, bar menus, and
            faction visual packages delivered for GTA World roleplay.
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2 mb-10">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-[11px] font-mono tracking-wide transition-all duration-300 border ${
                isActive
                  ? "border-electric-lime/50 bg-electric-lime/[0.1] text-electric-lime backdrop-blur-sm shadow-glow-lime"
                  : "border-white/[0.08] bg-transparent text-text-secondary hover:text-text-primary hover:border-white/[0.18]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {filteredItems.map((item, idx) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.97, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, delay: (idx % 3) * 0.04 }}
              onClick={() => setSelectedItem(item)}
              className="group relative cursor-pointer rounded-3xl border border-white/[0.08] bg-surface overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-electric-lime/50 hover:shadow-glow-lime"
            >
              <div className="relative h-64 sm:h-72 lg:h-80 bg-[#0B0B0D] overflow-hidden">
                <PortfolioGraphic
                  item={item}
                  className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D]/90 via-[#0B0B0D]/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute inset-x-0 bottom-0 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="bg-[#0B0B0D]/70 backdrop-blur-md border-t border-white/[0.1] px-5 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-electric-lime/40 bg-electric-lime/[0.12] backdrop-blur-sm font-mono text-[9px] uppercase tracking-[0.18em] text-electric-lime">
                        {item.category}
                      </span>
                      <span className="font-mono text-[10px] text-text-secondary">{item.year}</span>
                    </div>
                    <h3 className="font-display font-medium text-xl text-text-primary leading-tight drop-shadow-md">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-text-secondary">{item.clientName}</p>
                    <div className="mt-3 flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-electric-lime">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect spec</span>
                    </span>
                    <Link
                      href={`/work/${item.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-secondary hover:text-electric-lime transition-colors"
                    >
                      <span>Case study</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  </div>
                </div>

                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#0B0B0D]/60 backdrop-blur-sm border border-white/[0.12] flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                  <ArrowRight className="w-4 h-4 text-text-secondary -rotate-45" />
                </div>
              </div>

              <div className="p-5 border-t border-white/[0.06]">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-medium text-sm text-text-primary truncate pr-2">
                    {item.title}
                  </h3>
                  <span className="text-[10px] font-mono text-text-muted shrink-0">{item.year}</span>
                </div>
                <p className="text-xs text-text-secondary mt-1 truncate">{item.clientName}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredItems.length === 0 && <EmptyWorkArchive />}

      <LightboxModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onPrev={onPrev}
        onNext={onNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-20 rounded-3xl bg-surface/60 backdrop-blur-sm border border-white/[0.08] p-8 md:p-12 text-center flex flex-col items-center"
      >
        <div className="w-12 h-12 rounded-2xl bg-electric-lime/[0.08] border border-electric-lime/40 flex items-center justify-center text-electric-lime mb-5">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="font-display font-medium text-2xl sm:text-3xl md:text-4xl tracking-tightest text-text-primary max-w-xl">
          Ready to put your Los Santos enterprise on the map?
        </h2>
        <p className="text-sm text-text-secondary max-w-lg mt-3 mb-8 leading-relaxed">
          Submit your design requirements today. Fast quoting, transparent in-game dollar rates, and
          instant Fleeca payments.
        </p>
        <Link
          href="/request"
          className="group px-8 py-4 rounded-full text-xs font-bold text-[#0B0B0D] bg-electric-lime hover:bg-electric-lime-hover transition-all shadow-glow-lime hover:shadow-glow-lime-strong flex items-center gap-2"
        >
          <span>Start Your Design Request</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </motion.div>
    </div>
  );
};
