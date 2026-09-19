"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { DesignRequest } from "../../lib/types";
import { motion } from "framer-motion";
import { ArrowRight, Package, Clock, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { EmptyDashboard } from "../../components/EmptyState";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<DesignRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("discord", { callbackUrl: "/dashboard" });
    } else if (status === "authenticated") {
      fetch("/api/requests/me")
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setRequests(data.data);
          }
          setLoading(false);
        });
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-white/[0.08] border-t-[#CCFF00] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-12 border-b border-white/[0.08] pb-6">
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
          <Zap className="w-4 h-4" /> New Design Request
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-display font-bold text-[#F4F4F0] mb-4">Your Projects</h2>
        {requests.length === 0 ? (
          <EmptyDashboard />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <Link key={req.id} href={`/request/${req.id}`}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#141417] border border-white/[0.08] p-6 rounded-3xl flex flex-col h-full hover:border-[#CCFF00]/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-[#6B6B72]">{req.id}</span>
                    <span
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
                        req.status === "delivered"
                          ? "bg-green-500/10 text-green-400 border-green-500/30"
                          : req.status === "paid"
                          ? "bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/30"
                          : "bg-white/5 text-[#A8A8AF] border-white/10"
                      }`}
                    >
                      {req.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#F4F4F0] mb-1">
                    {req.projectType}
                  </h3>
                  <p className="text-sm text-[#A8A8AF] line-clamp-2 flex-grow mb-6">
                    {req.brief}
                  </p>
                  <div className="flex items-center text-[#CCFF00] text-xs font-bold gap-2 mt-auto">
                    View Project Hub <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
