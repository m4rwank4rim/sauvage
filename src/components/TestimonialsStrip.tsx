"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, Send, CheckCircle2, Shield, Filter, X } from "lucide-react";
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
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}> = ({ value, onChange, size = "md", interactive = true }) => {
  const sizes = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-6 h-6" };
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type={interactive ? "button" : undefined}
          onClick={interactive ? () => onChange(i + 1) : undefined}
          aria-label={`${i + 1} star${i ? "s" : ""}`}
          disabled={!interactive}
          className={`transition-transform duration-150 ${
            i < value
              ? "text-electric-lime fill-electric-lime scale-100"
              : "text-white/[0.15] fill-transparent hover:text-white/[0.3]"
          } ${interactive ? "hover:scale-110 active:scale-95" : ""}`}
          style={{ pointerEvents: interactive ? "auto" : "none" }}
        >
          <Star className={sizes[size]} strokeWidth={2} />
        </button>
      ))}
      {interactive && (
        <span className="font-mono text-[10px] text-text-muted ml-2">
          {value ? value.toFixed(1) : "Select"}
        </span>
      )}
    </div>
  );
};

const RatingDistribution: React.FC<{ reviews: Review[] }> = ({ reviews }) => {
  if (reviews.length === 0) return null;

  const total = reviews.length;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / total;
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
    return { stars, count, percentage: total > 0 ? (count / total) * 100 : 0 };
  });
  const maxCount = Math.max(...distribution.map((d) => d.count));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="hidden lg:block w-56 pr-8 border-r border-white/[0.08]"
    >
      <div className="text-center mb-6">
        <div className="font-display font-bold text-5xl text-text-primary">{avg.toFixed(1)}</div>
        <div className="flex items-center justify-center gap-1 mt-1">
          <StarPicker value={Math.round(avg * 2) / 2} onChange={() => {}} size="sm" interactive={false} />
        </div>
        <div className="text-xs text-text-muted mt-2">{total} review{total !== 1 ? "s" : ""}</div>
      </div>

      <div className="space-y-2">
        {distribution.map((d) => (
          <div key={d.stars} className="flex items-center gap-2">
            <span className="text-xs font-mono text-text-muted w-6 text-right">{d.stars}</span>
            <Star className="w-3.5 h-3.5 text-electric-lime/60 fill-current" />
            <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${d.percentage}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="h-full bg-electric-lime/80 rounded-full"
              />
            </div>
            <span className="text-[10px] font-mono text-text-muted w-10 text-right">
              {d.count}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const ReviewCard: React.FC<{
  review: Review;
  index: number;
  isSelected?: boolean;
}> = ({ review, index, isSelected }) => (
  <motion.div
    key={review.id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
    className={`group relative min-w-[320px] sm:min-w-[380px] snap-start rounded-3xl bg-surface border p-6 flex flex-col justify-between shadow-card-subtle transition-all duration-300 hover:-translate-y-1 ${
      isSelected
        ? "border-electric-lime/60 ring-2 ring-electric-lime/40"
        : "border-white/[0.08] hover:border-electric-lime/40"
    }`}
  >
    {/* Verified badge */}
    {review.projectDelivered && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-electric-lime/15 border border-electric-lime/40 text-electric-lime text-[9px] font-mono uppercase tracking-wider"
      >
        <CheckCircle2 className="w-2.5 h-2.5" />
        <span>Verified</span>
      </motion.div>
    )}

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

    <p className="text-[13px] sm:text-sm text-text-primary italic leading-relaxed mb-6 flex-1">
      &ldquo;{review.content}&rdquo;
    </p>

    {review.projectDelivered && (
      <span className="inline-block mb-4 px-2.5 py-1 rounded-md bg-electric-lime/10 border border-electric-lime/30 text-[10px] font-mono text-electric-lime">
        {review.projectDelivered}
      </span>
    )}

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
    </div>
  </motion.div>
);

const FilterBar: React.FC<{
  selectedFilter: number | "all";
  onFilterChange: (filter: number | "all") => void;
  reviews: Review[];
}> = ({ selectedFilter, onFilterChange, reviews }) => {
  const counts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => Math.round(r.rating) === stars).length,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2 mb-6 px-2"
    >
      <button
        onClick={() => onFilterChange("all")}
        className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
          selectedFilter === "all"
            ? "bg-electric-lime text-[#0B0B0D] font-bold"
            : "bg-white/[0.03] text-text-secondary hover:text-text-primary hover:bg-white/[0.06] border border-white/[0.08]"
        }`}
      >
        All ({reviews.length})
      </button>
      {counts.map((c) => (
        <button
          key={c.stars}
          onClick={() => onFilterChange(c.stars)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
            selectedFilter === c.stars
              ? "bg-electric-lime text-[#0B0B0D] font-bold"
              : "bg-white/[0.03] text-text-secondary hover:text-text-primary hover:bg-white/[0.06] border border-white/[0.08]"
          }`}
        >
          <Star className="w-3 h-3 fill-current" />
          <span>{c.stars}</span>
          <span className="text-[10px]">({c.count})</span>
        </button>
      ))}
    </motion.div>
  );
};

