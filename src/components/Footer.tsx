"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MessageSquare, Send, CheckCircle2, ShieldAlert } from "lucide-react";
import { siteConfig } from "../config/siteConfig";

export const Footer: React.FC = () => {
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput("");
    }
  };

  return (
    <footer className="w-full bg-[#0B031E] border-t border-[#6A0DAD]/30 text-[#B8AFD1] relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#6A0DAD]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6A0DAD] to-[#CCFF00] p-[2px]">
                <div className="w-full h-full rounded-full bg-[#0F0529] flex items-center justify-center">
                  <span className="font-display font-black text-base text-[#CCFF00]">VX</span>
                </div>
              </div>
              <span className="font-display font-black text-2xl tracking-tight text-[#F5F3FA]">
                {siteConfig.agencyName}
              </span>
            </div>
            <p className="text-sm text-[#B8AFD1] max-w-sm leading-relaxed">
              {siteConfig.tagline}. Operating across Los Santos and Blaine County on the GTA World
              Roleplay server.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-[#CCFF00] mt-2">
              <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
              <span>COMMISSIONS OPEN • 24-48H TURNAROUND</span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <a
                href={siteConfig.serverInfo.discordUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#160B36] hover:bg-[#1B0F3D] text-[#F5F3FA] hover:text-[#CCFF00] border border-[#6A0DAD]/40 text-xs font-medium transition-all"
              >
                <MessageSquare className="w-4 h-4 text-[#CCFF00]" />
                <span>Join Studio Discord</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#F5F3FA] font-bold">
              Navigation
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/work" className="hover:text-[#CCFF00] transition-colors">
                Portfolio Showcase
              </Link>
              <Link href="/request" className="hover:text-[#CCFF00] transition-colors">
                Request a Design
              </Link>
              <Link href="/#how-it-works" className="hover:text-[#CCFF00] transition-colors">
                How It Works
              </Link>
              <Link href="/#pricing" className="hover:text-[#CCFF00] transition-colors">
                Pricing & Packages
              </Link>
              <Link href="/contact" className="hover:text-[#CCFF00] transition-colors">
                Studio & Contact
              </Link>
              <Link href="/admin" className="hover:text-[#CCFF00] transition-colors">
                Admin Portal
              </Link>
            </div>
          </div>

          {/* Los Santos Presence */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#F5F3FA] font-bold">
              In-Game Studio
            </h4>
            <div className="flex flex-col gap-2 text-xs leading-relaxed">
              <p className="text-[#F5F3FA] font-semibold">{siteConfig.serverInfo.inGameLocation}</p>
              <p className="text-[#7A7099]">{siteConfig.serverInfo.operatingHours}</p>
              <p className="text-[#CCFF00] font-mono">Routing: 020084912</p>
              <p className="text-[#7A7099]">RAGE:MP GTA World</p>
            </div>
          </div>

          {/* Newsletter / Notifications */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#F5F3FA] font-bold">
              Studio Updates
            </h4>
            <p className="text-xs text-[#B8AFD1] leading-relaxed">
              Receive notifications for slot availability, flash livery sales, and holiday package
              discounts.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-[#CCFF00] bg-[#160B36] p-3 rounded-2xl border border-[#CCFF00]/30">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Subscribed for studio dispatches.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Discord handle or email..."
                    className="w-full bg-[#160B36] border border-[#6A0DAD]/40 rounded-full px-4 py-2.5 text-xs text-[#F5F3FA] placeholder-[#7A7099] focus:outline-none focus:border-[#CCFF00] transition-colors"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-full bg-[#CCFF00] text-[#0F0529] hover:bg-[#B8E600] flex items-center justify-center transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* OOC GTA World Roleplay Legal Disclaimer */}
        <div className="rounded-2xl bg-[#160B36]/80 border border-[#6A0DAD]/30 p-4 md:p-6 mb-8 flex flex-col md:flex-row items-start md:items-center gap-4 text-xs text-[#B8AFD1]">
          <div className="p-2.5 rounded-xl bg-[#0F0529] text-[#CCFF00] border border-[#CCFF00]/20 flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="font-bold text-[#F5F3FA] uppercase font-mono tracking-wide block mb-1">
              Out of Character (OOC) Roleplay & Banking Notice
            </span>
            <p className="leading-relaxed text-[11px] text-[#A69CC0]">
              {siteConfig.oocDisclaimer}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5 text-xs text-[#7A7099]">
          <p>© {new Date().getFullYear()} Vortex Creative Studio. Built for GTA World RP.</p>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[11px]">Powered by Fleeca Gateway v2</span>
            <span>Los Santos, San Andreas</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
