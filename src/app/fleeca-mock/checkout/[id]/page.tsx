"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield, CreditCard, CheckCircle2, ArrowLeft, Building, Lock, AlertTriangle,
  User, Banknote, FileText
} from "lucide-react";

function FleecaMockCheckoutPageInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentId = params.id as string;
  const amount = parseInt(searchParams.get("amount") || "0", 10);
  const description = searchParams.get("desc") || "Design Deposit";
  const requestId = searchParams.get("req") || "";

  const [routingNumber, setRoutingNumber] = useState("020098");
  const [accountNumber, setAccountNumber] = useState("144");
  const [name, setName] = useState("John Doe");
  const [step, setStep] = useState<"form" | "processing" | "done">("form");
  const [error, setError] = useState("");

  const handleApprove = async () => {
    if (!routingNumber.trim() || !name.trim()) {
      setError("Please fill in all required banking details.");
      return;
    }
    setError("");
    setStep("processing");

    // Build the signed webhook payload (sandbox self-test)
    const webhookPayload = JSON.stringify({
      payment_id: paymentId,
      payment_url: `${window.location.origin}/fleeca-mock/checkout/${paymentId}`,
      mode: "sandbox",
      amount,
      payer_routing: routingNumber.replace(/\s/g, ""),
      payer_name: name,
      status: "payment_successful",
      description,
      created_at: new Date().toISOString(),
      paid_at: new Date().toISOString(),
    });

    // Get signature from a helper endpoint so we can sign with the server-side key
    let signature = "sha256=sandbox_sig";
    try {
      const sigRes = await fetch("/api/fleeca/sign-mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: webhookPayload }),
      });
      if (sigRes.ok) {
        const sigData = await sigRes.json();
        signature = sigData.signature;
      }
    } catch {
      // If the signing endpoint doesn't exist, fire webhook without signature verification
      // The webhook handler skips verification for sandbox_secret_key_demo
    }

    // Fire the signed webhook to our backend
    try {
      await fetch("/api/webhooks/fleeca", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Fleeca-Signature": signature,
        },
        body: webhookPayload,
      });
    } catch {
      // Best effort — proceed regardless
    }

    setStep("done");

    // Redirect to payment result page after brief delay
    setTimeout(() => {
      router.push(`/payment/result?payment_id=${paymentId}`);
    }, 2500);
  };

  const handleDecline = async () => {
    setStep("processing");

    const webhookPayload = JSON.stringify({
      payment_id: paymentId,
      payment_url: `${window.location.origin}/fleeca-mock/checkout/${paymentId}`,
      mode: "sandbox",
      amount,
      payer_routing: routingNumber.replace(/\s/g, ""),
      payer_name: name,
      status: "payment_failed",
      description,
      created_at: new Date().toISOString(),
    });

    let signature = "sha256=sandbox_sig";
    try {
      const sigRes = await fetch("/api/fleeca/sign-mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: webhookPayload }),
      });
      if (sigRes.ok) {
        const sigData = await sigRes.json();
        signature = sigData.signature;
      }
    } catch {}

    try {
      await fetch("/api/webhooks/fleeca", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Fleeca-Signature": signature,
        },
        body: webhookPayload,
      });
    } catch {}

    setTimeout(() => {
      router.push(`/payment/result?payment_id=${paymentId}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07070A] via-[#0B0B0D] to-[#08080A] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Fleeca bank style background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(235,235,235,0.3)_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-white/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Fleeca Bank Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#CCFF00]/70 to-[#CCFF00]/40 flex items-center justify-center shadow-glow-violet">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="font-display font-black text-2xl text-[#F4F4F0] tracking-tight">
            Fleeca Bank
          </h1>
          <p className="text-xs text-[#A8A8AF] mt-1 font-mono">ONLINE PAYMENT GATEWAY</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] font-mono">
            <AlertTriangle className="w-3 h-3" />
            <span>SANDBOX / SIMULATOR MODE</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#141417] border border-white/15 rounded-3xl overflow-hidden shadow-2xl"
        >
          {step === "form" && (
            <>
              {/* Transfer Summary */}
              <div className="bg-gradient-to-r from-[#17171B] to-[#101014] p-6 border-b border-white/[0.08]">
                <div className="text-xs font-mono text-[#A8A8AF] mb-1">OUTGOING TRANSFER TO</div>
                <div className="font-display font-black text-lg text-[#F4F4F0]">SAUVAGE™ Creative Studio</div>
                <div className="text-xs text-[#A8A8AF] mt-0.5 font-mono">Routing: 030 139 330</div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-xs text-[#A8A8AF]">Amount</span>
                  <span className="font-display font-black text-3xl text-[#CCFF00] font-mono">
                    ${amount.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#6B6B72]">GTA$</span>
                </div>
                <div className="mt-2 text-[10px] text-[#A8A8AF] bg-[#0B0B0D]/60 px-3 py-1.5 rounded-lg border border-white/5 font-mono flex items-center gap-2">
                  <FileText className="w-3 h-3 text-[#CCFF00]" />
                  {description}
                </div>
              </div>

              {/* Payer Details Form */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[11px] font-mono text-[#A8A8AF] uppercase tracking-wider block mb-1.5">
                    Character Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B72]" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#0B0B0D] border border-white/10 focus:border-[#CCFF00] rounded-xl pl-10 pr-4 py-3 text-sm text-[#F4F4F0] placeholder-[#6B6B72] outline-none transition-colors font-mono"
                      placeholder="Jane Citizen"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-[#A8A8AF] uppercase tracking-wider block mb-1.5">
                    Routing Number *
                  </label>
                  <div className="relative">
                    <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B72]" />
                    <input
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value)}
                      className="w-full bg-[#0B0B0D] border border-white/10 focus:border-[#CCFF00] rounded-xl pl-10 pr-4 py-3 text-sm text-[#F4F4F0] placeholder-[#6B6B72] outline-none transition-colors font-mono"
                      placeholder="020001001"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <div className="flex items-center gap-1.5 text-[10px] text-[#6B6B72] bg-[#0B0B0D]/60 p-3 rounded-xl">
                  <Lock className="w-3.5 h-3.5 text-[#CCFF00] flex-shrink-0" />
                  <span>
                    This is a simulated sandbox payment. No real character balance is deducted.
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleApprove}
                    className="w-full py-3.5 rounded-full text-sm font-bold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] transition-all shadow-glow-lime flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Authorize Transfer — ${amount.toLocaleString()}</span>
                  </button>
                  <button
                    onClick={handleDecline}
                    className="w-full py-3 rounded-full text-xs text-[#A8A8AF] hover:text-red-300 bg-transparent border border-white/10 hover:border-red-500/30 transition-colors"
                  >
                    Simulate Failed Payment
                  </button>
                </div>
              </div>
            </>
          )}

          {step === "processing" && (
            <div className="p-12 flex flex-col items-center gap-6 text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-white/20/20 border-t-[#CCFF00] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-[#CCFF00] animate-pulse" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-[#F4F4F0]">Establishing Secure Connection</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-ping" />
                  <p className="text-xs text-[#A8A8AF] font-mono uppercase tracking-widest">
                    Central Bank of San Andreas
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="p-12 flex flex-col items-center gap-5 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#CCFF00] blur-xl opacity-20 rounded-full" />
                <div className="w-20 h-20 relative rounded-full bg-[#CCFF00]/10 border-2 border-[#CCFF00] flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-[#CCFF00]" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-display font-black text-[#F4F4F0] mb-1">Transfer Authorized</h2>
                <p className="text-xs text-[#A8A8AF] font-mono">Routing funds to merchant account...</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center justify-center gap-2 text-[10px] text-[#6B6B72] font-mono border-t border-white/5">
            <Shield className="w-3 h-3 text-[#CCFF00]" />
            <span>Fleeca Bank Secure Gateway · GTAW Sandbox · HMAC-SHA256 Signed</span>
          </div>
        </motion.div>

        <p className="text-center text-[10px] text-[#6B6B72] mt-4 font-mono">
          Payment ID: <span className="text-[#CCFF00]">{paymentId?.slice(0, 24)}...</span>
        </p>
      </div>
    </div>
  );
}

export default function FleecaMockCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 rounded-full border-4 border-white/[0.08] border-t-[#CCFF00] animate-spin" /></div>}>
      <FleecaMockCheckoutPageInner />
    </Suspense>
  );
}
