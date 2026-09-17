"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, RefreshCw, DollarSign, ClipboardList, CreditCard,
  CheckCircle2, Clock, Package, Zap, X, ArrowRight, AlertTriangle, LogOut, Trash2, Upload, Copy
} from "lucide-react";
import { DesignRequest, PaymentRecord } from "../../lib/types";
import { AdminPageSkeleton } from "../../components/Skeleton";
import { EmptyAdminDashboard } from "../../components/EmptyState";
import { toast } from "react-hot-toast";

const STATUS_COLORS: Record<string, string> = {
  pending_quote: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  quoted: "bg-blue-400/10 text-blue-300 border-blue-400/30",
  awaiting_deposit: "bg-blue-400/10 text-blue-300 border-blue-400/30",
  paid: "bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/30",
  in_progress: "bg-purple-400/10 text-purple-300 border-purple-400/30",
  ready_for_review: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  delivered: "bg-green-400/10 text-green-300 border-green-400/30",
  completed: "bg-green-400/10 text-green-300 border-green-400/30",
  cancelled: "bg-red-400/10 text-red-300 border-red-400/30",
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = Boolean(session?.user?.isAdmin);

  const [requests, setRequests] = useState<DesignRequest[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<{ account_name: string; balance: number; mode?: number } | null>(null);

  // Quote modal state
  const [quotingReq, setQuotingReq] = useState<DesignRequest | null>(null);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [quoting, setQuoting] = useState(false);
  const [quoteMsg, setQuoteMsg] = useState("");

  // Delivery modal state
  const [deliveryReq, setDeliveryReq] = useState<DesignRequest | null>(null);
  const [deliverablesUrl, setDeliverablesUrl] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [delivering, setDelivering] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqRes, balRes, payRes] = await Promise.all([
        fetch("/api/requests"),
        fetch("/api/fleeca/balance"),
        fetch("/api/payments"),
      ]);
      const reqJson = await reqRes.json();
      const balJson = await balRes.json();
      const payJson = await payRes.json();
      if (reqJson.success) setRequests(reqJson.data);
      if (balJson.success) setBalance(balJson.data);
      if (payJson.success) setPayments(payJson.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin) {
      signIn("discord", { callbackUrl: "/admin" });
      return;
    }
    loadData();
    // Auto-sync every 15 seconds to keep admin panel perfectly synced with webhooks and new requests
    const sync = () => {
      // Fetch silently without setting loading state to avoid UI flicker
      Promise.all([
        fetch("/api/requests"),
        fetch("/api/fleeca/balance"),
        fetch("/api/payments"),
      ]).then(async ([reqRes, balRes, payRes]) => {
        const reqJson = await reqRes.json();
        const balJson = await balRes.json();
        const payJson = await payRes.json();
        if (reqJson.success) setRequests(reqJson.data);
        if (balJson.success) setBalance(balJson.data);
        if (payJson.success) setPayments(payJson.data);
      }).catch(() => {});
    };
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") sync();
    }, 15000);
    return () => clearInterval(interval);
  }, [isAdmin, status]);

  const handleIssueQuote = async () => {
    if (!quotingReq || !quoteAmount) return;
    const amount = parseInt(quoteAmount.replace(/[^0-9]/g, ""), 10);
    if (isNaN(amount) || amount < 1) {
      setQuoteMsg("Please enter a valid amount.");
      return;
    }

    setQuoting(true);
    setQuoteMsg("");

    try {
      // 1. Create Fleeca payment link
      const payRes = await fetch("/api/fleeca/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: quotingReq.id,
          amount,
          description: `Design Deposit - Request #${quotingReq.id} (${quotingReq.projectType})`,
        }),
      });
      const payJson = await payRes.json();
      if (!payJson.success) {
        setQuoteMsg(`Payment creation failed: ${payJson.error}`);
        setQuoting(false);
        return;
      }

      // 2. Update request with quote
      await fetch(`/api/requests/${quotingReq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "quoted",
          quoteAmount: amount,
          quoteNotes: quoteNotes || undefined,
          fleecaPaymentId: payJson.payment_id,
          fleecaPaymentLink: payJson.payment_link,
        }),
      });

      setQuoteMsg(`✅ Quote issued! Fleeca link created. ${payJson.isSimulated ? "(Sandbox mode)" : ""}`);
      setQuotingReq(null);
      setQuoteAmount("");
      setQuoteNotes("");
      loadData();
    } catch {
      setQuoteMsg("Error. Please try again.");
    } finally {
      setQuoting(false);
    }
  };

  const handleIssueDelivery = async () => {
    if (!deliveryReq || !deliverablesUrl) return;
    setDelivering(true);
    
    try {
      await fetch(`/api/requests/${deliveryReq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: deliveryReq.flow === "instant" ? "ready_for_review" : "delivered",
          deliverablesUrl,
          deliveryNotes: deliveryNotes || undefined,
        }),
      });
      setDeliveryReq(null);
      setDeliverablesUrl("");
      setDeliveryNotes("");
      loadData();
    } catch {
      alert("Delivery error");
    } finally {
      setDelivering(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadData();
  };

  const deleteRequest = async (id: string) => {
    if (!confirm(`Delete ${id} and all of its payments? This cannot be undone.`)) return;
    await fetch(`/api/requests/${id}`, { method: "DELETE" });
    loadData();
  };

  const deletePayment = async (paymentId: string) => {
    if (!confirm(`Delete transaction ${paymentId}? This cannot be undone.`)) return;
    await fetch(`/api/payments/${paymentId}`, { method: "DELETE" });
    loadData();
  };

  // Stats
  const total = requests.length;
  const pending = requests.filter((r) => r.status === "pending_quote").length;
  const paidStatuses = ["paid", "in_progress", "ready_for_review", "delivered", "completed"];
  const paid = requests.filter((r) => paidStatuses.includes(r.status)).length;
  const totalEarned = requests
    .filter((r) => paidStatuses.includes(r.status))
    .reduce((sum, r) => sum + (r.depositAmount ?? r.quoteAmount ?? 0), 0);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-white/[0.08] border-t-[#CCFF00] animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#1B1B20] border border-white/10 flex items-center justify-center text-[#CCFF00] mx-auto mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-display font-black text-[#F4F4F0]">Admin Portal</h1>
            <p className="text-xs text-[#A8A8AF] mt-1">SAUVAGE™ — Internal Access</p>
            <p className="text-sm text-[#A8A8AF] mt-4">
              You must be an authorized administrator to view this page.
            </p>
          </div>
          <button
            onClick={() => signIn("discord", { callbackUrl: "/admin" })}
            className="w-full py-3.5 rounded-full text-xs font-bold text-[#0B0B0D] bg-[#5865F2] hover:bg-[#4752C4] transition-colors flex items-center justify-center gap-3"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sign in with Discord</span>
          </button>
        </div>
      </div>
    );
  }

  if (loading && requests.length === 0) {
    return <AdminPageSkeleton />;
  }

  return (
    <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-[#CCFF00]" />
            <span className="text-xs font-mono text-[#CCFF00] uppercase font-bold">Admin Portal</span>
          </div>
<h1 className="text-2xl sm:text-3xl font-display font-black text-[#F4F4F0]">
        SAUVAGE™ Dashboard
      </h1>
    </div>
    <div className="flex items-center gap-3">
      <Link
        href="/admin/portfolio"
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#141417] border border-white/10 hover:border-[#CCFF00]/40 text-xs text-[#A8A8AF] hover:text-[#F4F4F0] transition-all"
      >
        <Package className="w-4 h-4" />
        <span>Portfolio</span>
      </Link>
      <button
        onClick={loadData}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#141417] border border-white/10 hover:border-[#CCFF00]/40 text-xs text-[#A8A8AF] hover:text-[#F4F4F0] transition-all"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        <span>Sync</span>
      </button>
      <button
        onClick={() => signOut({ callbackUrl: "/admin" })}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#141417] border border-white/10 hover:border-red-500/40 text-xs text-[#A8A8AF] hover:text-red-300 transition-all"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </button>
    </div>
  </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Briefs", value: total, Icon: ClipboardList, color: "text-[#CCFF00]" },
          { label: "Pending Quote", value: pending, Icon: Clock, color: "text-amber-300" },
          { label: "Paid Projects", value: paid, Icon: CheckCircle2, color: "text-green-300" },
          { label: "Total Earned", value: `$${totalEarned.toLocaleString()}`, Icon: DollarSign, color: "text-[#CCFF00]" },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="rounded-2xl bg-[#141417] border border-white/[0.08] p-5 flex flex-col gap-2">
            <Icon className={`w-5 h-5 ${color}`} />
            <div className={`font-display font-black text-2xl ${color} font-mono`}>{value}</div>
            <div className="text-xs text-[#A8A8AF]">{label}</div>
          </div>
        ))}
      </div>

      {/* Merchant Balance */}
      {balance && (
        <div className="rounded-2xl bg-gradient-to-r from-[#1B1B20] to-[#141417] border border-white/10 p-5 mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs font-mono text-[#A8A8AF] uppercase mb-1">Fleeca Merchant Balance</div>
            <div className="font-display font-black text-3xl text-[#CCFF00] font-mono">
              ${balance.balance.toLocaleString()}
            </div>
            <div className="text-xs text-[#6B6B72] mt-0.5">{balance.account_name}</div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#CCFF00] font-mono bg-[#0B0B0D] px-4 py-2 rounded-full border border-white/[0.08]">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
            <span>{balance.mode === 1 ? "LIVE MODE" : "SANDBOX MODE"}</span>
          </div>
        </div>
      )}

      {/* Requests Table */}
      <div className="rounded-3xl bg-[#141417] border border-white/[0.08] overflow-hidden mb-8">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-mono font-bold text-[#CCFF00] uppercase tracking-wider">
            Design Requests
          </h2>
          <span className="text-xs text-[#6B6B72] font-mono">{requests.length} total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {["ID", "Client", "Project Type", "Urgency", "Status", "Quote", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-mono text-[#6B6B72] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-white/5 hover:bg-white/2 transition-colors group">
                  <td className="px-5 py-4 font-mono text-[#CCFF00] flex items-center gap-1.5">
                    {req.id}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(req.id);
                        toast.success("Copied ID");
                      }}
                      className="p-1 text-[#6B6B72] hover:text-[#CCFF00] transition-colors opacity-0 group-hover:opacity-100"
                      title="Copy ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-[#F4F4F0] font-semibold">{req.clientName}</div>
                    <div className="text-[#6B6B72] text-[10px]">{req.discordTag}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-[#A8A8AF]">{req.projectType}</div>
                    {req.attachments && req.attachments.length > 0 && (
                      <div className="mt-1.5 flex flex-col gap-0.5 max-w-[200px]">
                        {req.attachments.slice(0, 5).map((a, i) =>
                          a.url ? (
                            <a
                              key={i}
                              href={a.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-mono text-[#CCFF00]/80 hover:text-[#CCFF00] underline decoration-dotted truncate"
                              title={a.name}
                            >
                              📎 {a.name}
                            </a>
                          ) : (
                            <span key={i} className="text-[10px] font-mono text-[#6B6B72] truncate" title={a.name}>
                              📎 {a.name}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-mono px-2 py-0.5 rounded-full text-[10px] border ${
                      req.urgency === "rush"
                        ? "bg-red-500/10 text-red-300 border-red-500/30"
                        : req.urgency === "priority"
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        : "bg-[#141417] text-[#A8A8AF] border-white/[0.08]"
                    }`}>
                      {req.urgency}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-mono px-2 py-0.5 rounded-full text-[10px] border ${STATUS_COLORS[req.status] || "bg-white/5 text-white border-white/10"}`}>
                      {req.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[#CCFF00]">
                    {req.quoteAmount ? `$${req.quoteAmount.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {req.status === "pending_quote" && (
                        <button
                          onClick={() => { setQuotingReq(req); setQuoteMsg(""); }}
                          className="px-3 py-1.5 rounded-full text-[10px] font-bold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] transition-colors"
                        >
                          Issue Quote
                        </button>
                      )}
                      {req.status === "awaiting_deposit" && req.depositPaymentLink && (
                        <a
                          href={req.depositPaymentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-full text-[10px] font-bold text-blue-900 bg-blue-300 hover:bg-blue-200 transition-colors"
                        >
                          Deposit Link
                        </a>
                      )}
                      {req.status === "paid" && (
                        <button
                          onClick={() => updateStatus(req.id, "in_progress")}
                          className="px-3 py-1.5 rounded-full text-[10px] font-bold text-purple-900 bg-purple-300 hover:bg-purple-200 transition-colors"
                        >
                          Mark In Progress
                        </button>
                      )}
                      {req.status === "in_progress" && (
                        <button
                          onClick={() => { setDeliveryReq(req); setDeliverablesUrl(""); }}
                          className="px-3 py-1.5 rounded-full text-[10px] font-bold text-green-900 bg-green-300 hover:bg-green-200 transition-colors"
                        >
                          Deliver Files
                        </button>
                      )}
                      <Link
                        href={`/request/${req.id}`}
                        className="text-[#A8A8AF] hover:text-[#CCFF00] transition-colors"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      {req.status !== "cancelled" && req.status !== "completed" && (
                        <button
                          onClick={() => {
                            if (confirm(`Cancel project ${req.id}? This cannot be undone.`)) {
                              updateStatus(req.id, "cancelled");
                            }
                          }}
                          className="text-[#6B6B72] hover:text-red-300 transition-colors"
                          title="Cancel project"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteRequest(req.id)}
                        className="text-[#6B6B72] hover:text-red-400 transition-colors"
                        title="Delete request"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {req.status === "completed" && (
                        <Link
                          href={`/admin/portfolio?from=${req.id}`}
                          className="text-[#6B6B72] hover:text-[#CCFF00] transition-colors"
                          title="Publish to portfolio"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {requests.length === 0 && <EmptyAdminDashboard />}
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="rounded-3xl bg-[#141417] border border-white/[0.08] overflow-hidden mb-8">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#CCFF00]" />
            <h2 className="text-sm font-mono font-bold text-[#CCFF00] uppercase tracking-wider">
              Fleeca Transactions Ledger
            </h2>
          </div>
          <span className="text-xs text-[#6B6B72] font-mono">{payments.length} total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {["Transaction ID", "Routing #", "Payer Name", "Amount", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-mono text-[#6B6B72] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((pay) => (
                <tr key={pay.paymentId} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4 font-mono text-[#F4F4F0]">{pay.paymentId}</td>
                  <td className="px-5 py-4 font-mono text-[#A8A8AF]">{pay.payerRouting || "—"}</td>
                  <td className="px-5 py-4 text-[#A8A8AF]">{pay.payerName || "—"}</td>
                  <td className="px-5 py-4 font-mono text-[#CCFF00] font-bold">
                    +${pay.amount.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-mono px-2 py-0.5 rounded-full text-[10px] border ${
                      pay.status === "payment_successful"
                        ? "bg-green-500/10 text-green-300 border-green-500/30"
                        : pay.status === "payment_failed"
                        ? "bg-red-500/10 text-red-300 border-red-500/30"
                        : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                    }`}>
                      {pay.status.replace("payment_", "").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#6B6B72] font-mono">
                    {new Date(pay.paidAt || pay.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => deletePayment(pay.paymentId)}
                      className="text-[#6B6B72] hover:text-red-400 transition-colors"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {payments.length === 0 && (
            <div className="py-12 text-center text-xs text-[#6B6B72]">
              No transactions recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Quote Modal */}
      <AnimatePresence>
        {quotingReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuotingReq(null)}
              className="absolute inset-0 bg-[#0B0B0D]/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md bg-[#1B1B20] border border-white/20 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-display font-bold text-[#F4F4F0]">Issue Quote</h2>
                <button
                  onClick={() => setQuotingReq(null)}
                  className="w-8 h-8 rounded-full bg-[#0B0B0D] flex items-center justify-center text-[#A8A8AF] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-[#A8A8AF] bg-[#0B0B0D]/60 rounded-xl p-4 mb-6 space-y-1">
                <div><span className="text-[#6B6B72]">Request:</span> <strong className="text-[#CCFF00]">{quotingReq.id}</strong></div>
                <div><span className="text-[#6B6B72]">Client:</span> <strong className="text-[#F4F4F0]">{quotingReq.clientName}</strong></div>
                <div><span className="text-[#6B6B72]">Project:</span> {quotingReq.projectType}</div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-[#A8A8AF] uppercase tracking-wider block mb-1.5">
                    Quote Amount (GTA$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#CCFF00] font-bold text-sm">$</span>
                    <input
                      value={quoteAmount}
                      onChange={(e) => setQuoteAmount(e.target.value)}
                      placeholder="25000"
                      className="w-full bg-[#0B0B0D] border border-white/10 focus:border-[#CCFF00] rounded-xl pl-8 pr-4 py-3 text-sm text-[#F4F4F0] outline-none transition-colors font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-mono text-[#A8A8AF] uppercase tracking-wider block mb-1.5">
                    Quote Notes <span className="text-[#6B6B72] lowercase">(optional)</span>
                  </label>
                  <textarea
                    value={quoteNotes}
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    rows={3}
                    placeholder="Breakdown: e.g. 4-page menu design + forum BBCode layout"
                    className="w-full bg-[#0B0B0D] border border-white/10 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F4F4F0] outline-none transition-colors resize-none"
                  />
                </div>

                {quoteMsg && (
                  <p className={`text-xs rounded-xl px-4 py-3 border ${quoteMsg.startsWith("✅") ? "bg-[#CCFF00]/5 text-[#CCFF00] border-[#CCFF00]/20" : "bg-red-500/10 text-red-300 border-red-500/20"}`}>
                    {quoteMsg}
                  </p>
                )}

                <button
                  onClick={handleIssueQuote}
                  disabled={quoting}
                  className="w-full py-3.5 rounded-full text-xs font-bold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] disabled:opacity-60 transition-all shadow-glow-lime flex items-center justify-center gap-2"
                >
                  {quoting ? (
                    <div className="w-4 h-4 border-2 border-[#0B0B0D]/30 border-t-[#0B0B0D] rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Generate Quote & Fleeca Payment Link</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delivery Modal */}
      <AnimatePresence>
        {deliveryReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeliveryReq(null)}
              className="absolute inset-0 bg-[#0B0B0D]/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md bg-[#1B1B20] border border-white/20 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-display font-bold text-[#F4F4F0]">Handover Deliverables</h2>
                <button
                  onClick={() => setDeliveryReq(null)}
                  className="w-8 h-8 rounded-full bg-[#0B0B0D] flex items-center justify-center text-[#A8A8AF] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-[#A8A8AF] bg-[#0B0B0D]/60 rounded-xl p-4 mb-6 space-y-1">
                <div><span className="text-[#6B6B72]">Request:</span> <strong className="text-[#CCFF00]">{deliveryReq.id}</strong></div>
                <div><span className="text-[#6B6B72]">Client:</span> <strong className="text-[#F4F4F0]">{deliveryReq.clientName}</strong></div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-[#A8A8AF] uppercase tracking-wider block mb-1.5">
                    File URL (Google Drive / Imgur) *
                  </label>
                  <input
                    value={deliverablesUrl}
                    onChange={(e) => setDeliverablesUrl(e.target.value)}
                    placeholder="https://imgur.com/a/..."
                    className="w-full bg-[#0B0B0D] border border-white/10 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F4F4F0] outline-none transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-[#A8A8AF] uppercase tracking-wider block mb-1.5">
                    Delivery Notes <span className="text-[#6B6B72] lowercase">(optional)</span>
                  </label>
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    rows={3}
                    placeholder="Here are your final PNGs and source files. The font used is Montserrat."
                    className="w-full bg-[#0B0B0D] border border-white/10 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F4F4F0] outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  onClick={handleIssueDelivery}
                  disabled={delivering || !deliverablesUrl}
                  className="w-full py-3.5 rounded-full text-xs font-bold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] disabled:opacity-60 transition-all shadow-glow-lime flex items-center justify-center gap-2"
                >
                  {delivering ? (
                    <div className="w-4 h-4 border-2 border-[#0B0B0D]/30 border-t-[#0B0B0D] rounded-full animate-spin" />
                  ) : (
                    <>
                      <Package className="w-4 h-4" />
                      <span>Deliver to Client</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
