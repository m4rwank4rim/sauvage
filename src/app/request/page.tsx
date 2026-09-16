"use client";

import React, { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Upload, CheckCircle2, X, Sparkles, FileEdit } from "lucide-react";
import { useRouter } from "next/navigation";

const PROJECT_TYPES = [
  "Logo & Identity",
  "Brand Kit",
  "Menu & Print Collateral",
  "Social Media Pack",
  "Signage & Billboards",
  "Other / Custom",
] as const;

const URGENCY_OPTIONS = [
  { value: "standard", label: "Standard (24-48h)", description: "Most common, best value" },
  { value: "priority", label: "Priority (12-24h)", description: "Rush queue — small surcharge" },
  { value: "rush", label: "Rush (<12h)", description: "Immediate attention — premium rate" },
] as const;

const BUDGET_RANGES = [
  "Under $10,000",
  "$10,000 – $20,000",
  "$20,000 – $40,000",
  "$40,000 – $80,000",
  "$80,000+",
  "Request a Quote",
] as const;

const requestSchema = z.object({
  clientName: z.string().min(2, "Please provide your full in-character name."),
  discordTag: z.string().min(3, "Discord handle is required for correspondence."),
  businessName: z.string().optional(),
  projectType: z.enum(PROJECT_TYPES, { errorMap: () => ({ message: "Please select a project type." }) }),
  budgetRange: z.string().min(1, "Please indicate your budget range."),
  urgency: z.enum(["standard", "priority", "rush"]),
  brief: z
    .string()
    .min(40, "Please provide more detail — at least 40 characters.")
    .max(2500, "Brief must be under 2,500 characters."),
});

type RequestFormValues = z.infer<typeof requestSchema>;

import { useSession, signIn } from "next-auth/react";

function RequestPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill service / category from URL params (from pricing CTAs)
  const prefilledService = searchParams.get("service") || "";
  const prefilledCategory = searchParams.get("category") || "";

  // Map service IDs to project types
  const serviceToType: Record<string, string> = {
    "logo-identity": "Logo & Identity",
    "complete-brand-kit": "Brand Kit",
    "print-menus-cards": "Menu & Print Collateral",
    "custom": "Other / Custom",
  };

  const defaultType = (
    serviceToType[prefilledService] ||
    prefilledCategory ||
    "Logo & Identity"
  ) as (typeof PROJECT_TYPES)[number];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      clientName: session?.user?.name || "",
      discordTag: session?.user?.name || "",
      projectType: PROJECT_TYPES.includes(defaultType as any) ? defaultType : "Logo & Identity",
      urgency: "standard",
      budgetRange: "Request a Quote",
    },
  });

  // Force login & update defaults when session loads
  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("discord", { callbackUrl: "/request" });
    } else if (status === "authenticated" && session?.user?.name) {
      reset({
        clientName: session.user.name,
        discordTag: session.user.name,
        projectType: PROJECT_TYPES.includes(defaultType as any) ? defaultType : "Logo & Identity",
        urgency: "standard",
        budgetRange: "Request a Quote",
      });
    }
  }, [status, session, reset, defaultType]);

  const briefValue = watch("brief") || "";

  // Prevent seeing or interacting with the form until fully authenticated
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#6A0DAD]/30 border-t-[#CCFF00] animate-spin" />
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files].slice(0, 5));
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: RequestFormValues) => {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          userId: (session?.user as any)?.id,
          attachments: attachments.map((f) => ({ name: f.name, size: f.size, type: f.type })),
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.id) {
        router.push(`/request/${json.data.id}`);
      } else {
        alert(json.error || "Submission failed. Please try again.");
        setIsSubmitting(false);
      }
    } catch {
      alert("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 md:pt-40 md:pb-32 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#160B36] border border-[#6A0DAD]/30 text-xs font-mono text-[#CCFF00] uppercase tracking-widest mb-4">
            Commission Portal
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-[#F5F3FA] mb-4">
            Start your design brief.
          </h1>
          <p className="text-sm text-[#B8AFD1] leading-relaxed max-w-lg mx-auto">
            Fill out the form below. Once we review your brief, we will issue a quote within 12
            hours and create a Fleeca Bank payment link for you.
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Identity fields */}
          <div className="rounded-2xl bg-[#160B36] border border-[#6A0DAD]/30 p-6 space-y-5">
            <h2 className="text-sm font-mono font-bold text-[#CCFF00] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full border border-[#CCFF00]/40 flex items-center justify-center text-[10px]">1</span>
              Client Identity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-[#B8AFD1] mb-1.5 block uppercase tracking-wider">
                  In-Character Full Name *
                </label>
                <input
                  {...register("clientName")}
                  placeholder="Jane Citizen"
                  className="w-full bg-[#0F0529] border border-[#6A0DAD]/40 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F5F3FA] placeholder-[#7A7099] outline-none transition-colors"
                />
                {errors.clientName && (
                  <p className="text-xs text-red-400 mt-1">{errors.clientName.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-mono text-[#B8AFD1] mb-1.5 block uppercase tracking-wider">
                  Discord Handle *
                </label>
                <input
                  {...register("discordTag")}
                  placeholder="username#0000"
                  className="w-full bg-[#0F0529] border border-[#6A0DAD]/40 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F5F3FA] placeholder-[#7A7099] outline-none transition-colors"
                />
                {errors.discordTag && (
                  <p className="text-xs text-red-400 mt-1">{errors.discordTag.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-[#B8AFD1] mb-1.5 block uppercase tracking-wider">
                In-Character Business Name{" "}
                <span className="text-[#7A7099] lowercase">(optional)</span>
              </label>
              <input
                {...register("businessName")}
                placeholder="e.g. Carlucci's Ristorante, Lust & Luxe Nightclub"
                className="w-full bg-[#0F0529] border border-[#6A0DAD]/40 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F5F3FA] placeholder-[#7A7099] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Project Specifics */}
          <div className="rounded-2xl bg-[#160B36] border border-[#6A0DAD]/30 p-6 space-y-5">
            <h2 className="text-sm font-mono font-bold text-[#CCFF00] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full border border-[#CCFF00]/40 flex items-center justify-center text-[10px]">2</span>
              Project Details
            </h2>

            <div>
              <label className="text-xs font-mono text-[#B8AFD1] mb-1.5 block uppercase tracking-wider">
                Project Type *
              </label>
              <select
                {...register("projectType")}
                className="w-full bg-[#0F0529] border border-[#6A0DAD]/40 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F5F3FA] outline-none transition-colors appearance-none"
              >
                {PROJECT_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
              {errors.projectType && (
                <p className="text-xs text-red-400 mt-1">{errors.projectType.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-mono text-[#B8AFD1] mb-2.5 block uppercase tracking-wider">
                Delivery Urgency *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {URGENCY_OPTIONS.map((opt) => {
                  const isSelected = watch("urgency") === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`cursor-pointer rounded-xl p-4 border transition-all ${
                        isSelected
                          ? "bg-[#1B0F3D] border-[#CCFF00] shadow-glow-lime"
                          : "bg-[#0F0529] border-[#6A0DAD]/30 hover:border-[#6A0DAD]"
                      }`}
                    >
                      <input
                        type="radio"
                        {...register("urgency")}
                        value={opt.value}
                        className="sr-only"
                      />
                      <div className="text-xs font-bold text-[#F5F3FA]">{opt.label}</div>
                      <div className="text-[10px] text-[#B8AFD1] mt-0.5">{opt.description}</div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-[#B8AFD1] mb-1.5 block uppercase tracking-wider">
                Budget Range *
              </label>
              <select
                {...register("budgetRange")}
                className="w-full bg-[#0F0529] border border-[#6A0DAD]/40 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F5F3FA] outline-none transition-colors appearance-none"
              >
                {BUDGET_RANGES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Creative Brief */}
          <div className="rounded-2xl bg-[#160B36] border border-[#6A0DAD]/30 p-6 space-y-4">
            <h2 className="text-sm font-mono font-bold text-[#CCFF00] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full border border-[#CCFF00]/40 flex items-center justify-center text-[10px]">3</span>
              Creative Brief
            </h2>

            <div>
              <label className="text-xs font-mono text-[#B8AFD1] mb-1.5 block uppercase tracking-wider">
                Describe Your Vision *
              </label>
              <textarea
                {...register("brief")}
                rows={7}
                placeholder="Tell us about your business concept, faction lore, target aesthetic, color preferences, competitor references, and deliverable specs. The more detail you provide, the faster we can quote and begin work."
                className="w-full bg-[#0F0529] border border-[#6A0DAD]/40 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F5F3FA] placeholder-[#7A7099] outline-none transition-colors resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between mt-1">
                {errors.brief ? (
                  <p className="text-xs text-red-400">{errors.brief.message}</p>
                ) : (
                  <span />
                )}
                <span className="text-[11px] font-mono text-[#7A7099]">
                  {briefValue.length}/2500
                </span>
              </div>
            </div>

            {/* Reference File Upload */}
            <div>
              <label className="text-xs font-mono text-[#B8AFD1] mb-1.5 block uppercase tracking-wider">
                Reference Images{" "}
                <span className="text-[#7A7099] lowercase">(optional, up to 5 files)</span>
              </label>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-[#6A0DAD]/40 hover:border-[#CCFF00]/50 py-6 flex flex-col items-center gap-2 text-xs text-[#B8AFD1] hover:text-[#F5F3FA] transition-colors"
              >
                <Upload className="w-5 h-5 text-[#CCFF00]" />
                <span>Click to attach reference files</span>
                <span className="text-[#7A7099]">PNG, JPG, GIF, SVG up to 10MB each</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.svg"
                className="hidden"
                onChange={handleFileChange}
              />

              {attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-[#0F0529] border border-[#6A0DAD]/30 rounded-lg px-3 py-1.5 text-xs text-[#B8AFD1]"
                    >
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="text-[#7A7099] hover:text-red-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-full text-sm font-bold text-[#0F0529] bg-[#CCFF00] hover:bg-[#B8E600] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-glow-lime hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0F0529]/30 border-t-[#0F0529] rounded-full animate-spin" />
                <span>Submitting brief...</span>
              </>
            ) : (
              <>
                <span>Submit Design Brief</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-[#7A7099] font-mono">
            By submitting, you agree that all quoted pricing is in GTA World in-character currency
            ($). No real-world payments.
          </p>
        </motion.form>
      </div>
    </div>
  );
}

export default function RequestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 rounded-full border-4 border-[#6A0DAD]/30 border-t-[#CCFF00] animate-spin" /></div>}>
      <RequestPageInner />
    </Suspense>
  );
}
