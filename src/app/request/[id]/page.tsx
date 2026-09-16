"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, CreditCard, Package, ArrowRight, Sparkles,
  AlertCircle, FileText, User, Zap, ExternalLink, Download, Send,
  Paperclip, Loader2, Star, ShieldCheck, MessageSquare, Landmark,
  PartyPopper, LogIn
} from "lucide-react";
import { DesignRequest, PaymentRecord, ChatMessage } from "../../../lib/types";

type StageKey = "brief" | "deposit" | "production" | "review" | "done";

const STAGES: { key: StageKey; label: string }[] = [
  { key: "brief", label: "Brief Received" },
  { key: "deposit", label: "Deposit Paid" },
  { key: "production", label: "In Production" },
  { key: "review", label: "Ready for Review" },
  { key: "done", label: "Completed" },
];

const STAGE_INDEX: Record<string, number> = {
  pending_quote: 0,
  awaiting_deposit: 0,
  quoted: 0,
  paid: 1,
  in_progress: 2,
  ready_for_review: 3,
  delivered: 3,
  completed: 4,
  cancelled: -1,
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const isImageName = (name: string) => /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(name);

const StarPicker: React.FC<{ value: number; onChange: (n: number) => void }> = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onChange(i + 1)}
        aria-label={`${i + 1} star${i ? "s" : ""}`}
        className={`transition-colors duration-200 ${i < value ? "text-[#CCFF00]" : "text-white/[0.15] hover:text-white/[0.3]"}`}
      >
        <Star className="w-5 h-5 fill-current" />
      </button>
    ))}
    <span className="font-mono text-[10px] text-[#6B6B72] ml-2">{value ? value.toFixed(1) : "Select"}</span>
  </div>
);

