"use client";

import React from "react";
import { Star, Quote } from "lucide-react";
import { siteConfig } from "../config/siteConfig";

export const TestimonialsStrip: React.FC = () => {
  // Double the list for infinite-feeling horizontal marquee
  const items = [...siteConfig.testimonials, ...siteConfig.testimonials];

  return (
    <section className="py-20 md:py-28 overflow-hidden bg-[#0C0420] border-y border-[#6A0DAD]/25 relative">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#160B36] border border-[#6A0DAD]/30 text-xs font-mono text-[#CCFF00] uppercase tracking-widest mb-4">
          Client Endorsements
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-[#F5F3FA]">
          Trusted by the enterprises of San Andreas.
        </h2>
        <p className="text-sm text-[#B8AFD1] mt-3">
          Real in-character business operators sharing their experience with Vortex Creative.
        </p>
      </div>

      {/* Marquee Container with pause on hover */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex gap-6 w-max animate-marquee hover:[animation-play-state:paused] py-4">
          {items.map((testimonial, idx) => (
            <div
              key={`${testimonial.id}-${idx}`}
              className="w-[320px] sm:w-[380px] rounded-3xl bg-[#160B36] border border-[#6A0DAD]/30 hover:border-[#CCFF00]/40 p-6 flex flex-col justify-between shadow-card-subtle transition-all duration-300"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 text-[#CCFF00] mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                  <span className="text-xs font-mono text-[#7A7099] ml-2">5.0</span>
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-[#F5F3FA] italic leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </div>

              {/* Author info */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6A0DAD] to-[#CCFF00] p-[1.5px] flex-shrink-0">
                    <div className="w-full h-full rounded-full bg-[#0F0529] flex items-center justify-center font-bold text-xs text-[#CCFF00]">
                      {testimonial.avatarText}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#F5F3FA]">
                      {testimonial.characterName}
                    </div>
                    <div className="text-[11px] text-[#B8AFD1]">{testimonial.businessName}</div>
                  </div>
                </div>

                <span className="text-[9px] font-mono text-[#CCFF00] bg-[#0F0529] px-2 py-1 rounded border border-[#6A0DAD]/30">
                  {testimonial.projectDelivered}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
