"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "../config/siteConfig";

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28 relative">
      {/* Editorial header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-14">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-electric-lime">
              Common Questions
            </span>
            <span className="h-px w-12 bg-white/[0.15]" />
          </div>
          <h2 className="font-display font-medium text-3xl sm:text-4xl md:text-5xl tracking-tightest text-text-primary text-balance">
            Frequently asked questions.
          </h2>
          <p className="mt-4 text-sm md:text-base text-text-secondary max-w-xl leading-relaxed">
            Everything you need to know about our commission process, GTA World currency
            guidelines, and Fleeca Bank API payments.
          </p>
        </motion.div>

        <Link
          href="/contact"
          className="group inline-flex items-center gap-2.5 text-[13px] font-semibold text-text-secondary hover:text-electric-lime transition-colors w-fit shrink-0 pb-1"
        >
          <MessageCircleQuestion className="w-4 h-4" />
          <span>Still curious? Ask us on Discord</span>
          <ChevronDown className="w-4 h-4 -rotate-90 transition-transform group-hover:-translate-x-0.5" />
        </Link>
      </div>

      <div className="max-w-4xl mx-auto space-y-3.5">
        {siteConfig.faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? "bg-surface-2 border-electric-lime/40 shadow-glow-lime"
                  : "bg-surface border-white/[0.08] hover:border-white/[0.16]"
              }`}
            >
              <button
                onClick={() => toggle(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                aria-expanded={isOpen}
              >
                <span className="font-display font-medium text-base sm:text-lg text-text-primary leading-snug pr-2">
                  {faq.question}
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-300 ${
                    isOpen
                      ? "border-electric-lime/50 bg-electric-lime/[0.1] text-electric-lime rotate-180"
                      : "border-white/[0.12] bg-white/[0.03] text-text-secondary"
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
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
                    <div className="px-6 pb-6 pt-1 text-sm text-text-secondary leading-relaxed border-t border-white/[0.06]">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};