"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, ShieldCheck, User, Zap, Package, MessageSquare, Settings, LogOut } from "lucide-react";
import { siteConfig } from "../config/siteConfig";
import { useSession, signOut } from "next-auth/react";

export const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
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
    { label: "Portfolio", href: "/work", icon: Package },
    { label: "How It Works", href: "/#how-it-works", icon: Zap },
    { label: "Pricing", href: "/#pricing", icon: Package },
    { label: "FAQ", href: "/#faq", icon: MessageSquare },
    { label: "Contact", href: "/contact", icon: MessageSquare },
  ];

  const isActive = (href: string) => pathname === href || (href.startsWith("/#") && pathname.includes(href.slice(2)));

  const userLinks = session ? [
    { label: "My Projects", href: "/dashboard", icon: Package, external: false },
    { label: "Client Portal", href: "/client", icon: ShieldCheck, external: false },
    { label: "Start Project", href: "/request", icon: ArrowRight, external: false, primary: true },
  ] : [
    { label: "Sign In", href: "/login", icon: User, external: false },
    { label: "Start Project", href: "/request", icon: ArrowRight, external: false, primary: true },
  ];

  const adminLink = { label: "Admin Portal", href: "/admin", icon: ShieldCheck };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#0B0B0D]/90 backdrop-blur-xl border-b border-white/[0.07]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto flex items-center justify-between gap-4 px-5 md:px-8 transition-all duration-300 ${
          scrolled ? "py-2.5" : "py-4 md:py-5"
        }`}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center group" aria-label={siteConfig.agencyName}>
          <Image
            src="/icon.png"
            alt={siteConfig.agencyName}
            width={40}
            height={40}
            priority
            className="h-9 w-9 md:h-10 md:w-10 object-contain transition-opacity duration-300 group-hover:opacity-80"
          />
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

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-5">
          <Link
            href={adminLink.href}
            className="flex items-center gap-1.5 text-[12px] font-mono text-text-secondary hover:text-electric-lime transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>

          {session ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-[12px] font-mono text-text-secondary hover:text-text-primary transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>{session.user?.name}</span>
              </Link>
              <Link
                href="/request"
                className="group inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-[#0B0B0D] bg-electric-lime hover:bg-electric-lime-hover shadow-glow-lime transition-all duration-300 hover:shadow-glow-lime-strong hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Start Project</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-[12px] font-mono text-text-secondary hover:text-text-primary transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/request"
                className="group inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-[#0B0B0D] bg-electric-lime hover:bg-electric-lime-hover shadow-glow-lime transition-all duration-300 hover:shadow-glow-lime-strong hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Start Project</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden text-text-primary p-2 rounded-lg border border-white/[0.08] bg-white/[0.03] transition-colors hover:bg-white/[0.06]"
          aria-label={mobileOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-Out Sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#07070A]/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Sheet */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm lg:hidden bg-[#0B0B0D] border-l border-white/[0.08] shadow-2xl flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation Menu"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
                <Link href="/" className="flex items-center" aria-label={siteConfig.agencyName} onClick={() => setMobileOpen(false)}>
                  <Image
                    src="/icon.png"
                    alt={siteConfig.agencyName}
                    width={36}
                    height={36}
                    className="h-8 w-8 object-contain"
                  />
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-text-primary hover:text-electric-lime hover:border-electric-lime/50 transition-all"
                  aria-label="Close Navigation Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1" aria-label="Main Navigation">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? "bg-electric-lime/[0.12] border border-electric-lime/30 text-electric-lime"
                          : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                      <span>{link.label}</span>
                      {active && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto w-2 h-2 rounded-full bg-electric-lime" />}
                    </Link>
                  );
                })}

                <Link
                  href={adminLink.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-text-secondary hover:text-electric-lime hover:bg-white/[0.04] transition-colors"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Admin Portal</span>
                </Link>
              </nav>

              {/* User Actions */}
              <div className="border-t border-white/[0.08] p-4 space-y-3">
                {session ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors w-full"
                    >
                      <Package className="w-5 h-5" />
                      <span>My Projects</span>
                    </Link>
                    <Link
                      href="/client"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-text-secondary hover:text-electric-lime hover:bg-white/[0.04] transition-colors w-full"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      <span>Client Portal</span>
                    </Link>
                    <Link
                      href="/request"
                      onClick={() => setMobileOpen(false)}
                      className="w-full py-3.5 rounded-full text-center text-sm font-semibold text-[#0B0B0D] bg-electric-lime hover:bg-electric-lime-hover shadow-glow-lime flex items-center justify-center gap-2"
                    >
                      <span>Start Project</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors w-full"
                    >
                      <User className="w-5 h-5" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/request"
                      onClick={() => setMobileOpen(false)}
                      className="w-full py-3.5 rounded-full text-center text-sm font-semibold text-[#0B0B0D] bg-electric-lime hover:bg-electric-lime-hover shadow-glow-lime flex items-center justify-center gap-2"
                    >
                      <span>Start Project</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 pb-6 text-center">
                <p className="text-center text-[10px] text-text-muted font-mono mb-3">
                  Official Fleeca Gateway · GTA World Roleplay
                </p>
                {session && (
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-red-400 hover:bg-red-500/[0.08] border border-white/[0.08] transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};