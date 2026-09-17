"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Package, Plus, Zap, Sparkles, FileText, ArrowRight, ShieldCheck, MessageSquare, Star, Palette, ImageIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  illustration?: React.ReactNode;
  primaryAction?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  className?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  illustration,
  primaryAction,
  secondaryAction,
  className = "",
  icon,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`flex flex-col items-center text-center py-16 md:py-24 px-6 ${className}`}
  >
    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-electric-lime/[0.1] to-surface-2 border border-white/[0.08] flex items-center justify-center mb-8 mx-auto">
      {illustration || icon || (
        <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-electric-lime/70" />
      )}
    </div>

    <h3 className="font-display font-medium text-2xl md:text-3xl text-text-primary mb-3 text-balance">
      {title}
    </h3>

    <p className="text-sm md:text-base text-text-secondary max-w-md mx-auto mb-8 leading-relaxed">
      {description}
    </p>

    <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
      {primaryAction && (
        <Link
          href={primaryAction.href}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold text-[#0B0B0D] bg-electric-lime hover:bg-electric-lime-hover shadow-glow-lime transition-all"
        >
          {primaryAction.icon && <span>{primaryAction.icon}</span>}
          <span>{primaryAction.label}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
      {secondaryAction && (
        <Link
          href={secondaryAction.href}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-xs text-electric-lime hover:text-[#0B0B0D] bg-[#0B0B0D] hover:bg-electric-lime border border-electric-lime/30 transition-colors"
        >
          {secondaryAction.icon && <span>{secondaryAction.icon}</span>}
          <span>{secondaryAction.label}</span>
        </Link>
      )}
    </div>
  </motion.div>
);

// Pre-built empty states for common scenarios
export const EmptyPortfolio: React.FC<{ onAddItem?: () => void }> = ({ onAddItem }) => (
  <EmptyState
    title="Your portfolio is empty"
    description="Showcase your best work — logos, brand kits, menus, signage, and more. Your portfolio appears on the homepage and the /work archive."
    icon={<Palette className="w-12 h-12 md:w-16 md:h-16 text-electric-lime/70" />}
    primaryAction={{
      label: "Add Your First Piece",
      href: "/admin/portfolio",
      icon: <Plus className="w-4 h-4" />,
    }}
    secondaryAction={{
      label: "View Public Portfolio",
      href: "/work",
      icon: <ImageIcon className="w-4 h-4" />,
    }}
  />
);

export const EmptyDashboard: React.FC = () => (
  <EmptyState
    title="No projects yet"
    description="You haven't submitted any design briefs yet. Start your first project and watch it come to life in your project room."
    icon={<FileText className="w-12 h-12 md:w-16 md:h-16 text-electric-lime/70" />}
    primaryAction={{
      label: "Submit a Design Brief",
      href: "/request",
      icon: <Zap className="w-4 h-4" />,
    }}
    secondaryAction={{
      label: "Browse Portfolio",
      href: "/work",
      icon: <ImageIcon className="w-4 h-4" />,
    }}
  />
);

export const EmptyAdminDashboard: React.FC = () => (
  <EmptyState
    title="No design requests yet"
    description="When clients submit briefs, they'll appear here. You can issue quotes, track payments, and manage production."
    icon={<Package className="w-12 h-12 md:w-16 md:h-16 text-electric-lime/70" />}
    primaryAction={{
      label: "View All Requests",
      href: "/admin",
      icon: <ShieldCheck className="w-4 h-4" />,
    }}
  />
);

export const EmptyMessages: React.FC<{ requestStatus?: string; onSendMessage?: () => void }> = ({
  requestStatus,
}) => (
  <EmptyState
    title={requestStatus === "awaiting_deposit" ? "Waiting for deposit" : "No messages yet"}
    description={
      requestStatus === "awaiting_deposit"
        ? "Once your 50% deposit clears via Fleeca, this project room opens and you can message your designer directly."
        : "Say hello to your designer! Share revisions, references, and feedback — everything stays in one place."
    }
    icon={<MessageSquare className="w-12 h-12 md:w-16 md:h-16 text-electric-lime/70" />}
    primaryAction={
      requestStatus !== "awaiting_deposit" ? {
        label: "Start a Conversation",
        href: "#",
        icon: <MessageSquare className="w-4 h-4" />,
      } : undefined
    }
  />
);

export const EmptyReviews: React.FC = () => (
  <EmptyState
    title="No reviews yet"
    description="Be the first to share your experience! Verified reviews help other Los Santos business owners discover SAUVAGE."
    icon={<Star className="w-12 h-12 md:w-16 md:h-16 text-electric-lime/70" />}
    primaryAction={{
      label: "Submit a Review",
      href: "#",
      icon: <Sparkles className="w-4 h-4" />,
    }}
  />
);

export const EmptyWorkArchive: React.FC = () => (
  <EmptyState
    title="No projects in this category"
    description="Projects will appear here once they're added to the portfolio. Filter by category or browse all work."
    icon={<ImageIcon className="w-12 h-12 md:w-16 md:h-16 text-electric-lime/70" />}
    primaryAction={{
      label: "View All Work",
      href: "/work",
      icon: <ArrowRight className="w-4 h-4" />,
    }}
  />
);