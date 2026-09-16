"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, CreditCard, Package, ArrowRight, Sparkles,
  AlertCircle, FileText, User, Zap, ExternalLink, Download
} from "lucide-react";
import { DesignRequest, PaymentRecord } from "../../../lib/types";

type StageKey = "pending_quote" | "quoted" | "paid" | "in_progress" | "delivered";

const STAGES: { key: StageKey | "cancelled"; label: string }[] = [
  { key: "pending_quote", label: "Brief Received" },
  { key: "quoted", label: "Quote Issued" },
  { key: "paid", label: "Deposit Paid" },
  { key: "in_progress", label: "In Production" },
  { key: "delivered", label: "Files Delivered" },
];

const STAGE_INDEX: Record<string, number> = {
  pending_quote: 0,
  quoted: 1,
  paid: 2,
  in_progress: 3,
  delivered: 4,
  cancelled: -1,
};

export default function RequestDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [request, setRequest] = useState<DesignRequest | null>(null);
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingNow, setPayingNow] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/requests/${id}`);
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Request not found.");
      } else {
        setRequest(json.data.request);
        setPayment(json.data.payment);
      }
    } catch {
      setError("Network error. Please refresh.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  useEffect(() => {
    fetchData();
    // Poll every 30s to catch webhook-driven status changes
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePayNow = async () => {
    if (!request?.fleecaPaymentLink) return;
    setPayingNow(true);
    window.location.href = request.fleecaPaymentLink;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#6A0DAD]/30 border-t-[#CCFF00] animate-spin" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-display font-bold text-[#F5F3FA] mb-2">Request Not Found</h1>
          <p className="text-sm text-[#B8AFD1] mb-6">{error || "Could not load this project request."}</p>
          <Link href="/request" className="px-6 py-3 rounded-full text-xs font-bold text-[#0F0529] bg-[#CCFF00] hover:bg-[#B8E600] transition-colors">
            Submit New Brief
          </Link>
        </div>
      </div>
    );
  }

  const currentStageIndex = STAGE_INDEX[request.status] ?? 0;
  const urgencyBadge = { standard: "Standard", priority: "Priority ⚡", rush: "Rush 🔥" }[request.urgency];

  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32 px-6 max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#160B36] border border-[#6A0DAD]/30 text-xs font-mono text-[#CCFF00] uppercase">
            Project Tracker
          </div>
          <span className="text-xs font-mono text-[#7A7099]">ID: {request.id}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-[#F5F3FA]">
          {request.businessName || request.projectType}
        </h1>
        <p className="text-sm text-[#B8AFD1] mt-1">
          For <strong className="text-[#F5F3FA]">{request.clientName}</strong> · {request.projectType}
        </p>
      </div>

      {/* Progress Track */}
      <div className="rounded-3xl bg-[#160B36] border border-[#6A0DAD]/30 p-7 mb-6">
        <h2 className="text-xs font-mono font-bold text-[#CCFF00] uppercase tracking-wider mb-6">
          Project Status
        </h2>
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-5 left-5 right-5 h-[2px] bg-[#1B0F3D]" />
          <div
            className="absolute top-5 left-5 h-[2px] bg-gradient-to-r from-[#6A0DAD] to-[#CCFF00] transition-all duration-700"
            style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
          />

          <div className="relative flex justify-between">
            {STAGES.map((stage, idx) => {
              const done = idx < currentStageIndex;
              const active = idx === currentStageIndex;
              return (
                <div key={stage.key} className="flex flex-col items-center gap-2 text-center w-16">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    done
                      ? "bg-[#CCFF00] border-[#CCFF00] shadow-glow-lime"
                      : active
                      ? "bg-[#1B0F3D] border-[#CCFF00] shadow-glow-violet animate-pulse"
                      : "bg-[#0F0529] border-[#6A0DAD]/30"
                  }`}>
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-[#0F0529]" />
                    ) : (
                      <span className={`text-xs font-bold ${active ? "text-[#CCFF00]" : "text-[#7A7099]"}`}>{idx + 1}</span>
                    )}
                  </div>
                  <span className={`text-[10px] font-mono leading-tight ${active ? "text-[#CCFF00]" : done ? "text-[#B8AFD1]" : "text-[#7A7099]"}`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Request Summary Card */}
      <div className="rounded-3xl bg-[#160B36] border border-[#6A0DAD]/30 p-7 mb-6 space-y-4">
        <h2 className="text-xs font-mono font-bold text-[#CCFF00] uppercase tracking-wider">Brief Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[#7A7099] block">Project Type</span>
            <span className="text-[#F5F3FA] font-semibold">{request.projectType}</span>
          </div>
          <div>
            <span className="text-[#7A7099] block">Budget Range</span>
            <span className="text-[#F5F3FA] font-semibold">{request.budgetRange}</span>
          </div>
          <div>
            <span className="text-[#7A7099] block">Urgency</span>
            <span className="text-[#F5F3FA] font-semibold">{urgencyBadge}</span>
          </div>
          <div>
            <span className="text-[#7A7099] block">Discord</span>
            <span className="text-[#F5F3FA] font-semibold">{request.discordTag}</span>
          </div>
          <div>
            <span className="text-[#7A7099] block">Submitted</span>
            <span className="text-[#F5F3FA] font-semibold">
              {new Date(request.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="pt-4 border-t border-white/5">
          <span className="text-[#7A7099] text-xs block mb-1">Design Brief</span>
          <p className="text-sm text-[#B8AFD1] leading-relaxed whitespace-pre-wrap">{request.brief}</p>
        </div>
      </div>

      {/* Quote & Payment Section */}
      {(request.status === "quoted" || request.status === "paid") && request.quoteAmount && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-7 mb-6 ${
            request.status === "paid"
              ? "bg-gradient-to-b from-[#122D1A] to-[#0A1F10] border-2 border-[#CCFF00]/50"
              : "bg-gradient-to-b from-[#1F0E3D] to-[#160B36] border-2 border-[#CCFF00]"
          }`}
        >
          <h2 className="text-xs font-mono font-bold text-[#CCFF00] uppercase tracking-wider mb-5">
            {request.status === "paid" ? "✅ Payment Confirmed" : "💳 Quote Ready — Action Required"}
          </h2>

          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-[#B8AFD1] mb-1">Total Project Deposit</div>
              <div className="font-display font-black text-4xl text-[#CCFF00] font-mono">
                ${request.quoteAmount.toLocaleString()}
              </div>
              <div className="text-[10px] text-[#7A7099] mt-0.5 font-mono">
                In-game GTA$ via Fleeca Bank
              </div>
            </div>
            {request.status === "paid" ? (
              <div className="w-16 h-16 rounded-full bg-[#CCFF00]/10 border-2 border-[#CCFF00] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#CCFF00]" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#6A0DAD]/20 border-2 border-[#6A0DAD] flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-[#CCFF00]" />
              </div>
            )}
          </div>

          {request.quoteNotes && (
            <div className="bg-[#0F0529]/60 rounded-xl p-4 text-xs text-[#B8AFD1] mb-4 border border-white/5">
              <div className="text-[#CCFF00] font-mono font-bold mb-1">Quote Notes</div>
              {request.quoteNotes}
            </div>
          )}

          {request.status === "quoted" && request.fleecaPaymentLink && (
            <button
              onClick={handlePayNow}
              disabled={payingNow}
              className="w-full py-4 rounded-full text-sm font-bold text-[#0F0529] bg-[#CCFF00] hover:bg-[#B8E600] disabled:opacity-70 transition-all shadow-glow-lime flex items-center justify-center gap-2"
            >
              {payingNow ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0F0529]/30 border-t-[#0F0529] rounded-full animate-spin" />
                  <span>Redirecting to Fleeca Bank...</span>
                </>
              ) : (
                <>
                  <span>Pay ${request.quoteAmount.toLocaleString()} via Fleeca Bank</span>
                  <ExternalLink className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {request.status === "paid" && (
            <div className="text-center text-xs text-[#CCFF00] font-mono">
              Your project is now in the production queue. Check back for delivery updates.
            </div>
          )}
        </motion.div>
      )}

      {/* Deliverables Section */}
      {request.status === "delivered" && request.deliverablesUrl && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-7 mb-6 bg-gradient-to-b from-[#1F0E3D] to-[#160B36] border-2 border-[#CCFF00]"
        >
          <h2 className="text-xs font-mono font-bold text-[#CCFF00] uppercase tracking-wider mb-5 flex items-center gap-2">
            <Package className="w-5 h-5" /> 📦 Final Deliverables Ready
          </h2>

          <p className="text-sm text-[#F5F3FA] mb-4">
            Your project has been completed! You can securely access and download your final source files, PNGs, and assets below.
          </p>

          {request.deliveryNotes && (
            <div className="bg-[#0F0529]/60 rounded-xl p-4 text-xs text-[#B8AFD1] mb-6 border border-white/5">
              <div className="text-[#CCFF00] font-mono font-bold mb-1 flex items-center gap-2">
                Designer Notes
              </div>
              <div className="whitespace-pre-wrap">{request.deliveryNotes}</div>
            </div>
          )}

          <a
            href={request.deliverablesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 rounded-full text-sm font-bold text-[#0F0529] bg-[#CCFF00] hover:bg-[#B8E600] transition-all shadow-glow-lime flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Project Files</span>
          </a>
        </motion.div>
      )}

      {/* Pending Quote Notice */}
      {request.status === "pending_quote" && (
        <div className="rounded-3xl bg-[#160B36] border border-[#6A0DAD]/30 p-7 mb-6 text-center">
          <Clock className="w-10 h-10 text-[#CCFF00] mx-auto mb-3" />
          <h3 className="text-lg font-display font-bold text-[#F5F3FA] mb-2">
            Brief received — quote incoming
          </h3>
          <p className="text-sm text-[#B8AFD1]">
            Our art directors are reviewing your brief. You will receive a quote on this page and
            via Discord within 12 hours.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/work"
          className="flex-1 py-3 rounded-full text-xs text-[#B8AFD1] hover:text-white bg-[#160B36] hover:bg-[#1B0F3D] border border-[#6A0DAD]/30 text-center transition-colors"
        >
          View Portfolio
        </Link>
        <Link
          href="/request"
          className="flex-1 py-3 rounded-full text-xs text-[#B8AFD1] hover:text-white bg-[#160B36] hover:bg-[#1B0F3D] border border-[#6A0DAD]/30 text-center transition-colors"
        >
          New Request
        </Link>
      </div>
    </div>
  );
}
