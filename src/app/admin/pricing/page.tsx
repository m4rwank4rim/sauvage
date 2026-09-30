"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import {
  ShieldCheck,
  ArrowLeft,
  Pencil,
  X,
  Loader2,
  RefreshCw,
  Tags,
  RotateCcw,
  Check,
} from "lucide-react";
import { ServiceTier } from "../../../config/siteConfig";
import { MAX_PRICE, MIN_PRICE } from "../../../lib/services";

type Draft = {
  name: string;
  category: string;
  price: string;
  deliveryTime: string;
  tagline: string;
  popular: boolean;
  features: string;
};

const toDraft = (tier: ServiceTier): Draft => ({
  name: tier.name,
  category: tier.category,
  price: String(tier.price),
  deliveryTime: tier.deliveryTime,
  tagline: tier.tagline,
  popular: Boolean(tier.popular),
  features: (tier.features ?? []).join("\n"),
});

const draftsFrom = (tiers: ServiceTier[]): Record<string, Draft> =>
  Object.fromEntries(tiers.map((t) => [t.id, toDraft(t)]));

const parsePrice = (raw: string): number | null => {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const parsed = Number.parseInt(digits, 10);
  if (!Number.isFinite(parsed)) return null;
  return Math.min(MAX_PRICE, Math.max(MIN_PRICE, parsed));
};

const usd = (n: number): string => `$${n.toLocaleString()}`;

