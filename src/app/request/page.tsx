"use client";

import React, { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Upload, CheckCircle2, X, Sparkles, Zap, Landmark, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { siteConfig } from "../../config/siteConfig";
import { toast } from "react-hot-toast";

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

const requestSchema = z.object({
  clientName: z.string().min(2, "Please provide your full in-character name."),
  discordTag: z.string().min(3, "Discord handle is required for correspondence."),
  businessName: z.string().optional(),
  projectType: z.enum(PROJECT_TYPES, { errorMap: () => ({ message: "Please select a project type." }) }),
  budgetRange: z.string().optional(),
  urgency: z.enum(["standard", "priority", "rush"]),
  brief: z
    .string()
    .min(40, "Please provide more detail — at least 40 characters.")
    .max(2500, "Brief must be under 2,500 characters."),
});

type RequestFormValues = z.infer<typeof requestSchema>;

import { useSession, signIn } from "next-auth/react";

type WizardStep = 1 | 2 | 3;

const STEP_LABELS: Record<WizardStep, string> = {
  1: "Identity & Pricing",
  2: "Project Details",
  3: "Creative Brief",
};

function RequestPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = React.useState<"" | "uploading" | "failed">("");
  const [currentStep, setCurrentStep] = React.useState<WizardStep>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

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

  const services = siteConfig.services as { id: string; name: string; category: string; price: number; tagline: string; deliveryTime: string; features: string[] }[];
  const [selectedServiceId, setSelectedServiceId] = React.useState(() =>
    prefilledService && prefilledService !== "custom" ? prefilledService : ""
  );
  const [customBudget, setCustomBudget] = React.useState("");

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const customBudgetValue = parseInt(customBudget.replace(/[^0-9]/g, ""), 10);
  const total = selectedService?.price ?? (Number.isFinite(customBudgetValue) && customBudgetValue >= 1000 ? customBudgetValue : null);
  const deposit = total ? Math.round(total / 2) : null;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    setValue,
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      clientName: session?.user?.name || "",
      discordTag: session?.user?.name || "",
      projectType: PROJECT_TYPES.includes(defaultType as any) ? defaultType : "Logo & Identity",
      urgency: "standard",
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
      });
    }
  }, [status, session, reset, defaultType]);

  const briefValue = watch("brief") || "";

  // Prevent seeing or interacting with the form until fully authenticated
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-white/[0.08] border-t-[#CCFF00] animate-spin" />
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

  const nextStep = () => {
    setCurrentStep((prev) => (prev < 3 ? (prev + 1) as WizardStep : 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev > 1 ? (prev - 1) as WizardStep : 1));
  };

  const onSubmit = async (data: RequestFormValues) => {
    if (!selectedServiceId && !deposit) {
      toast.error("Choose a package or enter a budget so we can charge your 50% deposit instantly.");
      return;
    }
    setIsSubmitting(true);

    try {
      // Upload reference files for real — they land in the project room as the opening messages
      let uploadedRefs: { name: string; size: number; type: string; url: string }[] = [];
      if (attachments.length > 0) {
        setUploadProgress("uploading");
        for (const file of attachments) {
          if (file.size > 4 * 1024 * 1024) {
            setUploadProgress("failed");
            toast.error(`"${file.name}" is over the 4 MB limit.`);
            setIsSubmitting(false);
            return;
          }
          const data = await fileToBase64(file);
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName: file.name, contentType: file.type, data }),
          });
          const json = await res.json();
          if (!res.ok || !json?.data?.url) {
            setUploadProgress("failed");
            toast.error(json?.error || `Could not upload "${file.name}".`);
            setIsSubmitting(false);
            return;
          }
          uploadedRefs.push({
            name: json.data.fileName,
            size: file.size,
            type: file.type,
            url: json.data.url,
          });
        }
      }

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          budgetRange: selectedService ? `$${selectedService.price.toLocaleString()} — ${selectedService.name}` : deposit ? `$${total!.toLocaleString()} — Custom project` : "Request a Quote",
          packageId: selectedServiceId || undefined,
          customBudget: selectedService ? undefined : (total ?? undefined),
          userId: (session?.user as any)?.id,
          attachments: uploadedRefs,
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.id) {
        toast.success("Brief submitted — opening your project room!");
        if (json.payment?.payment_link) {
          window.location.href = json.payment.payment_link;
        } else {
          router.push(`/request/${json.data.id}`);
        }
      } else {
        toast.error(json.error || "Submission failed. Please try again.");
        setIsSubmitting(false);
      }
    } catch {
      toast.error("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep - 1) / 2) * 100;

  return (
    <div className="min-h-screen pt-32 pb-24 md:pt-40 md:pb-32 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#141417] border border-white/[0.08] text-xs font-mono text-[#CCFF00] uppercase tracking-widest mb-4">
            Commission Portal
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-[#F4F4F0] mb-4">
            Start your design brief.
          </h1>
          <p className="text-sm text-[#A8A8AF] leading-relaxed max-w-lg mx-auto">
            Pick a package or set your budget, pay your <strong className="text-[#CCFF00]">50% deposit instantly via Fleeca</strong>,
            and your project room opens right away — chat with the designer, share files, and approve the finished work in one place.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {([1, 2, 3] as WizardStep[]).map((step) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: step * 0.1 }}
                className="flex flex-col items-center gap-1.5 flex-1 relative"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step < currentStep
                      ? "bg-[#CCFF00] border-[#CCFF00] shadow-glow-lime"
                      : step === currentStep
                      ? "bg-[#1B1B20] border-[#CCFF00] shadow-glow-violet animate-pulse"
                      : "bg-[#0B0B0D] border-white/[0.08]"
                  }`}
                >
                  {step < currentStep ? (
                    <CheckCircle2 className="w-5 h-5 text-[#0B0B0D]" />
                  ) : (
                    <span className={`text-xs font-bold ${step === currentStep ? "text-[#CCFF00]" : "text-[#6B6B72]"}`}>
                      {step}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-mono uppercase tracking-wider ${step <= currentStep ? "text-[#CCFF00]" : "text-[#6B6B72]"}`}>
                  {STEP_LABELS[step]}
                </span>
                {step < 3 && (
                  <motion.div
                    className="absolute top-5 left-[calc(50%+5px)] right-[calc(50%+5px)] h-px"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: step < currentStep ? 1 : 0 }}
                    transition={{ duration: 0.3, delay: step * 0.1 }}
                    style={{
                      background: step < currentStep ? "#CCFF00" : "rgba(255,255,255,0.08)",
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>
          <div className="h-2 bg-[#0B0B0D] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#CCFF00] to-[#CCFF00] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={currentStep}
            initial={{ opacity: 0, x: currentStep > 1 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: currentStep > 1 ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Step 1: Identity & Pricing */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Identity fields */}
                <div className="rounded-2xl bg-[#141417] border border-white/[0.08] p-6 space-y-5">
                  <h2 className="text-sm font-mono font-bold text-[#CCFF00] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full border border-[#CCFF00]/40 flex items-center justify-center text-[10px]">1</span>
                    Client Identity
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-[#A8A8AF] mb-1.5 block uppercase tracking-wider">
                        In-Character Full Name *
                      </label>
                      <input
                        {...register("clientName")}
                        placeholder="Jane Citizen"
                        className="w-full bg-[#0B0B0D] border border-white/10 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F4F4F0] placeholder-[#6B6B72] outline-none transition-colors"
                      />
                      {errors.clientName && (
                        <p className="text-xs text-red-400 mt-1">{errors.clientName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-mono text-[#A8A8AF] mb-1.5 block uppercase tracking-wider">
                        Discord Handle *
                      </label>
                      <input
                        {...register("discordTag")}
                        placeholder="username#0000"
                        className="w-full bg-[#0B0B0D] border border-white/10 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F4F4F0] placeholder-[#6B6B72] outline-none transition-colors"
                      />
                      {errors.discordTag && (
                        <p className="text-xs text-red-400 mt-1">{errors.discordTag.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-[#A8A8AF] mb-1.5 block uppercase tracking-wider">
                      In-Character Business Name{" "}
                      <span className="text-[#6B6B72] lowercase">(optional)</span>
                    </label>
                    <input
                      {...register("businessName")}
                      placeholder="e.g. Carlucci's Ristorante, Lust & Luxe Nightclub"
                      className="w-full bg-[#0B0B0D] border border-white/10 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F4F4F0] placeholder-[#6B6B72] outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Pricing & Deposit */}
                <div className="rounded-2xl bg-[#141417] border border-white/[0.08] p-6 space-y-5">
                  <h2 className="text-sm font-mono font-bold text-[#CCFF00] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full border border-[#CCFF00]/40 flex items-center justify-center text-[10px]">2</span>
                    Pricing & Instant Deposit
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {services.map((s) => {
                      const isSelected = selectedServiceId === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSelectedServiceId(s.id);
                            setCustomBudget("");
                          }}
                          className={`text-left cursor-pointer rounded-xl p-4 border transition-all ${
                            isSelected
                              ? "bg-[#1B1B20] border-[#CCFF00] shadow-glow-lime"
                              : "bg-[#0B0B0D] border-white/[0.08] hover:border-white/30"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-[#F4F4F0]">{s.name}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />}
                          </div>
                          <div className="font-display font-black text-lg text-[#CCFF00]">
                            ${s.price.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-[#A8A8AF] mt-1">
                            Deposit: ${Math.round(s.price / 2).toLocaleString()}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border p-4 transition-all ${
                      !selectedServiceId ? "border-white/[0.08] bg-[#0B0B0D]" : "border-white/[0.06] bg-[#0B0B0D]/60 opacity-70"
                    }`}
                  >
                    <div className="text-xs font-mono text-[#A8A8AF] uppercase tracking-wider shrink-0">
                      Or custom budget
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-[#CCFF00] font-display font-black text-lg">$</span>
                      <input
                        type="number"
                        min={1000}
                        value={customBudget}
                        onChange={(e) => {
                          setCustomBudget(e.target.value);
                          if (e.target.value) setSelectedServiceId("");
                        }}
                        placeholder="Enter total project budget"
                        className="w-full bg-[#0B0B0D] border border-white/10 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F4F4F0] placeholder-[#6B6B72] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {deposit ? (
                    <div className="flex items-center gap-3 rounded-xl bg-[#CCFF00]/[0.06] border border-[#CCFF00]/30 p-4">
                      <Landmark className="w-5 h-5 text-[#CCFF00] shrink-0" />
                      <div className="text-xs text-[#A8A8AF]">
                        <span className="text-[#F4F4F0] font-bold">
                          ${deposit.toLocaleString()} (50% deposit)
                        </span>{" "}
                        due now via Fleeca Bank. Remaining ${(total! - deposit).toLocaleString()} is paid when you accept the finished work.
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl bg-[#0B0B0D] border border-white/[0.08] p-4">
                      <Zap className="w-5 h-5 text-[#CCFF00] shrink-0" />
                      <div className="text-xs text-[#A8A8AF]">
                        Pick a package or enter a budget to generate your instant 50% deposit link.
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-[#6B6B72] font-mono">
                    No real-world payments — all prices are GTA World in-character currency ($).
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Project Details */}
            {currentStep === 2 && (
              <div className="rounded-2xl bg-[#141417] border border-white/[0.08] p-6 space-y-5">
                <h2 className="text-sm font-mono font-bold text-[#CCFF00] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full border border-[#CCFF00]/40 flex items-center justify-center text-[10px]">3</span>
                  Project Details
                </h2>

                <div>
                  <label className="text-xs font-mono text-[#A8A8AF] mb-1.5 block uppercase tracking-wider">
                    Project Type *
                  </label>
                  <select
                    {...register("projectType")}
                    className="w-full bg-[#0B0B0D] border border-white/10 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F4F4F0] outline-none transition-colors appearance-none"
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
                  <label className="text-xs font-mono text-[#A8A8AF] mb-2.5 block uppercase tracking-wider">
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
                              ? "bg-[#1B1B20] border-[#CCFF00] shadow-glow-lime"
                              : "bg-[#0B0B0D] border-white/[0.08] hover:border-white/30"
                          }`}
                        >
                          <input
                            type="radio"
                            {...register("urgency")}
                            value={opt.value}
                            className="sr-only"
                          />
                          <div className="text-xs font-bold text-[#F4F4F0]">{opt.label}</div>
                          <div className="text-[10px] text-[#A8A8AF] mt-0.5">{opt.description}</div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Creative Brief */}
            {currentStep === 3 && (
              <div className="rounded-2xl bg-[#141417] border border-white/[0.08] p-6 space-y-4">
                <h2 className="text-sm font-mono font-bold text-[#CCFF00] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full border border-[#CCFF00]/40 flex items-center justify-center text-[10px]">4</span>
                  Creative Brief
                </h2>

                <div>
                  <label className="text-xs font-mono text-[#A8A8AF] mb-1.5 block uppercase tracking-wider">
                    Describe Your Vision *
                  </label>
                  <textarea
                    {...register("brief")}
                    rows={7}
                    placeholder="Tell us about your business concept, faction lore, target aesthetic, color preferences, competitor references, and deliverable specs. The more detail you provide, the faster we can quote and begin work."
                    className="w-full bg-[#0B0B0D] border border-white/10 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F4F4F0] placeholder-[#6B6B72] outline-none transition-colors resize-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between mt-1">
                    {errors.brief ? (
                      <p className="text-xs text-red-400">{errors.brief.message}</p>
                    ) : (
                      <span />
                    )}
                    <span className="text-[11px] font-mono text-[#6B6B72]">
                      {briefValue.length}/2500
                    </span>
                  </div>
                </div>

                {/* Reference File Upload */}
                <div>
                  <label className="text-xs font-mono text-[#A8A8AF] mb-1.5 block uppercase tracking-wider">
                    Reference Images{" "}
                    <span className="text-[#6B6B72] lowercase">(optional, up to 5 files)</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl border-2 border-dashed border-white/10 hover:border-[#CCFF00]/50 py-6 flex flex-col items-center gap-2 text-xs text-[#A8A8AF] hover:text-[#F4F4F0] transition-colors"
                  >
                    <Upload className="w-5 h-5 text-[#CCFF00]" />
                    <span>Click to attach reference files</span>
                    <span className="text-[#6B6B72]">PNG, JPG, GIF, SVG up to 4MB each</span>
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
                          className="flex items-center gap-2 bg-[#0B0B0D] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-[#A8A8AF]"
                        >
                          <span className="truncate max-w-[120px]">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            className="text-[#6B6B72] hover:text-red-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation / Submit */}
            <div className="flex items-center justify-between pt-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#141417] border border-white/10 hover:border-white/30 text-xs text-[#A8A8AF] hover:text-[#F4F4F0] transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-glow-lime"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-glow-lime hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{uploadProgress === "uploading" ? "Uploading references…" : "Submitting brief..."}</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Design Brief</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

            <p className="text-center text-[11px] text-[#6B6B72] font-mono">
              By submitting, you agree that all quoted pricing is in GTA World in-character currency
              ($). No real-world payments.
            </p>
          </motion.form>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function RequestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 rounded-full border-4 border-white/[0.08] border-t-[#CCFF00] animate-spin" /></div>}>
      <RequestPageInner />
    </Suspense>
  );
}