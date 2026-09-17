"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "text",
  width,
  height,
  lines = 1,
}) => {
  const baseStyle: React.CSSProperties = {
    background: "linear-gradient(90deg, #141417 25%, #1B1B20 50%, #141417 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
    borderRadius: variant === "circular" ? "50%" : variant === "text" ? "4px" : "12px",
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={className} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            style={{
              ...baseStyle,
              width: i === lines - 1 ? (width || "60%") : (width || "100%"),
              height: height || "12px",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        width: width || "100%",
        height: height || (variant === "text" ? "12px" : "200px"),
      }}
    />
  );
};

export const RequestCardSkeleton: React.FC = () => (
  <div className="rounded-2xl bg-[#141417] border border-white/[0.08] p-5 animate-pulse">
    <div className="flex items-center justify-between gap-4 mb-4">
      <Skeleton variant="text" width="30%" height="16px" />
      <Skeleton variant="text" width="80px" height="12px" />
    </div>
    <Skeleton variant="text" width="40%" height="20px" className="mb-2" />
    <Skeleton variant="text" width="60%" height="12px" className="mb-4" />
    <div className="flex items-center gap-2">
      <Skeleton variant="text" width="80px" height="12px" />
      <Skeleton variant="text" width="100px" height="12px" />
    </div>
  </div>
);

export const PortfolioItemSkeleton: React.FC = () => (
  <div className="group relative rounded-3xl border border-white/[0.08] bg-surface overflow-hidden animate-pulse">
    <Skeleton variant="rectangular" className="aspect-[4/3]" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D]/85 via-[#0B0B0D]/10 to-transparent" />
    <div className="absolute inset-x-0 bottom-0 p-5 space-y-2">
      <Skeleton variant="text" width="80px" height="14px" />
      <Skeleton variant="text" width="60%" height="18px" />
    </div>
  </div>
);

export const WorkPageSkeleton: React.FC = () => (
  <div className="pt-32 pb-24 md:pt-40 md:pb-32 px-5 md:px-8 max-w-7xl mx-auto animate-pulse space-y-10">
    <Skeleton variant="text" width="20%" height="16px" />
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16">
      <div className="space-y-6">
        <Skeleton variant="text" width="40%" height="16px" />
        <Skeleton variant="text" width="80%" height="48px" lines={2} />
        <Skeleton variant="text" width="60%" height="16px" />
        <div className="pt-8 border-t border-white/[0.08] space-y-4">
          <Skeleton variant="text" width="30%" height="12px" />
          <div className="flex flex-wrap gap-2">
            <Skeleton variant="text" width="80px" height="10px" />
            <Skeleton variant="text" width="100px" height="10px" />
            <Skeleton variant="text" width="90px" height="10px" />
          </div>
        </div>
      </div>
      <Skeleton variant="rectangular" className="rounded-3xl min-h-[440px]" />
    </div>
    <Skeleton variant="text" width="20%" height="12px" />
    <Skeleton variant="text" width="100%" height="20px" lines={4} />
    <div className="space-y-4">
      <Skeleton variant="text" width="30%" height="16px" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <PortfolioItemSkeleton />
        <PortfolioItemSkeleton />
        <PortfolioItemSkeleton />
      </div>
    </div>
  </div>
);

export const AdminPageSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton variant="text" width="30%" height="28px" />
      <Skeleton variant="rectangular" width="180px" height="44px" />
    </div>
    <div className="rounded-2xl bg-[#141417] border border-white/[0.08] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.08]">
              <th className="px-5 py-3 text-left"><Skeleton variant="text" width="80%" height="12px" /></th>
              <th className="px-5 py-3 text-left"><Skeleton variant="text" width="60%" height="12px" /></th>
              <th className="px-5 py-3 text-left"><Skeleton variant="text" width="50%" height="12px" /></th>
              <th className="px-5 py-3 text-left"><Skeleton variant="text" width="70%" height="12px" /></th>
              <th className="px-5 py-3 text-left"><Skeleton variant="text" width="80%" height="12px" /></th>
              <th className="px-5 py-3 text-left"><Skeleton variant="text" width="50%" height="12px" /></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-white/[0.04]">
                <td className="px-5 py-4"><Skeleton variant="text" width="100px" height="14px" /></td>
                <td className="px-5 py-4"><Skeleton variant="text" width="80%" height="14px" /></td>
                <td className="px-5 py-4"><Skeleton variant="text" width="80px" height="14px" /></td>
                <td className="px-5 py-4"><Skeleton variant="text" width="100%" height="14px" lines={2} /></td>
                <td className="px-5 py-4"><Skeleton variant="text" width="80px" height="14px" /></td>
                <td className="px-5 py-4"><Skeleton variant="rectangular" width="80px" height="32px" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export const ClientPortalSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton variant="text" width="30%" height="28px" />
      <Skeleton variant="rectangular" width="180px" height="44px" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <RequestCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const RequestDetailSkeleton: React.FC = () => (
  <div className="pt-32 pb-24 md:pt-40 md:pb-32 px-6 max-w-4xl mx-auto animate-pulse space-y-8">
    <div className="space-y-4">
      <Skeleton variant="text" width="80px" height="16px" />
      <Skeleton variant="text" width="60%" height="36px" />
      <Skeleton variant="text" width="40%" height="16px" />
    </div>
    <Skeleton variant="rectangular" className="rounded-3xl min-h-[120px] p-7" />
    <Skeleton variant="rectangular" className="rounded-3xl min-h-[120px] p-7" />
    <Skeleton variant="rectangular" className="rounded-3xl min-h-[120px] p-7" />
    <Skeleton variant="rectangular" className="rounded-3xl min-h-[120px] p-7" />
    <Skeleton variant="rectangular" className="rounded-3xl min-h-[400px] p-7" />
    <Skeleton variant="rectangular" className="rounded-3xl min-h-[200px] p-7" />
    <Skeleton variant="rectangular" className="rounded-3xl min-h-[200px] p-7" />
  </div>
);