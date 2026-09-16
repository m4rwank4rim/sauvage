"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, ArrowRight, Receipt, ExternalLink } from "lucide-react";

interface PaymentData {
  paymentId?: string;
  requestId?: string;
  amount?: number;
  status?: string;
  payerName?: string;
  paidAt?: string;
  description?: string;
}

type PageStatus = "loading" | "success" | "failed" | "pending" | "error";

function PaymentResultPageInner() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!paymentId) {
      setPageStatus("error");
      setErrorMsg("No payment ID provided in the URL.");
      return;
    }

    // Server-side verification — never trust client redirect alone
    fetch(`/api/fleeca/status/${paymentId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setPageStatus("error");
          setErrorMsg(json.error || "Payment lookup failed.");
          return;
        }

        const data = json.data;
        setPaymentData(data);

        const status = data.status;
        if (status === "payment_successful") setPageStatus("success");
        else if (status === "payment_failed") setPageStatus("failed");
        else setPageStatus("pending");
      })
      .catch(() => {
        setPageStatus("error");
        setErrorMsg("Network error. Please try refreshing.");
      });
  }, [paymentId]);

  const StatusIcon = () => {
    if (pageStatus === "loading") {
      return (
        <div className="w-20 h-20 rounded-full border-4 border-[#6A0DAD]/40 border-t-[#CCFF00] animate-spin" />
      );
    }
    if (pageStatus === "success") {
      return (
        <div className="w-20 h-20 rounded-full bg-[#CCFF00]/10 border-2 border-[#CCFF00] flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-[#CCFF00]" />
        </div>
      );
    }
    if (pageStatus === "failed") {
      return (
        <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/60 flex items-center justify-center">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
      );
    }
    return (
      <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-400/60 flex items-center justify-center">
        <Clock className="w-10 h-10 text-amber-400" />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#160B36] border border-[#6A0DAD]/40 rounded-3xl p-8 md:p-12 text-center flex flex-col items-center gap-6"
        >
          <StatusIcon />

          {pageStatus === "loading" && (
            <>
              <h1 className="text-2xl font-display font-black text-[#F5F3FA]">
                Verifying payment...
              </h1>
              <p className="text-sm text-[#B8AFD1]">
                Confirming your Fleeca Bank transaction. Please wait.
              </p>
            </>
          )}

          {pageStatus === "success" && (
            <>
              <div>
                <div className="text-xs font-mono font-bold text-[#CCFF00] uppercase tracking-widest mb-2">
                  Fleeca Transaction Confirmed
                </div>
                <h1 className="text-3xl font-display font-black text-[#F5F3FA] mb-2">
                  Payment Successful
                </h1>
                <p className="text-sm text-[#B8AFD1]">
                  Your deposit has been received and verified via Fleeca Bank Gateway. Our designers
                  have been notified and will begin your project promptly.
                </p>
              </div>

              {/* Receipt Card */}
              {paymentData && (
                <div className="w-full rounded-2xl bg-[#0F0529] border border-[#6A0DAD]/30 p-5 text-left space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#CCFF00] uppercase mb-1">
                    <Receipt className="w-4 h-4" />
                    <span>Transaction Receipt</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#B8AFD1]">
                    <span>Payment ID</span>
                    <span className="font-mono text-[#F5F3FA] text-right max-w-[55%] truncate">
                      {paymentId}
                    </span>
                  </div>
                  {paymentData.amount && (
                    <div className="flex justify-between text-xs text-[#B8AFD1]">
                      <span>Amount</span>
                      <span className="font-mono text-[#CCFF00] font-bold">
                        ${paymentData.amount.toLocaleString()} GTA$
                      </span>
                    </div>
                  )}
                  {paymentData.payerName && (
                    <div className="flex justify-between text-xs text-[#B8AFD1]">
                      <span>Authorized By</span>
                      <span className="font-mono text-[#F5F3FA]">{paymentData.payerName}</span>
                    </div>
                  )}
                  {paymentData.description && (
                    <div className="flex justify-between text-xs text-[#B8AFD1]">
                      <span>Reference</span>
                      <span className="font-mono text-[#F5F3FA] text-right max-w-[55%]">
                        {paymentData.description}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-[#B8AFD1] pt-2 border-t border-white/5">
                    <span>Status</span>
                    <span className="text-[#CCFF00] font-bold font-mono">CONFIRMED</span>
                  </div>
                </div>
              )}

              <div className="w-full flex flex-col sm:flex-row gap-3">
                {paymentData?.requestId && (
                  <Link
                    href={`/request/${paymentData.requestId}`}
                    className="flex-1 py-3 rounded-full text-xs font-bold text-[#0F0529] bg-[#CCFF00] hover:bg-[#B8E600] flex items-center justify-center gap-2 shadow-glow-lime"
                  >
                    <span>Track Your Project</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <Link
                  href="/"
                  className="flex-1 py-3 rounded-full text-xs text-[#B8AFD1] hover:text-white bg-[#0F0529] hover:bg-white/5 border border-white/10 flex items-center justify-center"
                >
                  Return to Studio
                </Link>
              </div>
            </>
          )}

          {pageStatus === "failed" && (
            <>
              <div>
                <div className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest mb-2">
                  Transaction Failed
                </div>
                <h1 className="text-2xl font-display font-black text-[#F5F3FA] mb-2">
                  Payment Unsuccessful
                </h1>
                <p className="text-sm text-[#B8AFD1]">
                  The Fleeca Bank transfer could not be processed. This may be due to insufficient
                  in-game funds or a session timeout. Please try again.
                </p>
              </div>
              <Link
                href="/"
                className="w-full py-3.5 rounded-full text-xs font-bold text-[#0F0529] bg-[#CCFF00] hover:bg-[#B8E600] flex items-center justify-center gap-2"
              >
                Return to Studio
              </Link>
            </>
          )}

          {pageStatus === "pending" && (
            <>
              <div>
                <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-2">
                  Awaiting Confirmation
                </div>
                <h1 className="text-2xl font-display font-black text-[#F5F3FA] mb-2">
                  Payment Pending
                </h1>
                <p className="text-sm text-[#B8AFD1]">
                  Your transaction is still being processed by Fleeca Bank. This page will update
                  once the webhook confirmation is received. Please check back shortly.
                </p>
              </div>
              <Link
                href="/"
                className="w-full py-3.5 rounded-full text-xs font-bold text-[#F5F3FA] bg-[#160B36] hover:bg-[#1B0F3D] border border-[#6A0DAD]/40 flex items-center justify-center"
              >
                Return to Studio
              </Link>
            </>
          )}

          {pageStatus === "error" && (
            <>
              <div>
                <h1 className="text-2xl font-display font-black text-[#F5F3FA] mb-2">
                  Verification Error
                </h1>
                <p className="text-sm text-[#B8AFD1]">{errorMsg}</p>
              </div>
              <Link
                href="/"
                className="w-full py-3.5 rounded-full text-xs font-bold text-[#F5F3FA] bg-[#160B36] hover:bg-[#1B0F3D] border border-[#6A0DAD]/40 flex items-center justify-center"
              >
                Return to Studio
              </Link>
            </>
          )}

          <p className="text-[11px] text-[#7A7099] font-mono">
            All payments processed via Fleeca Bank Gateway API · GTA World Roleplay · In-game
            currency only
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 rounded-full border-4 border-[#6A0DAD]/30 border-t-[#CCFF00] animate-spin" /></div>}>
      <PaymentResultPageInner />
    </Suspense>
  );
}
