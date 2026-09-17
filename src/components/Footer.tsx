"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  MessageSquare,
  Send,
  CheckCircle2,
  ShieldAlert,
  Landmark,
  Phone,
} from "lucide-react";
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
    <footer className="w-full bg-[#08080A] border-t border-white/[0.08] text-text-secondary relative overflow-hidden">
      {/* Green hairline accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-electric-lime/50 to-transparent" />

      {/* Background ambient glow */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-electric-lime/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-4 lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] border border-electric-lime/40 bg-electric-lime/[0.06] flex items-center justify-center">
                <span className="font-display font-semibold italic text-base text-electric-lime leading-none">
                  S
                </span>
              </div>
              <span className="font-display font-medium text-xl tracking-tight text-text-primary">
                {siteConfig.agencyName}
              </span>
            </div>
            <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
              {siteConfig.tagline}. Operating across Los Santos and Blaine County on the GTA World
              Roleplay server.
            </p>
            <div className="flex items-center gap-2.5 text-[11px] font-mono text-electric-lime">
              <span className="w-1.5 h-1.5 rounded-full bg-electric-lime animate-pulse" />
              <span>COMMISSIONS OPEN • 24-48H TURNAROUND</span>
            </div>

            <div className="mt-4">
              <a
                href={siteConfig.serverInfo.discordUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/[0.1] bg-white/[0.02] text-text-primary hover:border-electric-lime/50 hover:text-electric-lime text-xs font-medium transition-all duration-300"
              >
                <MessageSquare className="w-4 h-4 text-electric-lime" />
                <span>Join Studio Discord</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-2 lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-primary font-semibold">
              Navigation
            </h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link href="/work" className="hover:text-electric-lime transition-colors w-fit">
                Portfolio Showcase
              </Link>
              <Link href="/request" className="hover:text-electric-lime transition-colors w-fit">
                Request a Design
              </Link>
              <Link href="/#how-it-works" className="hover:text-electric-lime transition-colors w-fit">
                How It Works
              </Link>
              <Link href="/#pricing" className="hover:text-electric-lime transition-colors w-fit">
                Pricing &amp; Packages
              </Link>
              <Link href="/contact" className="hover:text-electric-lime transition-colors w-fit">
                Studio &amp; Contact
              </Link>
              <Link href="/admin" className="hover:text-electric-lime transition-colors w-fit">
                Admin Portal
              </Link>
            </div>
          </div>

          {/* In-Game Presence */}
          <div className="md:col-span-3 lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-primary font-semibold">
              In-Game Studio
            </h4>
            <div className="flex flex-col gap-2.5 text-xs leading-relaxed">
              <p className="text-text-primary font-semibold">{siteConfig.serverInfo.inGameLocation}</p>
              <p className="text-text-muted">{siteConfig.serverInfo.operatingHours}</p>
              <p className="flex items-center gap-1.5 text-electric-lime font-mono">
                <Landmark className="w-3.5 h-3.5" />
                Routing: 030139330
              </p>
              <p className="flex items-center gap-1.5 text-electric-lime font-mono">
                <Phone className="w-3.5 h-3.5" />
                Hotline: {siteConfig.serverInfo.hotline}
              </p>
              <p className="text-text-muted">FiveM GTA World</p>
            </div>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-primary font-semibold">
              Studio Updates
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Receive notifications for slot availability, flash sales, and holiday package
              discounts.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-electric-lime bg-surface p-3.5 rounded-xl border border-electric-lime/30">
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
                    className="w-full bg-surface border border-white/[0.1] rounded-xl px-4 py-3 pr-12 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-electric-lime/60 focus:ring-1 focus:ring-electric-lime/30 transition-all duration-300"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-electric-lime text-[#0B0B0D] hover:bg-electric-lime-hover flex items-center justify-center transition-colors shadow-glow-lime"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* OOC disclaimer */}
        <div className="rounded-2xl bg-surface/70 border border-white/[0.08] p-4 md:p-6 mb-8 flex flex-col md:flex-row items-start md:items-center gap-4 text-xs text-text-secondary">
          <div className="p-2.5 rounded-xl bg-[#0B0B0D] text-electric-lime border border-electric-lime/20 flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="font-semibold text-text-primary font-mono tracking-wide block mb-1 text-[10px] uppercase">
              Out of Character (OOC) Roleplay &amp; Banking Notice
            </span>
            <p className="leading-relaxed text-[11px] text-text-secondary">
              {siteConfig.oocDisclaimer}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/[0.06] text-xs text-text-muted">
          <p>© {new Date().getFullYear()} SAUVAGE™. Built for GTA World RP.</p>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[11px]">Powered by Fleeca Gateway v2</span>
            <span>Los Santos, San Andreas</span>
          </div>
        </div>
      </div>
    </footer>
  );
};