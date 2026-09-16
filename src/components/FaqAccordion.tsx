"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { siteConfig } from "../config/siteConfig";

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="max-w-4xl mx-auto px-6 py-20 md:py-28 relative">
      <div className="flex flex-col items-center text-center mb-14 md:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#160B36] border border-[#6A0DAD]/30 text-xs font-mono text-[#CCFF00] uppercase tracking-widest mb-4">
          Common Questions
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-[#F5F3FA]">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-[#B8AFD1] mt-3 max-w-lg">
          Everything you need to know about our commission process, GTA World currency guidelines,
          and Fleeca Bank API payments.
        </p>
      </div>

      <div className="space-y-4">
        {siteConfig.faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.question}
              className={`rounded-2xl transition-all duration-300 overflow-hidden border ${
                isOpen
                  ? "bg-[#180C3D] border-[#CCFF00]/40 shadow-card-subtle"
                  : "bg-[#160B36]/80 border-[#6A0DAD]/30 hover:border-[#6A0DAD]/60"
              }`}
            >
              <button
                onClick={() => toggle(index)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                aria-expanded={isOpen}
              >
                <span className="font-display font-bold text-base sm:text-lg text-[#F5F3FA] pr-2">
                  {faq.question}
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isOpen
                      ? "bg-[#CCFF00] text-[#0F0529]"
                      : "bg-[#0F0529] text-[#CCFF00] border border-[#6A0DAD]/40"
                  }`}
                >
                  {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-[#B8AFD1] leading-relaxed border-t border-white/5">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};
