"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, ArrowRight, ShieldCheck, User } from "lucide-react";
import { siteConfig } from "../config/siteConfig";
import { useSession } from "next-auth/react";

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Portfolio", href: "/work" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-4 md:py-6 pointer-events-none transition-all duration-300">
      <nav
        className={`pointer-events-auto flex items-center justify-between gap-4 md:gap-8 px-5 py-2.5 rounded-full transition-all duration-300 ${
          scrolled
            ? "bg-[#160B36]/85 backdrop-blur-xl border border-[#6A0DAD]/40 shadow-card-subtle"
            : "bg-[#160B36]/60 backdrop-blur-lg border border-[#6A0DAD]/25"
        } max-w-5xl w-full`}
        aria-label="Main Navigation"
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6A0DAD] to-[#CCFF00] p-[1.5px] transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full rounded-full bg-[#0F0529] flex items-center justify-center">
              <span className="font-display font-black text-sm text-[#CCFF00] tracking-tighter">
                VX
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-base tracking-tight text-[#F5F3FA] group-hover:text-white transition-colors">
              {siteConfig.agencyName}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#B8AFD1] font-mono -mt-1 hidden sm:block">
              GTAW Creative
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-[#0F0529]/60 px-3 py-1 rounded-full border border-white/5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#CCFF00] text-[#0F0529] font-bold shadow-glow-lime"
                    : "text-[#B8AFD1] hover:text-[#F5F3FA] hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <Link
              href="/dashboard"
              className="text-[11px] font-mono text-[#B8AFD1] hover:text-[#CCFF00] transition-colors px-2 py-1 flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>{session.user?.name}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-[11px] font-mono text-[#B8AFD1] hover:text-white transition-colors px-2 py-1 flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}

          <Link
            href="/admin"
            className="text-[11px] font-mono text-[#B8AFD1] hover:text-[#CCFF00] transition-colors px-2 py-1 flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>

          <Link
            href="/request"
            className="group relative inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-[#0F0529] bg-[#CCFF00] hover:bg-[#B8E600] transition-all duration-300 shadow-glow-lime hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Project</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile Burger Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-[#F5F3FA] hover:text-[#CCFF00] p-1.5 rounded-lg bg-white/5"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto absolute top-20 left-4 right-4 bg-[#160B36]/95 backdrop-blur-2xl border border-[#6A0DAD]/40 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 md:hidden"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-2xl text-sm font-medium text-[#B8AFD1] hover:text-[#F5F3FA] hover:bg-white/5 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-2xl text-sm font-medium text-[#B8AFD1] hover:text-[#CCFF00] hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Portal</span>
              </Link>
            </div>

            <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
              <Link
                href="/request"
                onClick={() => setMobileOpen(false)}
                className="w-full py-3 rounded-full text-center text-sm font-bold text-[#0F0529] bg-[#CCFF00] hover:bg-[#B8E600] transition-colors shadow-glow-lime flex items-center justify-center gap-2"
              >
                <span>Start Project</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-center text-[10px] text-[#7A7099] font-mono">
                Official Fleeca Gateway • GTA World Roleplay
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
