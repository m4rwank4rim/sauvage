"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ArrowLeft, Plus, Pencil, Trash2, Star, ChevronUp,
  ChevronDown, X, Loader2, RefreshCw, ImageIcon, UploadCloud
} from "lucide-react";
import { PortfolioItem } from "../../../lib/types";
import { PortfolioGraphic } from "../../../components/PortfolioGraphic";

const CATEGORIES = ["Logos", "Print", "Digital/Social", "Signage", "Other"];
const PREVIEWS = ["logo", "menu", "digital", "signage"];

type FormState = {
  id?: string;
  title: string;
  clientName: string;
  businessType: string;
  year: string;
  description: string;
  tags: string;
  category: string;
  previewType: string;
  colorAccent: string;
  imageUrl: string;
  featured: boolean;
  sourceRequestId?: string;
};

const emptyForm = (): FormState => ({
  title: "",
  clientName: "",
  businessType: "",
  year: String(new Date().getFullYear()),
  description: "",
  tags: "",
  category: "Other",
  previewType: "digital",
  colorAccent: "#CCFF00",
  imageUrl: "",
  featured: false,
});

const toForm = (item: PortfolioItem): FormState => ({
  id: item.id,
  title: item.title,
  clientName: item.clientName,
  businessType: item.businessType,
  year: item.year,
  description: item.description,
  tags: (item.tags ?? []).join(", "),
  category: item.category,
  previewType: item.previewType,
  colorAccent: item.colorAccent,
  imageUrl: item.imageUrl ?? "",
  featured: item.featured,
  sourceRequestId: item.sourceRequestId,
});

const guessCategory = (projectType: string): string => {
  if (/logo|identity|brand/i.test(projectType)) return "Logos";
  if (/menu|print|collateral/i.test(projectType)) return "Print";
  if (/social/i.test(projectType)) return "Digital/Social";
  if (/signage|billboard/i.test(projectType)) return "Signage";
  return "Other";
};

const isImageUrl = (url?: string) =>
  Boolean(url && /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i.test(url));

