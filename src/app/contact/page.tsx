"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { siteConfig } from "../../config/siteConfig";
import {
  MessageSquare, Mail, MapPin, Clock, ArrowRight, CheckCircle2, Send
} from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Please provide your character name."),
  discordTag: z.string().optional(),
  message: z
    .string()
    .min(20, "Message must be at least 20 characters.")
    .max(1000, "Message must be under 1,000 characters."),
});
type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
      } else {
        alert(json.error || "Failed to send. Please try Discord instead.");
      }
    } catch {
      alert("Network error. Please reach out via Discord.");
    } finally {
      setSubmitting(false);
    }
  };

  const msgLen = watch("message")?.length || 0;

  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32 px-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#160B36] border border-[#6A0DAD]/30 text-xs font-mono text-[#CCFF00] uppercase tracking-widest mb-4">
          Studio Contact
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-[#F5F3FA] mb-4">
          Let&apos;s talk design.
        </h1>
        <p className="text-sm text-[#B8AFD1] max-w-md mx-auto">
          Fastest response is always through our Discord. Use the form below for general inquiries,
          or head straight to{" "}
          <Link href="/request" className="text-[#CCFF00] hover:underline">
            Submit a Brief
          </Link>{" "}
          to begin a commission.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Info Panel */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-3xl bg-[#160B36] border border-[#6A0DAD]/30 p-7">
            <h2 className="text-xs font-mono font-bold text-[#CCFF00] uppercase tracking-widest mb-6">
              Studio Details
            </h2>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0F0529] border border-[#6A0DAD]/40 flex items-center justify-center text-[#CCFF00] flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-[#F5F3FA] mb-0.5">In-Game Location</div>
                  <div className="text-xs text-[#B8AFD1] leading-relaxed">{siteConfig.serverInfo.inGameLocation}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0F0529] border border-[#6A0DAD]/40 flex items-center justify-center text-[#CCFF00] flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-[#F5F3FA] mb-0.5">Operating Hours</div>
                  <div className="text-xs text-[#B8AFD1]">{siteConfig.serverInfo.operatingHours}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0F0529] border border-[#6A0DAD]/40 flex items-center justify-center text-[#CCFF00] flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-[#F5F3FA] mb-0.5">IC Email</div>
                  <div className="text-xs text-[#CCFF00]">{siteConfig.serverInfo.supportEmail}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Discord CTA */}
          <a
            href={siteConfig.serverInfo.discordUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 rounded-3xl bg-gradient-to-r from-[#220E4D] to-[#160B36] border border-[#6A0DAD]/50 hover:border-[#CCFF00]/50 p-7 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-[#5865F2]" />
            </div>
            <div className="flex-grow">
              <div className="text-sm font-bold text-[#F5F3FA] group-hover:text-white transition-colors">
                Discord — Fastest Response
              </div>
              <div className="text-xs text-[#B8AFD1] mt-0.5">
                Average response under 2 hours during LS business hours.
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#B8AFD1] group-hover:text-[#CCFF00] transition-colors group-hover:translate-x-1" />
          </a>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl bg-[#160B36] border border-[#6A0DAD]/30 p-7 md:p-10">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-[#CCFF00]/10 border-2 border-[#CCFF00] flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-[#CCFF00]" />
                </div>
                <h3 className="text-xl font-display font-bold text-[#F5F3FA]">Message received</h3>
                <p className="text-sm text-[#B8AFD1] max-w-xs">
                  We&apos;ll reach back out via Discord within a few hours. In the meantime, you
                  can browse our portfolio or submit a design brief.
                </p>
                <Link
                  href="/request"
                  className="mt-2 px-6 py-3 rounded-full text-xs font-bold text-[#0F0529] bg-[#CCFF00] hover:bg-[#B8E600] transition-colors"
                >
                  Start a Design Brief
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <h2 className="text-sm font-mono font-bold text-[#CCFF00] uppercase tracking-wider mb-6">
                  Send a Message
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-[#B8AFD1] mb-1.5 block uppercase tracking-wider">
                      Character Name *
                    </label>
                    <input
                      {...register("name")}
                      placeholder="Jane Citizen"
                      className="w-full bg-[#0F0529] border border-[#6A0DAD]/40 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F5F3FA] placeholder-[#7A7099] outline-none transition-colors"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-mono text-[#B8AFD1] mb-1.5 block uppercase tracking-wider">
                      Discord Handle <span className="text-[#7A7099] lowercase">(optional)</span>
                    </label>
                    <input
                      {...register("discordTag")}
                      placeholder="username#0000"
                      className="w-full bg-[#0F0529] border border-[#6A0DAD]/40 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F5F3FA] placeholder-[#7A7099] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-[#B8AFD1] mb-1.5 block uppercase tracking-wider">
                    Message *
                  </label>
                  <textarea
                    {...register("message")}
                    rows={7}
                    placeholder="What are you looking to create? Any questions about turnaround, formats, or our commission process..."
                    className="w-full bg-[#0F0529] border border-[#6A0DAD]/40 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F5F3FA] placeholder-[#7A7099] outline-none transition-colors resize-none"
                  />
                  <div className="flex items-center justify-between mt-1">
                    {errors.message ? (
                      <p className="text-xs text-red-400">{errors.message.message}</p>
                    ) : <span />}
                    <span className="text-[11px] font-mono text-[#7A7099]">{msgLen}/1000</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-full text-sm font-bold text-[#0F0529] bg-[#CCFF00] hover:bg-[#B8E600] disabled:opacity-60 transition-all shadow-glow-lime flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-[#0F0529]/30 border-t-[#0F0529] rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
