"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles, Tag, Building2, Calendar, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import Link from "next/link";
import { PortfolioItem } from "../lib/types";
import { PortfolioGraphic } from "./PortfolioGraphic";

interface LightboxModalProps {
  item: PortfolioItem | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  item,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [landscape, setLandscape] = useState<boolean | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Pan/Zoom handlers
  const handleWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setScale((prev) => {
      const next = prev - e.deltaY * 0.001;
      return Math.min(Math.max(next, 1), 4);
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale === 1) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    e.currentTarget.style.cursor = "grabbing";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPosition({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    if (imageRef.current) imageRef.current.style.cursor = scale > 1 ? "grab" : "default";
  };

  // Touch handlers for mobile swipe/pinch
  const touchStartRef = useRef<{ x: number; y: number; distance: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - potential pan or swipe
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, distance: 0 };
    } else if (e.touches.length === 2) {
      // Two touches - pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        distance: Math.sqrt(dx * dx + dy * dy),
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    if (e.touches.length === 1 && scale > 1) {
      // Pan
      e.preventDefault();
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      touchStartRef.current.x = e.touches[0].clientX;
      touchStartRef.current.y = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const scaleChange = distance / touchStartRef.current.distance;
      setScale((prev) => Math.min(Math.max(prev * scaleChange, 1), 4));
      touchStartRef.current.distance = distance;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowLeft" && hasPrev && onPrev) {
        e.preventDefault();
        onPrev();
      }
      if (e.key === "ArrowRight" && hasNext && onNext) {
        e.preventDefault();
        onNext();
      }
      if (e.key === " ") {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      }
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setScale((prev) => Math.min(prev + 0.25, 4));
      }
      if (e.key === "-") {
        e.preventDefault();
        setScale((prev) => Math.max(prev - 0.25, 1));
      }
      if (e.key === "0") {
        e.preventDefault();
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    if (item) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose, onPrev, onNext, hasPrev, hasNext]);

  // Reset zoom/pan when item changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });

    // Measure design orientation so landscape works get the full modal width
    setLandscape(null);
    if (item?.imageUrl) {
      const img = new window.Image();
      img.onload = () => setLandscape(img.naturalWidth > img.naturalHeight);
      img.onerror = () => setLandscape(false);
      img.src = item.imageUrl;
    } else {
      setLandscape(false);
    }
  }, [item?.id, item?.imageUrl]);

  const transformStyle = {
    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
    transformOrigin: "center center",
    transition: isPanning ? "none" : "transform 0.1s ease-out",
  };

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#07070A]/85 backdrop-blur-xl"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
            className={`relative z-10 w-full max-w-4xl max-h-[90vh] bg-[#141417] border border-white/15 rounded-3xl md:rounded-4xl shadow-2xl overflow-hidden ${landscape === true ? "flex flex-col" : "flex flex-col md:flex-row"} ${isFullscreen ? "fixed inset-0 max-w-full max-h-full rounded-none border-none" : ""}`}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#0B0B0D]/80 hover:bg-[#CCFF00] text-[#F4F4F0] hover:text-[#0B0B0D] border border-white/10 flex items-center justify-center transition-all duration-200"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="absolute top-4 right-16 z-20 w-10 h-10 rounded-full bg-[#0B0B0D]/80 hover:bg-[#CCFF00] text-[#F4F4F0] hover:text-[#0B0B0D] border border-white/10 flex items-center justify-center transition-all duration-200"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            {/* Nav Buttons */}
            {hasPrev && onPrev && (
              <button
                onClick={onPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#0B0B0D]/80 hover:bg-[#CCFF00] text-[#F4F4F0] hover:text-[#0B0B0D] border border-white/10 flex items-center justify-center transition-all duration-200 md:block hidden"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {hasNext && onNext && (
              <button
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#0B0B0D]/80 hover:bg-[#CCFF00] text-[#F4F4F0] hover:text-[#0B0B0D] border border-white/10 flex items-center justify-center transition-all duration-200 md:block hidden"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Left / Top Visual Canvas */}
            <div
              ref={imageRef}
              className={`${
                landscape === true
                  ? "w-full h-[40vh] md:h-[52vh] border-b border-white/[0.08]"
                  : "md:w-1/2 min-h-[260px] sm:min-h-[320px] md:min-h-[480px] border-b md:border-b-0 md:border-r border-white/[0.08]"
              } bg-[#0B0B0D] flex items-center justify-center relative overflow-hidden`}
              style={{ cursor: scale > 1 ? "grab" : "default" }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div style={transformStyle} className="w-full h-full flex items-center justify-center">
                <PortfolioGraphic item={item} className="w-full h-full" isHero />
              </div>

              {/* Zoom indicator */}
              {scale > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#0B0B0D]/90 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 text-xs font-mono text-[#CCFF00]">
                  {Math.round(scale * 100)}%
                </div>
              )}
            </div>

            {/* Right / Content Details */}
            <div className={`${landscape === true ? "w-full" : "md:w-1/2"} min-h-0 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto`}>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-mono font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className="text-xs text-[#6B6B72] flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.year}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-[#F4F4F0] mb-3">
                  {item.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-[#A8A8AF] mb-6 pb-4 border-b border-white/10">
                  <Building2 className="w-4 h-4 text-[#CCFF00]" />
                  <span>
                    Client: <strong className="text-[#F4F4F0]">{item.clientName}</strong> (
                    {item.businessType})
                  </span>
                </div>

                <p className="text-sm text-[#A8A8AF] leading-relaxed mb-6">
                  {item.description}
                </p>

                {/* Tag Pills */}
                <div className="mb-6">
                  <div className="text-xs font-mono text-[#6B6B72] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>Specifications & Formats</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-[#0B0B0D] border border-white/[0.08] text-[11px] text-[#A8A8AF]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href={`/request?category=${encodeURIComponent(item.category)}&ref=${encodeURIComponent(
                    item.title
                  )}`}
                  onClick={onClose}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-full text-xs font-bold text-[#0B0B0D] bg-[#CCFF00] hover:bg-[#B8E600] transition-colors shadow-glow-lime flex items-center justify-center gap-2"
                >
                  <span>Order Similar Design</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={`/work/${item.id}`}
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-full text-xs text-[#CCFF00] hover:text-[#0B0B0D] bg-[#0B0B0D] hover:bg-[#CCFF00] border border-[#CCFF00]/30 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Full Case Study</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-full text-xs text-[#A8A8AF] hover:text-white bg-[#0B0B0D] hover:bg-white/5 border border-white/10 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Keyboard hints */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[10px] font-mono text-[#6B6B72] opacity-60 md:hidden">
              <span className="flex items-center gap-1"><ChevronLeft className="w-3 h-3" /> Prev</span>
              <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> Next</span>
              <span>Esc Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};