export default function PortfolioManagerPage() {
  const { data: session, status } = useSession();
  const isAdmin = Boolean(session?.user?.isAdmin);

  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio");
      const json = await res.json();
      if (json.success) setItems(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin) {
      signIn("discord", { callbackUrl: "/admin/portfolio" });
      return;
    }
    loadData();
  }, [isAdmin, status]);

  useEffect(() => {
    if (status !== "authenticated" || !isAdmin) return;
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    if (!from) return;
    fetch(`/api/requests/${from}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const req = json?.data?.request;
        if (!req) return;
        setForm({
          ...emptyForm(),
          title: req.businessName || req.projectType,
          clientName: req.clientName,
          businessType: req.projectType,
          year: new Date(req.createdAt || Date.now()).getFullYear().toString(),
          description: req.deliveryNotes || req.brief || "",
          tags: [req.packageName, req.projectType].filter(Boolean).join(", "),
          category: guessCategory(req.projectType || ""),
          imageUrl: isImageUrl(req.deliverablesUrl) ? req.deliverablesUrl : "",
          sourceRequestId: req.id,
        });
        window.history.replaceState({}, "", "/admin/portfolio");
      })
      .catch(() => undefined);
  }, [status, isAdmin]);

  const onPickFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file (PNG, JPG or WebP).");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setMessage("Image must be 4 MB or smaller.");
      return;
    }
    setUploading(true);
    setMessage("");
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = String(reader.result);
        const base64 = dataUrl.split(",")[1] ?? "";
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: safeName, contentType: file.type, data: base64 }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          setMessage(json.error || "Upload failed.");
        } else {
          setForm((f) => (f ? { ...f, imageUrl: json.data.url } : f));
        }
      } catch {
        setMessage("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      setUploading(false);
      setMessage("Could not read that file.");
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!form) return;
    if (!form.title.trim() || !form.clientName.trim()) {
      setMessage("Title and client name are required.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        title: form.title,
        clientName: form.clientName,
        businessType: form.businessType,
        year: form.year,
        description: form.description,
        tags: form.tags,
        category: form.category,
        previewType: form.previewType,
        colorAccent: form.colorAccent,
        imageUrl: form.imageUrl || undefined,
        featured: form.featured,
        sourceRequestId: form.sourceRequestId,
      };
      const res = await fetch(form.id ? `/api/portfolio/${form.id}` : "/api/portfolio", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setMessage(json.error || "Failed to save.");
      } else {
        setForm(null);
        loadData();
      }
    } catch {
      setMessage("Network error.");
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatured = async (item: PortfolioItem) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, featured: !i.featured } : i)));
    await fetch(`/api/portfolio/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !item.featured }),
    });
  };

  const remove = async (item: PortfolioItem) => {
    if (!confirm(`Delete "${item.title}" from the portfolio? This cannot be undone.`)) return;
    await fetch(`/api/portfolio/${item.id}`, { method: "DELETE" });
    loadData();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    await fetch("/api/portfolio/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((i) => i.id) }),
    });
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
          <ShieldCheck className="w-12 h-12 text-[#CCFF00] mx-auto mb-4" />
          <h1 className="text-xl font-display font-bold text-[#F4F4F0] mb-2">Admin access required</h1>
          <p className="text-sm text-[#A8A8AF] mb-6">Sign in with an authorized Discord account.</p>
          <button
            onClick={() => signIn("discord", { callbackUrl: "/admin/portfolio" })}
            className="px-6 py-3 rounded-full text-xs font-bold text-[#0B0B0D] bg-[#5865F2] hover:bg-[#4752C4] transition-colors"
          >
            Sign in with Discord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-xs text-[#A8A8AF] hover:text-[#CCFF00] transition-colors mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-[#F4F4F0]">Portfolio Manager</h1>
          <p className="text-xs text-[#6B6B72] mt-1">{items.length} item{items.length === 1 ? "" : "s"} · shown on the homepage and /work</p>
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
            onClick={() => { setForm(emptyForm()); setMessage(""); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] transition-colors"
          >
            <Plus className="w-4 h-4" /> New Item
          </button>
        </div>
      </div>

      {message && <p className="text-xs text-red-400 mb-4">{message}</p>}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-4 rounded-2xl bg-[#141417] border border-white/[0.08] p-3">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0">
              <PortfolioGraphic item={item} className="w-full h-full" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#F4F4F0] truncate">{item.title}</h3>
                {item.featured && <Star className="w-3.5 h-3.5 text-[#CCFF00] fill-current shrink-0" />}
                {item.imageUrl && <ImageIcon className="w-3.5 h-3.5 text-[#6B6B72] shrink-0" />}
              </div>
              <p className="text-[11px] text-[#A8A8AF] truncate">{item.clientName} · {item.category} · {item.year}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => move(index, -1)} disabled={index === 0} className="p-2 text-[#6B6B72] hover:text-[#F4F4F0] disabled:opacity-30 transition-colors" title="Move up">
                <ChevronUp className="w-4 h-4" />
              </button>
              <button onClick={() => move(index, 1)} disabled={index === items.length - 1} className="p-2 text-[#6B6B72] hover:text-[#F4F4F0] disabled:opacity-30 transition-colors" title="Move down">
                <ChevronDown className="w-4 h-4" />
              </button>
              <button onClick={() => toggleFeatured(item)} className={`p-2 transition-colors ${item.featured ? "text-[#CCFF00]" : "text-[#6B6B72] hover:text-[#CCFF00]"}`} title="Toggle featured">
                <Star className={`w-4 h-4 ${item.featured ? "fill-current" : ""}`} />
              </button>
              <button onClick={() => { setForm(toForm(item)); setMessage(""); }} className="p-2 text-[#6B6B72] hover:text-[#F4F4F0] transition-colors" title="Edit">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => remove(item)} className="p-2 text-[#6B6B72] hover:text-red-400 transition-colors" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && !loading && (
          <div className="py-16 text-center text-sm text-[#6B6B72]">
            No portfolio items yet. Click “New Item” to add one.
          </div>
        )}
      </div>

      <AnimatePresence>
        {form && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setForm(null)}
              className="absolute inset-0 bg-[#0B0B0D]/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1B1B20] border border-white/20 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-display font-bold text-[#F4F4F0]">{form.id ? "Edit Item" : "New Portfolio Item"}</h2>
                <button onClick={() => setForm(null)} className="w-8 h-8 rounded-full bg-[#0B0B0D] flex items-center justify-center text-[#A8A8AF] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <Field label="Title *">
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="Bahama Mamas VIP Cocktail List" />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Client Name *">
                    <input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className={inputCls} placeholder="Bahama Mamas West Coast" />
                  </Field>
                  <Field label="Business Type">
                    <input value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })} className={inputCls} placeholder="Nightclub & VIP Lounge" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Category">
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Preview Style">
                    <select value={form.previewType} onChange={(e) => setForm({ ...form, previewType: e.target.value })} className={inputCls}>
                      {PREVIEWS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>
                  <Field label="Year">
                    <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={inputCls} />
                  </Field>
                </div>
                {form.imageUrl && (
                  <div className="relative w-full h-72 rounded-xl border border-white/10 overflow-hidden bg-[#0B0B0D]">
                    <Image src={form.imageUrl} alt="Portfolio preview" fill unoptimized className="object-cover" />
                  </div>
                )}
                <Field label="Image URL (optional — overrides generated art)">
                  <div className="flex items-center gap-3">
                    <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className={`${inputCls} flex-1`} placeholder="https://.../design.png" />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] disabled:opacity-60 transition-all"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                      {uploading ? "Uploading…" : "Upload"}
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onPickFile(file);
                        e.currentTarget.value = "";
                      }}
                    />
                  </div>
                </Field>
                <Field label="Tags (comma separated)">
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputCls} placeholder="Menu, Print, Nightlife" />
                </Field>
                <Field label="Description">
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className={`${inputCls} resize-none`} placeholder="What was delivered..." />
                </Field>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-[#F4F4F0]">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-[#CCFF00] w-4 h-4" />
                  Featured on the homepage
                </label>

                <div className="flex gap-3 pt-2">
                  <button onClick={save} disabled={saving} className="flex-1 py-3.5 rounded-full text-xs font-bold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {form.id ? "Save Changes" : "Create Item"}
                  </button>
                  <button onClick={() => setForm(null)} className="px-6 py-3.5 rounded-full text-xs text-[#A8A8AF] hover:text-white bg-[#0B0B0D] border border-white/10 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
