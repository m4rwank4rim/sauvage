"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles, Tag, Building2, Calendar } from "lucide-react";
import Link from "next/link";
import { PortfolioItem } from "../lib/types";
import { PortfolioGraphic } from "./PortfolioGraphic";

interface LightboxModalProps {
  item: PortfolioItem | null;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ item, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (item) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#070214]/85 backdrop-blur-xl"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
            className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-[#160B36] border border-[#6A0DAD]/50 rounded-3xl md:rounded-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#0F0529]/80 hover:bg-[#CCFF00] text-[#F5F3FA] hover:text-[#0F0529] border border-white/10 flex items-center justify-center transition-all duration-200"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left / Top Visual Canvas */}
            <div className="md:w-1/2 min-h-[260px] sm:min-h-[320px] md:min-h-[480px] bg-[#0F0529] border-b md:border-b-0 md:border-r border-[#6A0DAD]/30 flex items-center justify-center relative overflow-hidden">
              <PortfolioGraphic item={item} className="w-full h-full" isHero />
            </div>

            {/* Right / Content Details */}
            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-mono font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className="text-xs text-[#7A7099] flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.year}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-[#F5F3FA] mb-3">
                  {item.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-[#B8AFD1] mb-6 pb-4 border-b border-white/10">
                  <Building2 className="w-4 h-4 text-[#CCFF00]" />
                  <span>
                    Client: <strong className="text-[#F5F3FA]">{item.clientName}</strong> (
                    {item.businessType})
                  </span>
                </div>

                <p className="text-sm text-[#B8AFD1] leading-relaxed mb-6">
                  {item.description}
                </p>

                {/* Tag Pills */}
                <div className="mb-6">
                  <div className="text-xs font-mono text-[#7A7099] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>Specifications & Formats</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-[#0F0529] border border-[#6A0DAD]/30 text-[11px] text-[#B8AFD1]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href={`/request?category=${encodeURIComponent(item.category)}&ref=${encodeURIComponent(
                    item.title
                  )}`}
                  onClick={onClose}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-full text-xs font-bold text-[#0F0529] bg-[#CCFF00] hover:bg-[#B8E600] transition-colors shadow-glow-lime flex items-center justify-center gap-2"
                >
                  <span>Order Similar Design</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-full text-xs text-[#B8AFD1] hover:text-white bg-[#0F0529] hover:bg-white/5 border border-white/10 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
