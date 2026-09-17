"use client";

import React, { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package, Clock, CheckCircle2, CreditCard, FileText, Download, MessageSquare, ArrowRight,
  ShieldCheck, Zap, Sparkles, ExternalLink, Calendar, Building2
} from "lucide-react";
import { DesignRequest } from "../../lib/types";
import { EmptyDashboard } from "../../components/EmptyState";
import { ClientPortalSkeleton } from "../../components/Skeleton";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_quote: { label: "Pending Quote", color: "bg-amber-400/10 text-amber-300 border-amber-400/30", icon: <Clock className="w-3 h-3" /> },
  quoted: { label: "Quoted", color: "bg-blue-400/10 text-blue-300 border-blue-400/30", icon: <FileText className="w-3 h-3" /> },
  awaiting_deposit: { label: "Awaiting Deposit", color: "bg-blue-400/10 text-blue-300 border-blue-400/30", icon: <CreditCard className="w-3 h-3" /> },
  paid: { label: "Deposit Paid", color: "bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  in_progress: { label: "In Production", color: "bg-purple-400/10 text-purple-300 border-purple-400/30", icon: <Zap className="w-3 h-3" /> },
  ready_for_review: { label: "Ready for Review", color: "bg-amber-400/10 text-amber-300 border-amber-400/30", icon: <FileText className="w-3 h-3" /> },
  delivered: { label: "Delivered", color: "bg-green-400/10 text-green-300 border-green-400/30", icon: <Download className="w-3 h-3" /> },
  completed: { label: "Completed", color: "bg-green-400/10 text-green-300 border-green-400/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  cancelled: { label: "Cancelled", color: "bg-red-400/10 text-red-300 border-red-400/30", icon: <FileText className="w-3 h-3" /> },
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const ProjectCard: React.FC<{ request: DesignRequest }> = ({ request }) => {
  const statusInfo = STATUS_LABELS[request.status] || { label: request.status, color: "bg-white/5 text-white border-white/10", icon: <Package className="w-3 h-3" /> };
  const messages = request.messages ?? [];
  const lastMessage = messages[messages.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-2xl bg-[#141417] border border-white/[0.08] p-5 hover:border-electric-lime/50 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-lime/[0.15] to-surface-2 border border-white/[0.08] flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-electric-lime" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-medium text-lg text-text-primary truncate pr-2">
              {request.businessName || request.projectType}
            </h3>
            <p className="text-xs text-text-muted truncate">{request.id} · {request.projectType}</p>
          </div>
        </div>
        <span className={`font-mono px-2.5 py-1 rounded-full text-[10px] border shrink-0 ${statusInfo.color}`}>
          <span className="flex items-center gap-1">{statusInfo.icon} {statusInfo.label}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
        <div>
          <span className="text-text-muted block">Client</span>
          <span className="text-text-primary font-medium">{request.clientName}</span>
        </div>
        <div>
          <span className="text-text-muted block">Submitted</span>
          <span className="text-text-primary font-medium">{new Date(request.createdAt).toLocaleDateString()}</span>
        </div>
        <div>
          <span className="text-text-muted block">Budget</span>
          <span className="text-text-primary font-medium text-electric-lime">{request.budgetRange}</span>
        </div>
        <div>
          <span className="text-text-muted block">Messages</span>
          <span className="text-text-primary font-medium">{messages.length}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-white/[0.08] flex flex-wrap gap-2">
        <Link
          href={`/request/${request.id}`}
          className="flex-1 min-w-[120px] py-2.5 px-4 rounded-full text-xs font-bold text-[#0B0B0D] bg-electric-lime hover:bg-electric-lime-hover shadow-glow-lime flex items-center justify-center gap-2 transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Open Project Room</span>
        </Link>
        {request.deliverablesUrl && request.status !== "cancelled" && (
          <a
            href={request.deliverablesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[120px] py-2.5 px-4 rounded-full text-xs font-medium text-text-secondary hover:text-electric-lime bg-[#0B0B0D] border border-white/[0.08] flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Files</span>
          </a>
        )}
        {request.status === "awaiting_deposit" && request.depositPaymentLink && (
          <a
            href={request.depositPaymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[120px] py-2.5 px-4 rounded-full text-xs font-bold text-[#0B0B0D] bg-electric-lime hover:bg-electric-lime-hover shadow-glow-lime flex items-center justify-center gap-2 transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pay Deposit</span>
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default function ClientPortalPage() {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<DesignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("discord", { callbackUrl: "/client" });
    } else if (status === "authenticated") {
      fetch("/api/requests/me")
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            // Sort by most recent first
            setRequests(data.data.sort((a: DesignRequest, b: DesignRequest) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return <ClientPortalSkeleton />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <ShieldCheck className="w-12 h-12 text-[#CCFF00] mx-auto mb-4" />
          <h1 className="text-xl font-display font-bold text-[#F4F4F0] mb-2">Client access required</h1>
          <p className="text-sm text-[#A8A8AF] mb-6">Sign in with your Discord account to view your projects.</p>
          <button
            onClick={() => signIn("discord", { callbackUrl: "/client" })}
            className="px-6 py-3 rounded-full text-xs font-bold text-[#0B0B0D] bg-[#5865F2] hover:bg-[#4752C4] transition-colors"
          >
            Sign in with Discord
          </button>
        </div>
      </div>
    );
  }

  const filteredRequests = requests.filter((req) => {
    if (filter === "active") return !["completed", "cancelled"].includes(req.status);
    if (filter === "completed") return ["completed"].includes(req.status);
    return true;
  });

  const stats = {
    total: requests.length,
    active: requests.filter((r) => !["completed", "cancelled"].includes(r.status)).length,
    completed: requests.filter((r) => r.status === "completed").length,
    pendingDeposit: requests.filter((r) => r.status === "awaiting_deposit").length,
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-10 border-b border-white/[0.08] pb-6">
        <div>
          <div className="text-[#CCFF00] font-mono text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Client Portal
          </div>
          <h1 className="text-3xl font-display font-black text-[#F4F4F0]">
            Welcome, {session?.user?.name}
          </h1>
        </div>
        <Link
          href="/request"
          className="bg-[#CCFF00] text-[#0B0B0D] px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#B8E600] transition-colors flex items-center gap-2 shadow-glow-lime"
        >
          <Zap className="w-4 h-4" /> New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Projects", value: stats.total, icon: Package, color: "text-[#CCFF00]" },
          { label: "Active", value: stats.active, icon: Zap, color: "text-purple-300" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-green-300" },
          { label: "Awaiting Deposit", value: stats.pendingDeposit, icon: CreditCard, color: "text-blue-300" },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl bg-[#141417] border border-white/[0.08] p-5 flex flex-col gap-2"
          >
            <Icon className={`w-5 h-5 ${color}`} />
            <div className={`font-display font-black text-2xl ${color} font-mono`}>{value}</div>
            <div className="text-xs text-[#A8A8AF]">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 bg-[#141417] border border-white/[0.08] rounded-xl p-1">
        {(["all", "active", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? "bg-electric-lime/[0.12] border border-electric-lime/30 text-electric-lime"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Projects */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <EmptyDashboard />
        ) : (
          filteredRequests.map((req, idx) => (
            <ProjectCard key={req.id} request={req} />
          ))
        )}
      </div>

      <Link
        href="/request"
        className="mt-10 block w-full max-w-xs mx-auto py-3.5 rounded-full text-center text-sm font-bold text-[#0B0B0D] bg-electric-lime hover:bg-electric-lime-hover shadow-glow-lime flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4" /> Start a New Project
      </Link>
    </div>
  );
}