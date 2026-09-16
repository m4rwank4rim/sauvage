"use client";

import React from "react";
import { motion } from "framer-motion";
import { siteConfig } from "../config/siteConfig";

export const StatsBar: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {siteConfig.stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="group relative rounded-3xl bg-gradient-to-b from-[#160B36] to-[#12072D] p-6 md:p-8 border border-[#6A0DAD]/30 hover:border-[#CCFF00]/40 transition-all duration-300 shadow-card-subtle flex flex-col justify-between overflow-hidden"
          >
            {/* Ambient hover glow */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#6A0DAD]/10 group-hover:bg-[#CCFF00]/10 rounded-full blur-2xl transition-colors duration-500 pointer-events-none" />

            <div>
              <div className="font-display font-black text-4xl sm:text-5xl tracking-tight text-[#CCFF00] mb-2 font-mono">
                {stat.value}
              </div>
              <h2 className="text-base font-bold text-[#F5F3FA] tracking-wide mb-1">
                {stat.label}
              </h2>
            </div>
            <p className="text-xs text-[#B8AFD1] leading-relaxed mt-2">
              {stat.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
