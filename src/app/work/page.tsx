"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Eye, Filter } from "lucide-react";
import { PORTFOLIO_ITEMS } from "../../data/portfolio";
import { PortfolioItem } from "../../lib/types";
import { PortfolioGraphic } from "../../components/PortfolioGraphic";
import { LightboxModal } from "../../components/LightboxModal";

const CATEGORIES = [
  "All",
  "Logos",
  "Print",
  "Digital/Social",
  "Vehicle Liveries",
  "Signage",
  "Other",
];

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const filteredItems =
    activeCategory === "All"
      ? PORTFOLIO_ITEMS
      : PORTFOLIO_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32 px-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col items-center text-center mb-12 md:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#160B36] border border-[#6A0DAD]/30 text-xs font-mono text-[#CCFF00] uppercase tracking-widest mb-4">
          Agency Archives
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-[#F5F3FA] max-w-3xl">
          Visual identities forged for San Andreas.
        </h1>
        <p className="text-sm sm:text-base text-[#B8AFD1] max-w-xl mt-4 leading-relaxed">
          Explore our collection of commercial branding, high-octane racing wraps, bar menus, and
          faction visual packages delivered for GTA World roleplay.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center flex-wrap gap-2 mb-12">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-mono transition-all duration-200 ${
                isActive
                  ? "bg-[#CCFF00] text-[#0F0529] font-bold shadow-glow-lime scale-105"
                  : "bg-[#160B36] text-[#B8AFD1] hover:text-[#F5F3FA] hover:bg-[#1F0E3D] border border-[#6A0DAD]/30"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Portfolio Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <AnimatePresence>
          {filteredItems.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedItem(item)}
              className="group cursor-pointer rounded-3xl bg-[#160B36] border border-[#6A0DAD]/30 hover:border-[#CCFF00]/50 transition-all duration-300 overflow-hidden shadow-card-subtle flex flex-col justify-between hover:-translate-y-1"
            >
              {/* Graphic Canvas */}
              <div className="w-full h-64 sm:h-72 bg-[#0F0529] relative overflow-hidden flex items-center justify-center">
                <PortfolioGraphic
                  item={item}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                />

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-[#0F0529]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CCFF00] text-[#0F0529] font-bold text-xs shadow-glow-lime">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Specifications</span>
                  </span>
                </div>
              </div>

              {/* Card Meta */}
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
                  <span className="text-[#CCFF00] font-mono">Inspect</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox Modal */}
      <LightboxModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      {/* Bottom CTA Banner */}
      <div className="mt-20 rounded-3xl bg-gradient-to-r from-[#180C3D] via-[#210D4F] to-[#160B36] border border-[#6A0DAD]/40 p-8 md:p-12 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-[#F5F3FA] max-w-xl">
          Ready to put your Los Santos enterprise on the map?
        </h2>
        <p className="text-sm text-[#B8AFD1] max-w-lg mt-3 mb-8">
          Submit your design requirements today. Fast quoting, transparent in-game dollar rates, and
          instant Fleeca payments.
        </p>
        <Link
          href="/request"
          className="px-8 py-4 rounded-full text-xs font-bold text-[#0F0529] bg-[#CCFF00] hover:bg-[#B8E600] transition-all shadow-glow-lime flex items-center gap-2"
        >
          <span>Start Your Design Request</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
