"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, X, ArrowRight, Package, FileText, Zap, Settings, User, ShieldCheck, MessageSquare, ExternalLink, FolderOpen, Star } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

type CommandCategory = "navigation" | "actions" | "admin" | "portfolio" | "help";

interface CommandItem {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  category: CommandCategory;
  keywords: readonly string[];
  external?: boolean;
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        setSelectedIndex(0);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const commands = [
    // Navigation
    { label: "Portfolio", description: "Browse all commissioned work", href: "/work", icon: <Package className="w-4 h-4" />, category: "navigation" as const, keywords: ["portfolio", "work", "gallery", "browse"] },
    { label: "How It Works", description: "Learn our 4-step design process", href: "/#how-it-works", icon: <Zap className="w-4 h-4" />, category: "navigation" as const, keywords: ["process", "steps", "how", "works"] },
    { label: "Pricing", description: "View our transparent in-game rates", href: "/#pricing", icon: <Package className="w-4 h-4" />, category: "navigation" as const, keywords: ["pricing", "rates", "cost", "packages"] },
    { label: "FAQ", description: "Frequently asked questions", href: "/#faq", icon: <MessageSquare className="w-4 h-4" />, category: "navigation" as const, keywords: ["faq", "questions", "help"] },
    { label: "Contact", description: "Get in touch with the team", href: "/contact", icon: <MessageSquare className="w-4 h-4" />, category: "navigation" as const, keywords: ["contact", "support", "discord"] },

    // Actions
    { label: "Start New Project", description: "Submit a design brief", href: "/request", icon: <Zap className="w-4 h-4" />, category: "actions" as const, keywords: ["new", "project", "brief", "request", "commission"] },
    { label: "My Projects", description: "View your active and past projects", href: "/dashboard", icon: <FolderOpen className="w-4 h-4" />, category: "actions" as const, keywords: ["my", "projects", "dashboard", "active"] },
    { label: "Submit Review", description: "Leave feedback for a completed project", href: "/#reviews", icon: <Star className="w-4 h-4" />, category: "actions" as const, keywords: ["review", "feedback", "testimonial"] },

    // Admin (if admin)
    ...(session?.user?.isAdmin ? [
      { label: "Admin Dashboard", description: "Manage requests and payments", href: "/admin", icon: <ShieldCheck className="w-4 h-4" />, category: "admin" as const, keywords: ["admin", "dashboard", "manage", "requests"] },
      { label: "Portfolio Manager", description: "Add, edit, reorder portfolio items", href: "/admin/portfolio", icon: <Package className="w-4 h-4" />, category: "admin" as const, keywords: ["portfolio", "manager", "add", "edit", "reorder"] },
    ] : []),

    // Settings
    { label: "Sign In", description: "Sign in with Discord", href: "/login", icon: <User className="w-4 h-4" />, category: "help" as const, keywords: ["signin", "login", "discord", "auth"] },
    { label: "Sign Out", description: "Sign out of your account", href: "/api/auth/signout", icon: <User className="w-4 h-4" />, category: "help" as const, keywords: ["signout", "logout", "exit"] },
  ] as const;

  const filteredCommands = commands
    .filter((cmd) => {
      const search = query.toLowerCase();
      return (
        cmd.label.toLowerCase().includes(search) ||
        cmd.description.toLowerCase().includes(search) ||
        cmd.keywords.some((k) => k.includes(search))
      );
    })
    .slice(0, 8);

  const handleSelect = (cmd: CommandItem) => {
    if (cmd.external || cmd.href.startsWith("http")) {
      window.open(cmd.href, "_blank");
    } else if (cmd.href === "/api/auth/signout") {
      fetch("/api/auth/signout", { method: "POST" }).then(() => window.location.reload());
    } else {
      window.location.href = cmd.href;
    }
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredCommands[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
      setSelectedIndex(0);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#07070A]/80 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
            className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl mx-4"
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-label="Command Palette"
          >
            <div className="bg-[#141417] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.08]">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B72]" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelectedIndex(0);
                    }}
                    placeholder="Type a command or search…"
                    className="w-full bg-[#0B0B0D] border border-white/[0.08] focus:border-electric-lime rounded-xl px-10 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors"
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                </div>
                <kbd className="px-2.5 py-1.5 rounded bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-text-muted">
                  ⌘K
                </kbd>
              </div>

              {/* Results */}
              <AnimatePresence mode="popLayout">
                {filteredCommands.length > 0 ? (
                  <motion.ul
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-h-96 overflow-y-auto"
                  >
                    {filteredCommands.map((cmd, index) => (
                      <motion.li
                        key={cmd.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <button
                          onClick={() => handleSelect(cmd)}
                          className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors ${
                            index === selectedIndex
                              ? "bg-electric-lime/[0.12] border-l-4 border-electric-lime text-electric-lime"
                              : "text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
                          }`}
                        >
                          <span className="w-8 h-8 flex items-center justify-center shrink-0">
                            {cmd.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm ${index === selectedIndex ? "text-electric-lime" : "text-text-primary"}`}>
                              {cmd.label}
                            </p>
                            <p className="text-[11px] text-text-muted truncate">{cmd.description}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono text-text-muted bg-white/[0.03] uppercase">
                            {cmd.category}
                          </span>
                        </button>
                      </motion.li>
                    ))}
                  </motion.ul>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="px-5 py-12 text-center"
                  >
                    <p className="text-text-muted">No commands found for &ldquo;{query}&rdquo;</p>
                    <p className="text-[11px] text-text-muted mt-1">Try a different search term</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer Hint */}
              <div className="px-5 py-3 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-text-muted">
                <span>↑ ↓ Navigate • ↵ Select • ⎋ Close</span>
                <span>SAUVAGE Command Palette</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Hook to use command palette anywhere
export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  return { isOpen, setIsOpen };
};