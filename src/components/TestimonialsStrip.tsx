"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { Review } from "../lib/types";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const StarPicker: React.FC<{
  value: number;
  onChange: (n: number) => void;
}> = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onChange(i + 1)}
        aria-label={`${i + 1} star${i ? "s" : ""}`}
        className={`transition-colors duration-200 ${
          i < value ? "text-electric-lime" : "text-white/[0.15] hover:text-white/[0.3]"
        }`}
      >
        <Star className="w-5 h-5 fill-current" />
      </button>
    ))}
    <span className="font-mono text-[10px] text-text-muted ml-2">
      {value ? value.toFixed(1) : "Select"}
    </span>
  </div>
);

export const TestimonialsStrip: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [project, setProject] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/reviews")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json?.data) setReviews(json.data as Review[]);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const width = card ? card.offsetWidth + 24 : 380;
    el.scrollBy({ left: dir * width, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim() || rating < 1 || content.trim().length < 10) {
      setError("Tell us your character name, pick a rating, and write at least 10 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterName: name,
          businessName: business,
          projectDelivered: project,
          content,
          rating,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data) {
        setError(json?.error || "Failed to submit review.");
        return;
      }
      setReviews((prev) => [json.data as Review, ...prev]);
      setName("");
      setBusiness("");
      setProject("");
      setContent("");
      setRating(0);
      setSuccess(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-20 md:py-28 overflow-hidden bg-[#0B0B0D] border-y border-white/[0.06] relative">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-[-10%] w-[480px] h-[380px] bg-electric-lime/[0.05] rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 mb-12 md:mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-electric-lime">
              Client Endorsements
            </span>
            <span className="h-px w-12 bg-white/[0.15]" />
          </div>
          <h2 className="font-display font-medium text-3xl sm:text-4xl md:text-5xl tracking-tightest text-text-primary text-balance">
            Trusted by the enterprises of San Andreas.
          </h2>
          <p className="text-sm text-text-secondary mt-3 leading-relaxed">
            Real in-character business operators sharing their experience with SAUVAGE.
          </p>
        </motion.div>

        <div className="flex items-center gap-3 shrink-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted mr-1 hidden sm:block">
            Drag or use arrows
          </p>
          <button
            onClick={() => scrollByCard(-1)}
            aria-label="Previous testimonial"
            className="w-10 h-10 rounded-full border border-white/[0.12] bg-white/[0.02] text-text-secondary hover:text-electric-lime hover:border-electric-lime/50 hover:bg-electric-lime/[0.06] flex items-center justify-center transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollByCard(1)}
            aria-label="Next testimonial"
            className="w-10 h-10 rounded-full border border-white/[0.12] bg-white/[0.02] text-text-secondary hover:text-electric-lime hover:border-electric-lime/50 hover:bg-electric-lime/[0.06] flex items-center justify-center transition-all duration-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Snap-scroll carousel */}
      <div
        ref={trackRef}
        className="relative w-full overflow-x-auto snap-x snap-mandatory scroll-pl-5 md:scroll-pl-8 flex gap-5 px-5 md:px-8 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
      >
        {loading ? (
          <div className="min-w-[320px] sm:min-w-[380px] snap-start rounded-3xl bg-surface border border-white/[0.08] p-6 animate-pulse">
            <div className="w-8 h-6 bg-white/[0.06] rounded" />
            <div className="h-4 w-24 bg-white/[0.06] rounded mt-4" />
            <div className="h-3 w-full bg-white/[0.05] rounded mt-4" />
            <div className="h-3 w-2/3 bg-white/[0.05] rounded mt-2" />
          </div>
        ) : reviews.length === 0 ? (
          <div
            data-card
            className="min-w-[320px] sm:min-w-[420px] snap-start rounded-3xl bg-surface border border-white/[0.08] p-8 text-center"
          >
            <Quote className="w-6 h-6 text-electric-lime/70 mx-auto" strokeWidth={1.5} />
            <p className="font-display text-xl text-text-primary mt-4">Be the first to review.</p>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              Just finished a project with SAUVAGE? Drop an endorsement below and it appears here.
            </p>
          </div>
        ) : (
          reviews.map((review, idx) => (
            <motion.div
              key={review.id}
              data-card
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (idx % 3) * 0.08 }}
              className="min-w-[320px] sm:min-w-[380px] snap-start rounded-3xl bg-surface border border-white/[0.08] hover:border-electric-lime/40 p-6 flex flex-col justify-between shadow-card-subtle transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-lime"
            >
              <div>
                <Quote className="w-5 h-5 text-electric-lime/70 -mb-1" strokeWidth={1.5} />

                <div className="flex items-center gap-1 mt-2 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? "fill-electric-lime text-electric-lime" : "fill-transparent text-white/[0.15]"}`}
                    />
                  ))}
                  <span className="text-[10px] font-mono text-text-muted ml-2">
                    {review.rating.toFixed(1)}
                  </span>
                </div>

                <p className="text-[13px] sm:text-sm text-text-primary italic leading-relaxed mb-6">
                  &ldquo;{review.content}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 shrink-0 rounded-full border border-electric-lime/40 bg-surface-2 flex items-center justify-center font-display font-medium text-xs text-electric-lime">
                    {initials(review.characterName)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-text-primary truncate">
                      {review.characterName}
                    </div>
                    <div className="text-[11px] text-text-secondary truncate">
                      {review.businessName || "Private individual"}
                    </div>
                  </div>
                </div>

                {review.projectDelivered && (
                  <span className="text-[9px] font-mono text-electric-lime bg-[#0B0B0D] px-2 py-1 rounded-md border border-white/[0.08] shrink-0">
                    {review.projectDelivered}
                  </span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Leave a review */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-7xl mx-auto px-5 md:px-8 mt-12"
      >
        <div className="rounded-3xl bg-white/[0.02] border border-white/[0.08] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-electric-lime">
              Leave a review
            </span>
            <span className="h-px w-12 bg-white/[0.15]" />
          </div>
          <p className="text-sm text-text-secondary mb-6">
            Finished a project with us? Endorse the work — verified reviews go straight to this page.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-5">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Character name *"
                className="bg-[#0B0B0D] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-electric-lime/60 transition-colors"
              />
              <input
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                placeholder="Business name (optional)"
                className="bg-[#0B0B0D] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-electric-lime/60 transition-colors"
              />
              <input
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="Project delivered (optional)"
                className="bg-[#0B0B0D] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-electric-lime/60 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-5">
              <StarPicker value={rating} onChange={setRating} />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Your review… *"
                rows={3}
                className="bg-[#0B0B0D] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-electric-lime/60 transition-colors resize-none flex-1"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
            {error ? (
              <p className="text-xs text-red-400">{error}</p>
            ) : success ? (
              <p className="text-xs text-electric-lime">Review submitted — thank you.</p>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-electric-lime text-[#0B0B0D] text-sm font-semibold hover:bg-electric-lime/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Submitting…" : "Submit review"}
            </button>
          </div>
        </div>
      </motion.form>
    </section>
  );
};