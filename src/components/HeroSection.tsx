"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, CheckCircle2, Landmark } from "lucide-react";
import { siteConfig } from "../config/siteConfig";
import { PORTFOLIO_ITEMS } from "../data/portfolio";
import { PortfolioItem } from "../lib/types";
import { PortfolioGraphic } from "./PortfolioGraphic";

const EASE = [0.22, 0.61, 0.36, 1] as const;

type LatestPayment = {
  id: string;
  projectType: string | null;
  amount: number;
  paidAt: string | null;
};

export const HeroSection: React.FC<{ items?: PortfolioItem[] }> = ({ items }) => {
  const list = items && items.length ? items : PORTFOLIO_ITEMS;
  const [primary, secondary, tertiary] = list;
  const featured = list.find((i) => i.featured) ?? list[0] ?? primary;
  const [latest, setLatest] = useState<LatestPayment | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json?.data?.latest) setLatest(json.data.latest as LatestPayment);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="relative overflow-hidden pt-36 md:pt-44 pb-20 md:pb-28">
      {/* Background texture + restrained green glow */}
      <div className="absolute inset-0 bg-grid-faint opacity-[0.35] [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)] -z-10" />
      <div className="absolute top-[-10%] right-[-8%] w-[640px] h-[520px] bg-electric-lime/[0.07] rounded-full blur-[130px] -z-10 pointer-events-none" />
      <div className="absolute top-1/3 left-[-10%] w-[420px] h-[360px] bg-white/[0.03] rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-8 items-center">
        {/* Copy */}
        <div className="lg:col-span-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.02] backdrop-blur-sm"
          >
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-lime opacity-60" />
              <span className="relative inline-flex rounded-full w-2 h-2 bg-electric-lime" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary">
              Fleeca Verified · GTA World Roleplay
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
            className="mt-7 font-display font-medium text-[42px] leading-[1.04] sm:text-6xl md:text-7xl xl:text-[82px] tracking-tightest text-text-primary max-w-2xl"
          >
            Graphic design that{" "}
            <em className="font-display italic font-medium text-electric-lime">
              commands respect
            </em>{" "}
            in Los Santos.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
            className="mt-6 text-base md:text-lg text-text-secondary max-w-xl leading-relaxed"
          >
            {siteConfig.subheadline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: EASE }}
            className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <Link
              href="/request"
              className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-semibold text-[#0B0B0D] bg-electric-lime hover:bg-electric-lime-hover shadow-glow-lime transition-all duration-300 hover:shadow-glow-lime-strong hover:scale-[1.02] active:scale-[0.99]"
            >
              <span>Start a project</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/work"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium text-text-primary border border-white/[0.12] hover:border-electric-lime/50 hover:text-electric-lime transition-all duration-300 bg-white/[0.02]"
            >
              <span>View our work</span>
              <ArrowUpRight className="w-4 h-4 text-text-muted transition-colors group-hover:text-electric-lime" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-text-secondary"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-electric-lime" />
              <span>In-Game Currency Only ($)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-electric-lime" />
              <span>Vector &amp; Print-Ready Files</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-electric-lime" />
              <span>24–48h Delivery Available</span>
            </div>
          </motion.div>
        </div>

        {/* Visual */}
        <div className="lg:col-span-6 relative z-10 hidden sm:block">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            className="relative max-w-[520px] mx-auto lg:ml-auto"
          >
            {/* Restrained green glow behind the stack */}
            <div className="absolute inset-0 translate-y-6 scale-90 bg-electric-lime/[0.08] blur-3xl rounded-full pointer-events-none" />

            {/* Back card */}
            <div className="absolute -right-6 -bottom-7 inset-y-0 w-[72%] rounded-3xl border border-white/[0.07] bg-surface/80 overflow-hidden rotate-3 opacity-80 hidden md:block">
              <PortfolioGraphic item={secondary ?? featured} className="w-full h-full" />
            </div>
            {/* Side card */}
            <div className="absolute -left-7 top-10 w-[46%] aspect-[3/4] rounded-3xl border border-white/[0.07] bg-surface/80 overflow-hidden -rotate-6 opacity-80 hidden lg:block">
              <PortfolioGraphic item={tertiary ?? featured} className="w-full h-full" />
            </div>

            {/* Primary card */}
            <div className="relative rounded-3xl border border-white/[0.1] bg-surface overflow-hidden shadow-lift">
              <div className="relative h-[380px] sm:h-[430px] md:h-[470px]">
                <PortfolioGraphic item={featured} className="w-full h-full" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D]/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 p-5 flex items-end justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-electric-lime mb-1">
                    {featured.category}
                  </div>
                  <div className="font-display text-lg text-text-primary leading-tight">
                    {featured.title}
                  </div>
                </div>
                <span className="text-text-muted font-mono text-[10px]">
                  {featured.year} · GTAW
                </span>
              </div>
            </div>

            {/* Floating chips */}
            <div className="absolute -left-4 md:-left-10 top-8 flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/[0.1] bg-[#141417]/90 backdrop-blur-md shadow-card-subtle animate-float">
              <Landmark className="w-4 h-4 text-electric-lime" />
              <div className="leading-none">
                <div className="font-mono text-[10px] text-text-primary">Fleeca Gateway</div>
                <div className="font-mono text-[9px] text-text-muted mt-0.5">Instant payout</div>
              </div>
            </div>
            {latest && (
              <div className="absolute -right-3 md:-right-8 bottom-16 px-3.5 py-2 rounded-xl border border-white/[0.1] bg-[#141417]/90 backdrop-blur-md shadow-card-subtle animate-float-delayed">
                <div className="font-mono text-[10px] text-text-primary">
                  {latest.id} · {latest.projectType || "Design Project"}
                </div>
                <div className="font-mono text-[9px] text-electric-lime mt-0.5">
                  ${latest.amount.toLocaleString()} · Paid via Fleeca
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};