export default function PricingManagerPage() {
  const { data: session, status } = useSession();
  const isAdmin = Boolean(session?.user?.isAdmin);

  const [tiers, setTiers] = useState<ServiceTier[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(false);
  const [busyAll, setBusyAll] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/services");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTiers(json.data);
        setDrafts(draftsFrom(json.data));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin) {
      signIn("discord", { callbackUrl: "/admin/pricing" });
      return;
    }
    loadData();
  }, [isAdmin, status]);

  /** Ids whose draft differs from the last saved server value. */
  const dirtyIds = useMemo(() => {
    return tiers
      .filter((t) => {
        const d = drafts[t.id];
        if (!d) return false;
        return (
          parsePrice(d.price) !== t.price ||
          d.name.trim() !== t.name ||
          d.category.trim() !== t.category ||
          d.deliveryTime.trim() !== t.deliveryTime ||
          d.tagline.trim() !== t.tagline ||
          d.popular !== Boolean(t.popular) ||
          d.features.split("\n").map((f) => f.trim()).filter(Boolean).join("|") !==
            (t.features ?? []).join("|")
        );
      })
      .map((t) => t.id);
  }, [tiers, drafts]);

  const setDraft = (id: string, patch: Partial<Draft>) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const saveAll = async () => {
    const updates = dirtyIds.map((id) => {
      const d = drafts[id];
      return {
        id,
        name: d.name,
        category: d.category,
        price: parsePrice(d.price) ?? 0,
        deliveryTime: d.deliveryTime,
        tagline: d.tagline,
        popular: d.popular,
        features: d.features.split("\n").map((f) => f.trim()).filter(Boolean),
      };
    });

    if (updates.length === 0) return;

    setBusyAll(true);
    setMessage("");
    try {
      const res = await fetch("/api/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setMessage(json.error || "Failed to save pricing.");
        toast.error(json.error || "Failed to save pricing.");
      } else {
        setTiers(json.data);
        setDrafts(draftsFrom(json.data));
        setEditingId(null);
        toast.success(`Updated ${updates.length} package${updates.length === 1 ? "" : "s"}.`);
      }
    } catch {
      setMessage("Network error.");
      toast.error("Network error.");
    } finally {
      setBusyAll(false);
    }
  };

  const reset = async () => {
    if (!confirm("Reset every package back to the defaults in siteConfig? This cannot be undone.")) return;
    setResetting(true);
    try {
      const res = await fetch("/api/services", { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setMessage(json.error || "Failed to reset packages.");
        toast.error(json.error || "Failed to reset packages.");
      } else {
        setTiers(json.data);
        setDrafts(draftsFrom(json.data));
        setEditingId(null);
        setMessage("");
        toast.success("Packages reset to defaults.");
      }
    } catch {
      setMessage("Network error.");
      toast.error("Network error.");
    } finally {
      setResetting(false);
    }
  };

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
        <div className="text-center">
          <ShieldCheck className="w-10 h-10 text-[#6B6B72] mx-auto mb-4" />
          <h1 className="text-lg font-display font-bold text-[#F4F4F0] mb-2">Admin access required</h1>
          <p className="text-xs text-[#6B6B72] mb-6">Sign in with your admin Discord account.</p>
          <button
            onClick={() => signIn("discord", { callbackUrl: "/admin/pricing" })}
            className="px-6 py-3 rounded-full text-xs font-bold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] transition-colors"
          >
            Sign in with Discord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-xs text-[#A8A8AF] hover:text-[#CCFF00] transition-colors mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-[#F4F4F0]">Pricing Manager</h1>
          <p className="text-xs text-[#6B6B72] mt-1">
            {tiers.length} package{tiers.length === 1 ? "" : "s"} · changes go live on the homepage, /request and checkout instantly
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#141417] border border-white/10 hover:border-[#CCFF00]/40 text-xs text-[#A8A8AF] hover:text-[#F4F4F0] transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Sync
          </button>
          <button
            onClick={reset}
            disabled={resetting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#141417] border border-white/10 hover:border-red-500/40 text-xs text-[#A8A8AF] hover:text-red-300 transition-all"
          >
            {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />} Reset
          </button>
        </div>
      </div>

      {message && <p className="text-xs text-red-400 mb-4">{message}</p>}

      {loading && tiers.length === 0 && (
        <div className="py-16 text-center text-sm text-[#6B6B72]">Loading packages…</div>
      )}

      <div className="space-y-3">
        {tiers.map((tier) => {
          const draft = drafts[tier.id];
          if (!draft) return null;

          const price = parsePrice(draft.price);
          const dirty = dirtyIds.includes(tier.id);
          const isEditing = editingId === tier.id;
          const priceInvalid = draft.price.trim() !== "" && price === null;

          return (
            <div
              key={tier.id}
              className={`rounded-2xl bg-[#141417] border transition-colors p-5 ${
                dirty ? "border-[#CCFF00]/50" : "border-white/10"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#CCFF00]">
                      {draft.category || "—"}
                    </span>
                    {tier.popular && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#F4F4F0] bg-[#CCFF00]/15 border border-[#CCFF00]/30 rounded-full px-2 py-0.5">
                        Popular
                      </span>
                    )}
                    {dirty && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#CCFF00]">
                        • Unsaved
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-display font-bold text-[#F4F4F0] truncate">{draft.name}</h2>
                  <p className="text-xs text-[#6B6B72] mt-0.5 font-mono">{tier.id}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[#6B6B72] font-mono text-sm">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={draft.price}
                      onChange={(e) => setDraft(tier.id, { price: e.target.value })}
                      onFocus={() => setEditingId(tier.id)}
                      className={`w-32 bg-[#0B0B0D] border rounded-xl px-3 py-2.5 text-sm font-mono text-[#F4F4F0] outline-none transition-colors ${
                        priceInvalid ? "border-red-500/60" : "border-white/10 focus:border-[#CCFF00]"
                      }`}
                      aria-label={`Price for ${tier.name}`}
                    />
                  </div>
                  <button
                    onClick={() => setEditingId(isEditing ? null : tier.id)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0B0B0D] border border-white/10 hover:border-[#CCFF00]/40 text-xs text-[#A8A8AF] hover:text-[#F4F4F0] transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" /> {isEditing ? "Close" : "Details"}
                  </button>
                </div>
              </div>

              {price !== null && (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-4 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-[#6B6B72]">
                  <span>Total {usd(price)}</span>
                  <span>Deposit {usd(Math.round(price / 2))}</span>
                  <span>Balance {usd(price - Math.round(price / 2))}</span>
                  <span>{draft.deliveryTime || "—"}</span>
                </div>
              )}
              {priceInvalid && (
                <p className="text-[11px] text-red-400 mt-2">
                  Enter a whole number between {usd(MIN_PRICE)} and {usd(MAX_PRICE)}.
                </p>
              )}

              {isEditing && (
                <div className="mt-5 pt-5 border-t border-white/[0.06] space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Package Name">
                      <input value={draft.name} onChange={(e) => setDraft(tier.id, { name: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Category">
                      <input value={draft.category} onChange={(e) => setDraft(tier.id, { category: e.target.value })} className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Tagline">
                    <input value={draft.tagline} onChange={(e) => setDraft(tier.id, { tagline: e.target.value })} className={inputCls} />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Delivery Time">
                      <input value={draft.deliveryTime} onChange={(e) => setDraft(tier.id, { deliveryTime: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Badge">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-[#A8A8AF] select-none h-[46px]">
                        <input
                          type="checkbox"
                          checked={draft.popular}
                          onChange={(e) => setDraft(tier.id, { popular: e.target.checked })}
                          className="w-4 h-4 accent-[#CCFF00]"
                        />
                        Mark as Most Popular
                      </label>
                    </Field>
                  </div>
                  <Field label="Features (one per line)">
                    <textarea
                      value={draft.features}
                      onChange={(e) => setDraft(tier.id, { features: e.target.value })}
                      rows={5}
                      className={`${inputCls} resize-y`}
                    />
                  </Field>
                  <button
                    onClick={() => setDraft(tier.id, toDraft(tier))}
                    className="flex items-center gap-2 text-xs text-[#6B6B72] hover:text-[#F4F4F0] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Discard changes for this package
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 mt-6 bg-[#0B0B0D]/80 backdrop-blur-xl border-t border-white/10 -mx-6 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#6B6B72]">
          <Tags className="w-4 h-4" />
          {dirtyIds.length === 0 ? (
            "All packages saved"
          ) : (
            <>
              {dirtyIds.length} unsaved change{dirtyIds.length === 1 ? "" : "s"}
            </>
          )}
        </div>
        <button
          onClick={saveAll}
          disabled={busyAll || dirtyIds.length === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busyAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-[#0B0B0D] border border-white/10 focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-[#F4F4F0] placeholder-[#6B6B72] outline-none transition-colors";

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="text-[10px] font-mono text-[#A8A8AF] uppercase tracking-wider block mb-1.5">{label}</label>
    {children}
  </div>
);