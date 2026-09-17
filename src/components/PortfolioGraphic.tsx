"use client";

import React from "react";
import Image from "next/image";
import { PortfolioItem } from "../lib/types";

interface PortfolioGraphicProps {
  item: PortfolioItem;
  className?: string;
  isHero?: boolean;
}

export const PortfolioGraphic: React.FC<PortfolioGraphicProps> = ({
  item,
  className = "",
  isHero = false,
}) => {
  if (item.imageUrl) {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-[#0B0B0D] ${className}`}>
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          unoptimized
          sizes={isHero ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
          className="object-cover"
        />
      </div>
    );
  }

  switch (item.id) {
    case "lsc-performance":
      return (
        <div
          className={`relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#12072B] via-[#1A0B3B] to-[#0B0B0D] p-6 overflow-hidden select-none ${className}`}
        >
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(235,235,235,0.3)_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
          {/* Neon accent glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#CCFF00]/15 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-white/[0.05] rounded-full blur-2xl" />

          {/* LS Customs Logo Art */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#141417] to-[#2E105C] border border-[#CCFF00]/40 flex items-center justify-center shadow-glow-lime mb-3">
              <span className="font-display font-black text-2xl tracking-tighter text-[#CCFF00]">
                LS
              </span>
            </div>
            <div className="text-xl font-display font-black tracking-wider text-[#F4F4F0] uppercase">
              CUSTOMS
            </div>
            <div className="text-[10px] tracking-[0.3em] font-semibold text-[#CCFF00] uppercase mt-0.5">
              Performance Div.
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[9px] text-[#A8A8AF] bg-[#0B0B0D]/80 border border-white/10 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
              SAN ANDREAS TUNING SPEC
            </div>
          </div>
        </div>
      );

    case "bahama-mamas-menu":
      return (
        <div
          className={`relative w-full h-full flex flex-col items-center justify-between bg-gradient-to-b from-[#17171B] via-[#110526] to-[#0B0B0D] p-5 overflow-hidden select-none border border-white/[0.08] ${className}`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/10 rounded-full blur-2xl" />
          <div className="relative z-10 w-full flex justify-between items-center border-b border-white/10 pb-2">
            <span className="text-[10px] tracking-widest uppercase font-bold text-pink-400">
              Del Perro Beach
            </span>
            <span className="text-[10px] tracking-widest font-mono text-[#CCFF00]">EST. 1982</span>
          </div>

          <div className="relative z-10 text-center my-auto py-2">
            <h3 className="font-display text-2xl font-black italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-[#CCFF00] to-cyan-300">
              BAHAMA MAMAS
            </h3>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#A8A8AF] mt-1">
              VIP Lounge & Cocktails
            </p>
            <div className="mt-3 space-y-1 text-left bg-[#0B0B0D]/60 p-2.5 rounded-xl border border-white/5 text-[9px]">
              <div className="flex justify-between text-[#F4F4F0]">
                <span>Pacific Neon Sunrise</span>
                <span className="text-[#CCFF00] font-mono">$450</span>
              </div>
              <div className="flex justify-between text-[#F4F4F0]">
                <span>Del Perro Blue Lagoon</span>
                <span className="text-[#CCFF00] font-mono">$600</span>
              </div>
              <div className="flex justify-between text-[#F4F4F0]">
                <span>Bleuter&apos;d Champagne (750ml)</span>
                <span className="text-[#CCFF00] font-mono">$3,500</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 w-full text-center text-[8px] text-[#6B6B72] uppercase tracking-wider">
            Guest Dress Code Strictly Enforced
          </div>
        </div>
      );

    case "ron-racing-buffalo":
      return (
        <div
          className={`relative w-full h-full flex flex-col justify-between bg-gradient-to-br from-[#17171B] via-[#0E0E12] to-[#0B0B0D] p-5 overflow-hidden select-none ${className}`}
        >
          {/* Angled racing stripes */}
          <div className="absolute -right-6 -top-10 w-32 h-64 bg-gradient-to-b from-[#CCFF00]/20 to-transparent -rotate-45 transform" />
          <div className="absolute -right-16 -top-4 w-24 h-64 bg-gradient-to-b from-[#CCFF00]/60/30 to-transparent -rotate-45 transform" />

          <div className="relative z-10 flex justify-between items-start">
            <span className="bg-[#CCFF00] text-[#0B0B0D] font-black text-[10px] px-2 py-0.5 rounded font-mono">
              #77 RACING
            </span>
            <span className="text-[10px] text-[#A8A8AF] font-mono">BRAVADO STX</span>
          </div>

          <div className="relative z-10 text-center py-4">
            <div className="font-display font-black text-3xl italic tracking-tighter text-[#F4F4F0]">
              RON <span className="text-[#CCFF00]">OIL</span>
            </div>
            <div className="text-[9px] uppercase tracking-widest text-[#A8A8AF] mt-1 font-semibold">
              Endurance Cup Livery Specification
            </div>
            <div className="mt-3 flex justify-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-mono text-[#CCFF00] border border-[#CCFF00]/30">
                ATOMIK TYRES
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-mono text-purple-300 border border-purple-500/30">
                FUKARU
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-mono text-cyan-300 border border-cyan-500/30">
                WIWANG
              </span>
            </div>
          </div>

          <div className="relative z-10 flex justify-between text-[9px] font-mono text-[#6B6B72] border-t border-white/5 pt-2">
            <span>4K UV MAP</span>
            <span className="text-[#CCFF00]">FiveM READY</span>
          </div>
        </div>
      );

    case "gruppe6-armored-livery":
      return (
        <div
          className={`relative w-full h-full flex flex-col justify-between bg-[#0E0E12] p-5 overflow-hidden select-none border border-white/10 ${className}`}
        >
          {/* Tactical caution striping */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#CCFF00] via-[#2A2A32] to-[#CCFF00]" />
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#CCFF00_25%,transparent_25%,transparent_50%,#CCFF00_50%,#CCFF00_75%,transparent_75%,transparent)] [background-size:24px_24px]" />

          <div className="relative z-10 flex justify-between items-center">
            <span className="text-[10px] font-mono tracking-widest text-[#CCFF00] font-bold">
              ARMORED TRANSIT
            </span>
            <span className="text-[9px] bg-red-950/80 text-red-400 border border-red-500/30 px-2 py-0.5 rounded">
              TACTICAL SPEC
            </span>
          </div>

          <div className="relative z-10 text-center py-3">
            <div className="inline-block p-2 rounded-xl bg-[#17171B] border border-white/10 mb-2">
              <svg className="w-8 h-8 text-[#CCFF00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="font-display font-black text-xl tracking-tight text-[#F4F4F0]">
              GRUPPE SECHS
            </div>
            <div className="text-[9px] text-[#A8A8AF] uppercase tracking-[0.2em]">
              Cash-in-Transit Division LS
            </div>
          </div>

          <div className="relative z-10 text-center text-[8px] text-[#CCFF00] font-mono bg-[#141417] py-1 px-2 rounded border border-white/[0.08]">
            EMERGENCY PROTOCOL: 911-G6-RAPID
          </div>
        </div>
      );

    case "dynasty8-brandkit":
      return (
        <div
          className={`relative w-full h-full flex flex-col justify-between bg-gradient-to-br from-[#180938] via-[#111116] to-[#0B0B0D] p-5 overflow-hidden select-none ${className}`}
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#8A2BE2]/20 rounded-full blur-2xl" />

          <div className="relative z-10 flex justify-between items-center border-b border-white/10 pb-2">
            <span className="text-[10px] font-mono text-[#CCFF00]">LUXURY REAL ESTATE</span>
            <span className="text-[9px] text-[#A8A8AF]">VINEWOOD HILLS</span>
          </div>

          <div className="relative z-10 text-center py-2">
            <div className="font-display font-black text-3xl tracking-tight text-white flex items-center justify-center gap-1">
              DYNASTY<span className="text-[#CCFF00]">8</span>
            </div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#A8A8AF] mt-1 font-medium">
              San Andreas Premier Living
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-left text-[8px]">
              <div className="p-2 rounded-lg bg-[#1B1B20] border border-white/5">
                <div className="text-gray-400">Current Listings</div>
                <div className="text-[#CCFF00] font-bold font-mono text-sm mt-0.5">84 Mansions</div>
              </div>
              <div className="p-2 rounded-lg bg-[#1B1B20] border border-white/5">
                <div className="text-gray-400">Volume (2026)</div>
                <div className="text-purple-300 font-bold font-mono text-sm mt-0.5">$92.4M</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex justify-between text-[8px] text-[#6B6B72]">
            <span>FORUM BBCODE READY</span>
            <span className="text-[#CCFF00]">BRAND KIT APPROVED</span>
          </div>
        </div>
      );

    case "bean-machine-rebrand":
      return (
        <div
          className={`relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#24110A]/80 via-[#151519] to-[#0E0E12] p-5 overflow-hidden select-none ${className}`}
        >
          <div className="relative z-10 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full border-2 border-amber-400/60 bg-[#1B1B20] flex items-center justify-center shadow-lg mb-2">
              <span className="text-xl">☕</span>
            </div>
            <h4 className="font-display font-black text-xl tracking-tight text-amber-200">
              BEAN MACHINE
            </h4>
            <p className="text-[9px] uppercase tracking-[0.2em] text-amber-400/80 font-mono mt-0.5">
              Organic Los Santos Roast
            </p>
            <div className="mt-3 flex items-center gap-2 text-[9px] bg-amber-500/10 border border-amber-400/20 text-amber-200 px-3 py-1 rounded-full">
              <span>Legion Square Flagship</span>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div
          className={`relative w-full h-full flex flex-col justify-between bg-gradient-to-br from-[#141417] to-[#101014] p-5 overflow-hidden select-none border border-white/[0.08] ${className}`}
        >
          <div className="relative z-10 flex justify-between items-center">
            <span className="text-[10px] font-mono text-[#CCFF00] uppercase">
              {item.category}
            </span>
            <span className="text-[9px] text-[#A8A8AF]">{item.year}</span>
          </div>
          <div className="relative z-10 text-center py-3">
            <div className="font-display font-bold text-lg text-white">{item.title}</div>
            <div className="text-[9px] text-[#A8A8AF] mt-1">{item.clientName}</div>
          </div>
          <div className="relative z-10 flex justify-between text-[8px] text-[#6B6B72]">
            <span>SAUVAGE STUDIO</span>
            <span className="text-[#CCFF00]">AUTHENTIC GTAW SPEC</span>
          </div>
        </div>
      );
  }
};
