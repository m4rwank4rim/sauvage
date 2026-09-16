"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { siteConfig } from "../config/siteConfig";

export const TestimonialsStrip: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const width = card ? card.offsetWidth + 24 : 380;
    el.scrollBy({ left: dir * width, behavior: "smooth" });
  };

  return (
    <section className="py-20 md:py-28 overflow-hidden bg-[#0B0B0D] border-y border-white/[0.06] relative">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-[-10%] w-[480px] h-[380px] bg-electric-lime/[0.05] rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 mb-12 md:mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-electric-lime">
              Client Endorsements
            </span>
            <span className="h-px w-12 bg-white/[0.15]" />
          </div>
          <h2 className="font-display font-medium text-3xl sm:text-4xl md:text-5xl tracking-tightest text-text-primary text-balance">
            Trusted by the enterprises of San Andreas.
          </h2>
          <p className="text-sm text-text-secondary mt-3 leading-relaxed">
            Real in-character business operators sharing their experience with SAUVAGE.
          </p>
        </motion.div>

        {/* Carousel controls */}
        <div className="flex items-center gap-3 shrink-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted mr-1 hidden sm:block">
            Drag or use arrows
          </p>
          <button
            onClick={() => scrollByCard(-1)}
            aria-label="Previous testimonial"
            className="w-10 h-10 rounded-full border border-white/[0.12] bg-white/[0.02] text-text-secondary hover:text-electric-lime hover:border-electric-lime/50 hover:bg-electric-lime/[0.06] flex items-center justify-center transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollByCard(1)}
            aria-label="Next testimonial"
            className="w-10 h-10 rounded-full border border-white/[0.12] bg-white/[0.02] text-text-secondary hover:text-electric-lime hover:border-electric-lime/50 hover:bg-electric-lime/[0.06] flex items-center justify-center transition-all duration-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Snap-scroll carousel */}
      <div
        ref={trackRef}
        className="relative w-full overflow-x-auto snap-x snap-mandatory scroll-pl-5 md:scroll-pl-8 flex gap-5 px-5 md:px-8 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
      >
        {siteConfig.testimonials.map((testimonial, idx) => (
          <motion.div
            key={testimonial.id}
            data-card
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: (idx % 3) * 0.08 }}
            className="min-w-[320px] sm:min-w-[380px] snap-start rounded-3xl bg-surface border border-white/[0.08] hover:border-electric-lime/40 p-6 flex flex-col justify-between shadow-card-subtle transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-lime"
          >
            <div>
              <Quote className="w-5 h-5 text-electric-lime/70 -mb-1" strokeWidth={1.5} />

              <div className="flex items-center gap-1 mt-2 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < testimonial.rating ? "fill-electric-lime text-electric-lime" : "fill-transparent text-white/[0.15]"}`}
                  />
                ))}
                <span className="text-[10px] font-mono text-text-muted ml-2">
                  {testimonial.rating.toFixed(1)}
                </span>
              </div>

              <p className="text-[13px] sm:text-sm text-text-primary italic leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-full border border-electric-lime/40 bg-surface-2 flex items-center justify-center font-display font-medium text-xs text-electric-lime">
                  {testimonial.avatarText}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-text-primary truncate">
                    {testimonial.characterName}
                  </div>
                  <div className="text-[11px] text-text-secondary truncate">
                    {testimonial.businessName}
                  </div>
                </div>
              </div>

              <span className="text-[9px] font-mono text-electric-lime bg-[#0B0B0D] px-2 py-1 rounded-md border border-white/[0.08] shrink-0">
                {testimonial.projectDelivered}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};