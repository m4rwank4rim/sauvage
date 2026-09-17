"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Calendar, Building2, Tag, Sparkles } from "lucide-react";
import { PortfolioItem } from "../../../lib/types";
import { PortfolioGraphic } from "../../../components/PortfolioGraphic";

interface WorkDetailClientProps {
  item: PortfolioItem;
  related: PortfolioItem[];
}

export const WorkDetailClient: React.FC<WorkDetailClientProps> = ({ item, related }) => {
  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32 px-5 md:px-8 max-w-7xl mx-auto">
      <Link
        href="/work"
        className="inline-flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-electric-lime transition-colors mb-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to portfolio
      </Link>

      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-start mb-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-electric-lime/40 bg-electric-lime/[0.08] font-mono text-[10px] uppercase tracking-[0.18em] text-electric-lime">
              {item.category}
            </span>
            <span className="font-mono text-[10px] text-text-muted flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {item.year}
            </span>
          </div>
          <h1 className="font-display font-medium text-4xl sm:text-5xl md:text-6xl tracking-tightest text-text-primary text-balance">
            {item.title}
          </h1>
          <p className="mt-5 flex items-center gap-2 text-sm text-text-secondary">
            <Building2 className="w-4 h-4 text-electric-lime" />
            <span>
              Client: <strong className="text-text-primary">{item.clientName}</strong>{" "}
              {item.businessType ? `· ${item.businessType}` : ""}
            </span>
          </p>

          <div className="mt-8 pt-8 border-t border-white/[0.08]">
            <div className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>Specifications & Deliverables</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-surface border border-white/[0.08] text-[11px] text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href={`/request?category=${encodeURIComponent(item.category)}&ref=${encodeURIComponent(item.title)}`}
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-xs font-bold text-[#0B0B0D] bg-electric-lime hover:bg-electric-lime-hover transition-all shadow-glow-lime"
            >
              <span>Commission Something Similar</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/work"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-xs font-semibold text-text-secondary border border-white/[0.12] hover:border-electric-lime/50 hover:text-electric-lime transition-all"
            >
              <span>Browse All Works</span>
            </Link>
          </div>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative rounded-3xl border border-white/[0.08] bg-[#0B0B0D] overflow-hidden min-h-[320px] md:min-h-[440px]"
        >
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.title}
              width={1200}
              height={900}
              unoptimized
              className="w-full h-full object-cover"
            />
          ) : (
            <PortfolioGraphic item={item} className="w-full h-full" isHero />
          )}
        </motion.div>
      </div>

      {/* Story */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="max-w-3xl mb-20"
      >
        <div className="text-xs font-mono text-electric-lime uppercase tracking-[0.24em] mb-4">
          Case Study
        </div>
        <p className="text-base md:text-lg text-text-secondary leading-relaxed whitespace-pre-wrap">
          {item.description}
        </p>
      </motion.section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-medium text-2xl md:text-3xl tracking-tightest text-text-primary">
              More {item.category} work
            </h2>
            <Link
              href="/work"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold text-electric-lime"
            >
              <span>View all</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/work/${r.id}`}
                className="group relative rounded-3xl border border-white/[0.08] bg-surface overflow-hidden h-56 md:h-64 hover:border-electric-lime/50 hover:shadow-glow-lime transition-all duration-300 block"
              >
                {r.imageUrl ? (
                  <Image
                    src={r.imageUrl}
                    alt={r.title}
                    width={600}
                    height={440}
                    unoptimized
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                  />
                ) : (
                  <PortfolioGraphic item={r} className="w-full h-full transition-transform duration-700 group-hover:scale-[1.045]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D]/85 via-[#0B0B0D]/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-electric-lime/40 bg-electric-lime/[0.08] font-mono text-[9px] uppercase tracking-[0.18em] text-electric-lime mb-2">
                    {r.category}
                  </span>
                  <h3 className="font-display font-medium text-lg text-text-primary leading-tight">{r.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="rounded-3xl bg-surface/60 backdrop-blur-sm border border-white/[0.08] p-8 md:p-14 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-electric-lime/[0.08] border border-electric-lime/40 flex items-center justify-center text-electric-lime mb-5">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="font-display font-medium text-2xl sm:text-3xl md:text-4xl tracking-tightest text-text-primary max-w-xl">
          Ready to forge an identity for your Los Santos enterprise?
        </h2>
        <p className="text-sm text-text-secondary max-w-lg mt-3 mb-8 leading-relaxed">
          Fast quoting, transparent in-game dollar rates, and instant Fleeca payments.
        </p>
        <Link
          href="/request"
          className="group px-8 py-4 rounded-full text-xs font-bold text-[#0B0B0D] bg-electric-lime hover:bg-electric-lime-hover transition-all shadow-glow-lime flex items-center gap-2"
        >
          <span>Start Your Design Request</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </section>
    </div>
  );
};