export const TestimonialsStrip: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number | "all">("all");
  const [autoPlay, setAutoPlay] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [project, setProject] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const filteredReviews = filter === "all"
    ? reviews
    : reviews.filter((r) => Math.round(r.rating) === filter);

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

  // Auto-play carousel
  useEffect(() => {
    if (!autoPlay || filteredReviews.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      if (trackRef.current) {
        setCurrentIndex((prev) => (prev + 1) % filteredReviews.length);
      }
    }, 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [autoPlay, filteredReviews.length]);

  const scrollToCard = useCallback((index: number) => {
    if (!trackRef.current) return;
    const card = trackRef.current.querySelector(`[data-card]:nth-child(${index + 1})`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      setCurrentIndex(index);
    }
  }, []);

  const scrollByCard = useCallback((dir: 1 | -1) => {
    if (!trackRef.current || filteredReviews.length === 0) return;
    const nextIndex = Math.max(0, Math.min(filteredReviews.length - 1, currentIndex + dir));
    scrollToCard(nextIndex);
  }, [currentIndex, filteredReviews.length, scrollToCard]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setAutoPlay(false);
  const handleMouseLeave = () => setAutoPlay(true);

  // Touch swipe support
  const touchStartRef = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartRef.current;
    if (Math.abs(diff) > 50) {
      scrollByCard(diff > 0 ? -1 : 1);
    }
    touchStartRef.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") scrollByCard(-1);
      if (e.key === "ArrowRight") scrollByCard(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollByCard]);

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
    <section
      className="py-20 md:py-28 overflow-hidden bg-[#0B0B0D] border-y border-white/[0.06] relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background ambient glow */}
      <div className="absolute top-0 right-[-10%] w-[480px] h-[380px] bg-electric-lime/[0.05] rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Header with rating summary */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl lg:flex-1"
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

          <RatingDistribution reviews={reviews} />
        </div>

        {/* Filter bar */}
        <FilterBar
          selectedFilter={filter}
          onFilterChange={setFilter}
          reviews={reviews}
        />

        {/* Snap-scroll carousel */}
        <div
          ref={trackRef}
          className="relative w-full overflow-x-auto snap-x snap-mandatory scroll-pl-5 md:scroll-pl-8 flex gap-5 px-5 md:px-8 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {loading ? (
            <motion.div
              className="min-w-[320px] sm:min-w-[380px] snap-start rounded-3xl bg-surface border border-white/[0.08] p-6 animate-pulse"
            >
              <div className="w-8 h-6 bg-white/[0.06] rounded" />
              <div className="h-4 w-24 bg-white/[0.06] rounded mt-4" />
              <div className="h-3 w-full bg-white/[0.05] rounded mt-4" />
              <div className="h-3 w-2/3 bg-white/[0.05] rounded mt-2" />
            </motion.div>
          ) : filteredReviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              data-card
              className="min-w-[320px] sm:min-w-[420px] snap-start rounded-3xl bg-surface border border-white/[0.08] p-8 text-center"
            >
              <Quote className="w-6 h-6 text-electric-lime/70 mx-auto" strokeWidth={1.5} />
              <p className="font-display text-xl text-text-primary mt-4">
                {filter === "all" ? "Be the first to review." : `No ${filter}-star reviews yet.`}
              </p>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                {filter === "all"
                  ? "Just finished a project with SAUVAGE? Drop an endorsement below and it appears here."
                  : "Try a different filter or be the first to leave a review at this rating."}
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredReviews.map((review, idx) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  index={idx}
                  isSelected={idx === currentIndex}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Navigation dots */}
        {filteredReviews.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-1.5 mt-6"
          >
            {filteredReviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToCard(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? "bg-electric-lime w-6"
                    : "bg-white/[0.15] hover:bg-white/[0.3]"
                }`}
                aria-label={`Go to review ${idx + 1}`}
                aria-current={idx === currentIndex ? "true" : "false"}
              />
            ))}
          </motion.div>
        )}

        {/* Nav arrows */}
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => scrollByCard(-1)}
            disabled={filteredReviews.length === 0}
            aria-label="Previous testimonial"
            className="w-10 h-10 rounded-full border border-white/[0.12] bg-white/[0.02] text-text-secondary hover:text-electric-lime hover:border-electric-lime/50 hover:bg-electric-lime/[0.06] flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollByCard(1)}
            disabled={filteredReviews.length === 0}
            aria-label="Next testimonial"
            className="w-10 h-10 rounded-full border border-white/[0.12] bg-white/[0.02] text-text-secondary hover:text-electric-lime hover:border-electric-lime/50 hover:bg-electric-lime/[0.06] flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Leave a review form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-7xl mx-auto px-5 md:px-8 mt-16"
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
              <StarPicker value={rating} onChange={setRating} size="lg" />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Your review… *"
                rows={4}
                className="bg-[#0B0B0D] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-electric-lime/60 transition-colors resize-none flex-1"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
            <AnimatePresence mode="popLayout">
              {error ? (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs text-red-400 flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  {error}
                </motion.p>
              ) : success ? (
                <motion.p
                  key="success"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs text-electric-lime flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Review submitted — thank you.
                </motion.p>
              ) : null}
            </AnimatePresence>
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