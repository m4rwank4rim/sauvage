"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileEdit, Calculator, CreditCard, Download, ArrowRight } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "../config/siteConfig";

const STEP_ICONS = [FileEdit, Calculator, CreditCard, Download];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20 md:py-28 relative">
      <div className="flex flex-col items-center text-center mb-16 md:mb-20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#160B36] border border-[#6A0DAD]/30 text-xs font-mono text-[#CCFF00] uppercase tracking-widest mb-4">
          Seamless Workflow
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-[#F5F3FA] max-w-2xl">
          From concept to high-res files in 4 transparent steps.
        </h2>
        <p className="text-sm md:text-base text-[#B8AFD1] max-w-xl mt-4 leading-relaxed">
          No endless back-and-forth or unverified wire transfers. Everything is structured,
          trackable, and verified via Fleeca Bank API.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {siteConfig.howItWorks.map((item, index) => {
          const IconComponent = STEP_ICONS[index] || FileEdit;
          return (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="group relative rounded-3xl bg-gradient-to-b from-[#180C3D] to-[#12072D] p-7 border border-[#6A0DAD]/30 hover:border-[#CCFF00]/40 transition-all duration-300 shadow-card-subtle flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#0F0529] border border-[#6A0DAD]/50 flex items-center justify-center text-[#CCFF00] group-hover:scale-110 transition-transform duration-300 shadow-glow-lime">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="font-display font-black text-2xl text-[#7A7099]/40 group-hover:text-[#CCFF00]/60 transition-colors font-mono">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-xl font-display font-bold text-[#F5F3FA] mb-3 group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-[#B8AFD1] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-mono text-[#CCFF00] opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Phase {item.step}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-14 text-center">
        <Link
          href="/request"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#CCFF00] hover:text-[#B8E600] uppercase tracking-wider font-mono hover:underline"
        >
          <span>Ready to submit your design brief?</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};
