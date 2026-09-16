"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, ShieldCheck, User } from "lucide-react";
import { siteConfig } from "../config/siteConfig";
import { useSession } from "next-auth/react";

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Portfolio", href: "/work" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#0B0B0D]/80 backdrop-blur-xl border-b border-white/[0.07]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto flex items-center justify-between gap-4 px-5 md:px-8 transition-all duration-300 ${
          scrolled ? "py-2.5" : "py-4 md:py-5"
        }`}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-[8px] border border-electric-lime/40 bg-electric-lime/[0.06] flex items-center justify-center transition-colors group-hover:bg-electric-lime/15">
            <span className="font-display font-semibold italic text-sm text-electric-lime leading-none">
              S
            </span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-medium text-lg tracking-tight text-text-primary transition-colors group-hover:text-white">
              {siteConfig.agencyName}
            </span>
            <span className="hidden sm:block font-mono text-[9px] uppercase tracking-[0.28em] text-text-muted mt-1">
              Los Santos · Est. GTAW
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`group relative px-3.5 py-2 text-[13px] tracking-wide transition-colors ${
                isActive(link.href)
                  ? "text-electric-lime"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {link.label}
              <span className="absolute left-3.5 right-3.5 -bottom-[1px] h-px origin-left scale-x-0 bg-electric-lime transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-5">
          {session ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-[12px] font-mono text-text-secondary hover:text-electric-lime transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>{session.user?.name}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-[12px] font-mono text-text-secondary hover:text-text-primary transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}

          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-[12px] font-mono text-text-secondary hover:text-electric-lime transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>

          <Link
            href="/request"
            className="group inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-[#0B0B0D] bg-electric-lime hover:bg-electric-lime-hover shadow-glow-lime transition-all duration-300 hover:shadow-glow-lime-strong hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Project</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden text-text-primary p-2 rounded-lg border border-white/[0.08] bg-white/[0.03]"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden mx-4 md:mx-8 mt-2 bg-surface-2/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-lift"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-electric-lime hover:bg-white/[0.04] transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Portal</span>
              </Link>
            </div>

            <div className="mt-3 border-t border-white/[0.08] pt-4 flex flex-col gap-3">
              {session ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-3 rounded-full text-center text-sm text-text-secondary border border-white/[0.1] hover:text-electric-lime transition-colors"
                >
                  {session.user?.name}
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-3 rounded-full text-center text-sm text-text-secondary border border-white/[0.1] hover:text-electric-lime transition-colors"
                >
                  Sign In
                </Link>
              )}
              <Link
                href="/request"
                onClick={() => setMobileOpen(false)}
                className="w-full py-3 rounded-full text-center text-sm font-semibold text-[#0B0B0D] bg-electric-lime hover:bg-electric-lime-hover shadow-glow-lime flex items-center justify-center gap-2"
              >
                <span>Start Project</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-center text-[10px] text-text-muted font-mono">
                Official Fleeca Gateway · GTA World Roleplay
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};