const AttachmentView: React.FC<{ url: string; name: string }> = ({ url, name }) =>
  isImageName(name) ? (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <img src={url} alt={name} className="max-w-[260px] max-h-52 rounded-lg border border-white/10 my-1.5 block" />
    </a>
  ) : (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-xs text-[#CCFF00] hover:underline my-1.5"
    >
      <Download className="w-3.5 h-3.5" />
      {name}
    </a>
  );

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: session, status: sessionStatus } = useSession();

  const [request, setRequest] = useState<DesignRequest | null>(null);
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingAttach, setPendingAttach] = useState<{ name: string; url: string } | null>(null);
  const [sendError, setSendError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState("");

  const [review, setReview] = useState<{ name: string; business: string; rating: number; content: string }>({
    name: "",
    business: "",
    rating: 0,
    content: "",
  });
  const [reviewState, setReviewState] = useState<"idle" | "submitting" | "done" | "error">("idle");

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/requests/${id}`);
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Request not found.");
      } else {
        setRequest(json.data.request);
        setPayment(json.data.payment ?? null);
      }
    } catch {
      setError("Network error. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [request?.messages?.length, pendingAttach]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setSendError("Max 4 MB per attachment.");
      return;
    }
    setUploading(true);
    setSendError("");
    try {
      const data = await fileToBase64(file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, data }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data) {
        setSendError(json?.error || "Upload failed.");
      } else {
        setPendingAttach({ name: json.data.fileName, url: json.data.url });
      }
    } catch {
      setSendError("Upload failed. Try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const sendMessage = async () => {
    const text = draft.trim();
    if ((!text && !pendingAttach) || sending) return;
    setSending(true);
    setSendError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: id,
          content: text,
          attachmentUrl: pendingAttach?.url,
          attachmentName: pendingAttach?.name,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data) {
        setSendError(json?.error || "Failed to send message.");
      } else {
        setRequest((prev) =>
          prev ? { ...prev, messages: [...(prev.messages ?? []), json.data as ChatMessage] } : prev
        );
        setDraft("");
        setPendingAttach(null);
      }
    } catch {
      setSendError("Network error while sending.");
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    setAcceptError("");
    try {
      const res = await fetch(`/api/requests/${id}/accept`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json?.data?.balancePaymentLink) {
        setAcceptError(json?.error || "Could not prepare acceptance.");
      } else {
        window.location.href = json.data.balancePaymentLink;
      }
    } catch {
      setAcceptError("Network error. Try again.");
    } finally {
      setAccepting(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewState("submitting");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterName: review.name || request?.clientName,
          businessName: review.business,
          content: review.content,
          projectDelivered: request?.packageName || request?.projectType,
          rating: review.rating,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data) {
        setReviewState("error");
      } else {
        setReviewState("done");
      }
    } catch {
      setReviewState("error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-white/[0.08] border-t-[#CCFF00] animate-spin" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-display font-bold text-[#F4F4F0] mb-2">Request Not Found</h1>
          <p className="text-sm text-[#A8A8AF] mb-6">{error || "Could not load this project request."}</p>
          <Link href="/request" className="px-6 py-3 rounded-full text-xs font-bold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] transition-colors">
            Submit New Brief
          </Link>
        </div>
      </div>
    );
  }

  const currentStageIndex = STAGE_INDEX[request.status] ?? 0;
  const urgencyBadge = { standard: "Standard", priority: "Priority ⚡", rush: "Rush 🔥" }[request.urgency];
  const messages = request.messages ?? [];
  const signedIn = sessionStatus === "authenticated";
  const balanceDue = request.balanceAmount ?? 0;
  const canPayDeposit = request.status === "awaiting_deposit" && request.depositPaymentLink;

  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32 px-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141417] border border-white/[0.08] text-xs font-mono text-[#CCFF00] uppercase">
            Project Room
          </div>
          <span className="text-xs font-mono text-[#6B6B72]">ID: {request.id}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-[#F4F4F0]">
          {request.businessName || request.projectType}
        </h1>
        <p className="text-sm text-[#A8A8AF] mt-1">
          For <strong className="text-[#F4F4F0]">{request.clientName}</strong> · {request.projectType}
          {request.packageName ? <span className="text-[#CCFF00]"> · {request.packageName}</span> : null}
        </p>
      </div>

      {/* Progress Track */}
      <div className="rounded-3xl bg-[#141417] border border-white/[0.08] p-7 mb-6">
        <h2 className="text-xs font-mono font-bold text-[#CCFF00] uppercase tracking-wider mb-6">
          Project Status
        </h2>
        <div className="relative">
          <div className="absolute top-5 left-5 right-5 h-[2px] bg-[#1B1B20]" />
          <div
            className="absolute top-5 left-5 h-[2px] bg-gradient-to-r from-[#CCFF00]/60 to-[#CCFF00] transition-all duration-700"
            style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
          />
          <div className="relative flex justify-between">
            {STAGES.map((stage, idx) => {
              const done = idx < currentStageIndex;
              const active = idx === currentStageIndex;
              return (
                <div key={stage.key} className="flex flex-col items-center gap-2 text-center w-14 sm:w-20">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    done
                      ? "bg-[#CCFF00] border-[#CCFF00] shadow-glow-lime"
                      : active
                      ? "bg-[#1B1B20] border-[#CCFF00] shadow-glow-violet animate-pulse"
                      : "bg-[#0B0B0D] border-white/[0.08]"
                  }`}>
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-[#0B0B0D]" />
                    ) : (
                      <span className={`text-xs font-bold ${active ? "text-[#CCFF00]" : "text-[#6B6B72]"}`}>{idx + 1}</span>
                    )}
                  </div>
                  <span className={`text-[9px] sm:text-[10px] font-mono leading-tight text-center ${active ? "text-[#CCFF00]" : done ? "text-[#A8A8AF]" : "text-[#6B6B72]"}`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deposit due */}
      {request.status === "awaiting_deposit" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-7 mb-6 bg-gradient-to-b from-[#1E1E24] to-[#141417] border-2 border-[#CCFF00]"
        >
          <h2 className="text-xs font-mono font-bold text-[#CCFF00] uppercase tracking-wider mb-5">
            💳 50% Deposit Required to Start
          </h2>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs text-[#A8A8AF] mb-1">Total project ({request.packageName || "Custom"})</div>
              <div className="font-display font-black text-2xl text-[#F4F4F0]">
                ${(request.totalAmount ?? 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-[#6B6B72] mt-0.5 font-mono">
                {request.budgetRange}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#A8A8AF] mb-1">Pay now (50%)</div>
              <div className="font-display font-black text-3xl text-[#CCFF00]">
                ${(request.depositAmount ?? 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-[#6B6B72] mt-0.5 font-mono">in-game GTA$ via Fleeca</div>
            </div>
          </div>
          {canPayDeposit ? (
            <a
              href={request.depositPaymentLink}
              className="w-full py-4 rounded-full text-sm font-bold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] transition-all shadow-glow-lime flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Pay ${(request.depositAmount ?? 0).toLocaleString()} Deposit Now
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-400/30 rounded-xl p-3">
              Payment link is being prepared — refresh in a moment or contact us on Discord.
            </p>
          )}
          <p className="text-[11px] text-[#A8A8AF] mt-3">
            Your project room opens immediately once the deposit clears. The remaining{" "}
            <strong className="text-[#CCFF00]">${balanceDue.toLocaleString()}</strong> is due only when you accept the finished work.
          </p>
        </motion.div>
      )}

      {/* Manual quote (custom briefs) */}
      {(request.status === "quoted") && request.quoteAmount && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-7 mb-6 bg-gradient-to-b from-[#1E1E24] to-[#141417] border-2 border-[#CCFF00]"
        >
          <h2 className="text-xs font-mono font-bold text-[#CCFF00] uppercase tracking-wider mb-5">
            💳 Quote Ready — Action Required
          </h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-[#A8A8AF] mb-1">Total Project Deposit</div>
              <div className="font-display font-black text-4xl text-[#CCFF00] font-mono">
                ${request.quoteAmount.toLocaleString()}
              </div>
              <div className="text-[10px] text-[#6B6B72] mt-0.5 font-mono">In-game GTA$ via Fleeca Bank</div>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/[0.04] border-2 border-white/20 flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-[#CCFF00]" />
            </div>
          </div>
          {request.quoteNotes && (
            <div className="bg-[#0B0B0D]/60 rounded-xl p-4 text-xs text-[#A8A8AF] mb-4 border border-white/5">
              <div className="text-[#CCFF00] font-mono font-bold mb-1">Quote Notes</div>
              {request.quoteNotes}
            </div>
          )}
          {request.fleecaPaymentLink && (
            <button
              onClick={() => (window.location.href = request.fleecaPaymentLink!)}
              className="w-full py-4 rounded-full text-sm font-bold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] transition-all shadow-glow-lime flex items-center justify-center gap-2"
            >
              Pay ${request.quoteAmount.toLocaleString()} via Fleeca Bank
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      {/* Ready for review */}
      {request.status === "ready_for_review" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-7 mb-6 bg-gradient-to-b from-[#1E1E24] to-[#141417] border-2 border-[#CCFF00]"
        >
          <h2 className="text-xs font-mono font-bold text-[#CCFF00] uppercase tracking-wider mb-5">
            🎁 Ready for Your Review
          </h2>
          <p className="text-sm text-[#F4F4F0] mb-4">
            Final files are awaiting you. When you are happy, accept the order to release the remaining balance
            and mark the project complete
          </p>
          {request.deliveryNotes && (
            <div className="bg-[#0B0B0D]/60 rounded-xl p-4 text-xs text-[#A8A8AF] mb-5 border border-white/5">
              <div className="text-[#CCFF00] font-mono font-bold mb-1">Designer Notes</div>
              <div className="whitespace-pre-wrap">{request.deliveryNotes}</div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            {request.deliverablesUrl && (
              <a
                href={request.deliverablesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-4 rounded-full text-sm font-bold text-[#F4F4F0] bg-white/[0.06] border border-white/10 hover:border-[#CCFF00]/50 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-[#CCFF00]" />
                Review Files
              </a>
            )}
            <button
              onClick={handleAccept}
              disabled={accepting || !signedIn}
              className="flex-1 py-4 rounded-full text-sm font-bold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] transition-all shadow-glow-lime flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {accepting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Preparing…</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Accept &amp; Pay Balance ${balanceDue.toLocaleString()}
                </>
              )}
            </button>
          </div>
          {!signedIn && (
            <button
              onClick={() => signIn("discord", { callbackUrl: `/request/${id}` })}
              className="w-full gap-2 inline-flex items-center justify-center text-xs text-amber-300"
            >
              <LogIn className="w-3.5 h-3.5" /> Sign in with Discord to accept the order
            </button>
          )}
          {acceptError && <p className="text-xs text-red-400">{acceptError}</p>}
        </motion.div>
      )}

      {/* Completed */}
      {request.status === "completed" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-7 mb-6 bg-gradient-to-b from-[#122D1A] to-[#0A1F10] border-2 border-[#CCFF00]/50"
        >
          <div className="flex items-center gap-3 mb-3">
            <PartyPopper className="w-6 h-6 text-[#CCFF00]" />
            <h2 className="text-lg font-display font-bold text-[#F4F4F0]">Order complete — thank you!</h2>
          </div>
          <p className="text-sm text-[#A8A8AF] mb-5">
            Your project with SAUVAGE is finished and accepted. Files below, whenever you need them.
          </p>
          {request.deliverablesUrl && (
            <a
              href={request.deliverablesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-full text-sm font-bold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Project Files
            </a>
          )}
        </motion.div>
      )}

      {/* Review */}
      {request.status === "completed" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-[#141417] border border-white/[0.08] p-7 mb-6"
        >
          <h2 className="text-xs font-mono font-bold text-[#CCFF00] uppercase tracking-wider mb-1">
            Leave a Review
          </h2>
          <p className="text-sm text-[#A8A8AF] mb-5">
            How was working with SAUVAGE? Your review appears on the homepage so other players can find us.
          </p>
          {reviewState === "done" ? (
            <div className="flex items-center gap-3 text-sm text-[#CCFF00]">
              <CheckCircle2 className="w-5 h-5" /> Review submitted — thank you for commissioning SAUVAGE.
            </div>
          ) : (
            <form onSubmit={submitReview} className="space-y-4">
              <StarPicker value={review.rating} onChange={(n) => setReview((r) => ({ ...r, rating: n }))} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  value={review.name}
                  onChange={(e) => setReview((r) => ({ ...r, name: e.target.value }))}
                  placeholder={request.clientName}
                  className="bg-[#0B0B0D] border border-white/10 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F4F4F0] placeholder-[#6B6B72] outline-none transition-colors"
                />
                <input
                  value={review.business}
                  onChange={(e) => setReview((r) => ({ ...r, business: e.target.value }))}
                  placeholder={request.businessName || "Business name"}
                  className="bg-[#0B0B0D] border border-white/10 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F4F4F0] placeholder-[#6B6B72] outline-none transition-colors"
                />
              </div>
              <textarea
                value={review.content}
                onChange={(e) => setReview((r) => ({ ...r, content: e.target.value }))}
                rows={3}
                placeholder="Your experience, quality of work, turnaround…"
                className="w-full bg-[#0B0B0D] border border-white/10 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F4F4F0] placeholder-[#6B6B72] outline-none transition-colors resize-none"
              />
              {reviewState === "error" && <p className="text-xs text-red-400">Could not submit review. Please try again.</p>}
              <button
                type="submit"
                disabled={reviewState === "submitting" || review.rating < 1 || review.content.trim().length < 10}
                className="w-full py-3.5 rounded-full text-sm font-bold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              >
                {reviewState === "submitting" ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Sparkles className="w-4 h-4" /> Submit Review</>}
              </button>
            </form>
          )}
        </motion.div>
      )}

      {/* Pending quote notice */}
      {request.status === "pending_quote" && (
        <div className="rounded-3xl bg-[#141417] border border-white/[0.08] p-7 mb-6 text-center">
          <Clock className="w-10 h-10 text-[#CCFF00] mx-auto mb-3" />
          <h3 className="text-lg font-display font-bold text-[#F4F4F0] mb-2">
            Brief received — quote incoming
          </h3>
          <p className="text-sm text-[#A8A8AF]">
            Our art directors are reviewing your custom brief. You will receive a quote here and via Discord within 12 hours.
          </p>
        </div>
      )}

      {/* Request Summary */}
      <div className="rounded-3xl bg-[#141417] border border-white/[0.08] p-7 mb-6">
        <h2 className="text-xs font-mono font-bold text-[#CCFF00] uppercase tracking-wider mb-4">Brief Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs mb-4">
          <div>
            <span className="text-[#6B6B72] block">Project Type</span>
            <span className="text-[#F4F4F0] font-semibold">{request.projectType}</span>
          </div>
          <div>
            <span className="text-[#6B6B72] block">Pricing</span>
            <span className="text-[#F4F4F0] font-semibold">{request.budgetRange}</span>
          </div>
          <div>
            <span className="text-[#6B6B72] block">Urgency</span>
            <span className="text-[#F4F4F0] font-semibold">{urgencyBadge}</span>
          </div>
          <div>
            <span className="text-[#6B6B72] block">Discord</span>
            <span className="text-[#F4F4F0] font-semibold">{request.discordTag}</span>
          </div>
          <div>
            <span className="text-[#6B6B72] block">Submitted</span>
            <span className="text-[#F4F4F0] font-semibold">{new Date(request.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="pt-4 border-t border-white/5">
          <span className="text-[#6B6B72] text-xs block mb-1">Design Brief</span>
          <p className="text-sm text-[#A8A8AF] leading-relaxed whitespace-pre-wrap">{request.brief}</p>
        </div>
      </div>

      {/* Chat */}
      <div className="rounded-3xl bg-[#141417] border border-white/[0.08] p-7 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs font-mono font-bold text-[#CCFF00] uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Project Chat
          </h2>
          <span className="text-[10px] font-mono text-[#6B6B72]">{messages.length} message{messages.length === 1 ? "" : "s"}</span>
        </div>
        <p className="text-xs text-[#A8A8AF] mb-5">
          Revisions, references, and questions — keep everything in one place with your designer.
        </p>

        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 mb-5">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-sm text-[#6B6B72]">
              No messages yet{request.status !== "awaiting_deposit" ? " — say hello to your designer" : " — once your deposit clears you can message the designer here"}.
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.authorRole === "system" ? "justify-center" : ""}`}
              >
                {msg.authorRole === "system" ? (
                  <div className="max-w-xl text-center text-xs text-[#A8A8AF] bg-[#0B0B0D] border border-white/[0.06] rounded-xl px-4 py-2.5">
                    {msg.content}
                  </div>
                ) : (
                  <div className={`max-w-[85%] ${msg.authorRole === "designer" ? "ml-auto" : ""}`}>
                    <div className="text-[10px] font-mono text-[#6B6B72] mb-1 flex items-center gap-1.5">
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[8px] font-bold ${
                        msg.authorRole === "designer" ? "border-[#CCFF00]/50 text-[#CCFF00]" : "border-white/20 text-[#A8A8AF]"
                      }`}>
                        {msg.authorRole === "designer" ? "D" : initials(msg.author) || "?"}
                      </span>
                      <span>{msg.author}</span>
                      {msg.authorRole === "designer" && <span className="text-[#CCFF00]">· SAUVAGE</span>}
                      <span className="ml-auto text-[9px]">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.authorRole === "designer"
                        ? "bg-[#CCFF00]/[0.08] border border-[#CCFF00]/25 text-[#F4F4F0]"
                        : "bg-[#0B0B0D] border border-white/[0.08] text-[#F4F4F0]"
                    }`}>
                      {msg.attachmentUrl && msg.attachmentName && (
                        <AttachmentView url={msg.attachmentUrl} name={msg.attachmentName} />
                      )}
                      {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="border-t border-white/[0.06] pt-4">
          {!signedIn ? (
            <button
              onClick={() => signIn("discord", { callbackUrl: `/request/${id}` })}
              className="w-full py-3.5 rounded-full text-sm font-bold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Sign in with Discord to join the chat
            </button>
          ) : (
            <>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={2}
                placeholder="Message your designer… (Enter to send, Shift+Enter for new line)"
                className="w-full bg-[#0B0B0D] border border-white/10 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F4F4F0] placeholder-[#6B6B72] outline-none transition-colors resize-none mb-3"
              />
              {pendingAttach && (
                <div className="flex items-center gap-2 text-xs text-[#A8A8AF] bg-[#0B0B0D] border border-white/[0.08] rounded-lg px-3 py-2 mb-3">
                  <Paperclip className="w-3.5 h-3.5 text-[#CCFF00]" />
                  {pendingAttach.name}
                  <button
                    type="button"
                    onClick={() => setPendingAttach(null)}
                    className="ml-auto text-[#6B6B72] hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || sending}
                  className="px-4 py-3 rounded-xl border border-white/10 bg-[#0B0B0D] text-[#A8A8AF] hover:text-[#CCFF00] hover:border-[#CCFF00]/40 disabled:opacity-50 transition-colors flex items-center gap-2 text-xs"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                  Upload
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.svg,.zip"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || (!draft.trim() && !pendingAttach)}
                  className="flex-1 py-3.5 rounded-xl text-sm font-bold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send
                </button>
              </div>
              {sendError && <p className="text-xs text-red-400 mt-2">{sendError}</p>}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="flex-1 py-3 rounded-full text-xs text-[#A8A8AF] hover:text-white bg-[#141417] hover:bg-[#1B1B20] border border-white/[0.08] text-center transition-colors"
        >
          My Projects
        </Link>
        <Link
          href="/request"
          className="flex-1 py-3 rounded-full text-xs text-[#A8A8AF] hover:text-white bg-[#141417] hover:bg-[#1B1B20] border border-white/[0.08] text-center transition-colors"
        >
          New Request
        </Link>
      </div>
    </div>
  );
}