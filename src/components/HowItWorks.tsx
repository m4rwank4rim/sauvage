"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "../config/siteConfig";

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="relative max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28">
      {/* Section header — editorial, left aligned */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <div className="flex items-center gap-3 mb-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-electric-lime">
            The Process
          </span>
          <span className="h-px w-12 bg-white/[0.15]" />
        </div>
        <h2 className="font-display font-medium text-3xl sm:text-4xl md:text-5xl tracking-tightest text-text-primary text-balance">
          From brief to branded, <em className="italic">in four steps</em>.
        </h2>
        <p className="mt-4 text-base text-text-secondary leading-relaxed max-w-xl">
          A controlled, transparent pipeline — submit your brief, approve the estimate, pay via the
          official Fleeca gateway, and receive print-ready files.
        </p>
      </motion.div>

      {/* Steps */}
      <div className="relative mt-14 md:mt-20">
        {/* Horizontal connector line (desktop) */}
        <div className="hidden lg:block absolute top-[26px] left-[3%] right-[3%] h-px bg-white/[0.08]" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8 relative">
          {siteConfig.howItWorks.map((step, idx) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: idx * 0.12 }}
              className="relative group"
            >
              {/* Mobile connector — vertical line */}
              <div className="lg:hidden absolute left-[22px] top-2 bottom-[-3rem] w-px bg-white/[0.08] last:hidden" />

              {/* Node */}
              <div className="relative flex items-center gap-4">
                <div className="relative z-10 w-[44px] h-[44px] shrink-0 rounded-full border border-white/[0.14] bg-surface flex items-center justify-center transition-all duration-300 group-hover:border-electric-lime/60 group-hover:shadow-glow-lime">
                  <span className="font-display text-sm tracking-tight text-electric-lime">
                    {step.step}
                  </span>
                  <span className="absolute inset-[-7px] rounded-full border border-transparent transition-colors duration-300 group-hover:border-electric-lime/20" />
                </div>
                <span className="lg:hidden font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                  Step {step.step}
                </span>
              </div>

              {/* Content */}
              <div className="mt-6 pl-0 lg:mt-7">
                <h3 className="font-display font-medium text-xl text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm text-text-secondary leading-relaxed pr-2">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-16 md:mt-20 flex items-center gap-3"
      >
        <span className="h-px w-10 bg-electric-lime/60" />
        <Link
          href="/request"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-electric-lime hover:text-electric-lime-hover transition-colors"
        >
          <span>Ready to submit your design brief?</span>
          <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </motion.div>
    </section>
  );
};