"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { siteConfig } from "../config/siteConfig";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 overflow-hidden flex flex-col items-center justify-center text-center px-6">
      {/* Background Animated Ultra Violet Glow Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] md:w-[750px] md:h-[450px] bg-gradient-to-tr from-[#6A0DAD]/35 via-[#8A2BE2]/20 to-[#CCFF00]/10 rounded-full blur-[110px] pointer-events-none -z-10 animate-pulse-slow" />
      
      {/* Subtle radial grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#6A0DAD_1px,transparent_1px)] [background-size:24px_24px] opacity-15 -z-20 pointer-events-none" />

      {/* Trust pill badge */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#160B36]/90 border border-[#6A0DAD]/40 text-xs font-mono text-[#F5F3FA] shadow-card-subtle mb-6 md:mb-8"
      >
        <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
        <span className="text-[#CCFF00] font-semibold">GTA WORLD ROLEPLAY</span>
        <span className="text-[#7A7099]">•</span>
        <span className="text-[#B8AFD1]">Fleeca Bank API Verified</span>
      </motion.div>

      {/* Main confident headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight text-[#F5F3FA] max-w-5xl leading-[1.06] mb-6"
      >
        Graphic design that{" "}
        <span className="relative inline-block">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5F3FA] via-[#CCFF00] to-[#F5F3FA]">
            commands respect
          </span>
          <span className="absolute -bottom-1 left-0 right-0 h-1 bg-[#CCFF00]/40 rounded-full blur-[1px]" />
        </span>{" "}
        in Los Santos.
      </motion.h1>

      {/* Subheadline with clear size contrast */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-base sm:text-lg md:text-xl text-[#B8AFD1] max-w-2xl font-normal leading-relaxed mb-10 md:mb-12"
      >
        {siteConfig.subheadline}
      </motion.p>

      {/* Dual CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
      >
        <Link
          href="/request"
          className="w-full sm:w-auto px-8 py-4 rounded-full text-sm font-bold text-[#0F0529] bg-[#CCFF00] hover:bg-[#B8E600] transition-all duration-300 shadow-glow-lime hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2.5"
        >
          <span>Start a project</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/work"
          className="w-full sm:w-auto px-8 py-4 rounded-full text-sm font-semibold text-[#F5F3FA] bg-[#160B36] hover:bg-[#1B0F3D] border border-[#6A0DAD]/40 hover:border-[#6A0DAD] transition-all duration-300 shadow-card-subtle flex items-center justify-center gap-2"
        >
          <span>View our work</span>
        </Link>
      </motion.div>

      {/* Quick reassurance indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-[#B8AFD1]"
      >
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />
          <span>In-Game Currency Only ($)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />
          <span>Vector & Print-Ready Files</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />
          <span>24–48h Delivery Available</span>
        </div>
      </motion.div>
    </section>
  );
};
