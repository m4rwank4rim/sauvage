"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { BadgeCheck, Building2, Landmark, Timer } from "lucide-react";

type StatsData = {
  requests: number;
  payments: number;
  commissions: number;
  clients: number;
  funded: number;
  avgTurnaroundHours: number | null;
};

const ICONS = [BadgeCheck, Building2, Landmark, Timer];

const CountUp: React.FC<{ value: string }> = ({ value }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState("0");
  const match = value.match(/^([^\d]*)(\d+)(.*)$/);
  const prefix = match?.[1] ?? value;
  const number = match ? parseInt(match[2], 10) : 0;
  const suffix = match?.[3] ?? "";

  useEffect(() => {
    if (!inView) {
      setDisplay(number ? "0" : value);
      return;
    }
    if (number === 0) {
      setDisplay(value);
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const current = Math.round(ease(t) * number);
      setDisplay(current.toLocaleString());
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, number, value]);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
};

const toStatRows = (d: StatsData) => [
  {
    value: `${d.commissions}`,
    label: "Commissions Delivered",
    description: "Paid & confirmed via Fleeca receipts.",
  },
  {
    value: `${d.clients}`,
    label: "Business Clients",
    description: "Distinct enterprises served across San Andreas.",
  },
  {
    value: `$${d.funded.toLocaleString()}`,
    label: "Total Funded",
    description: "In-game dollars safely moved through the Fleeca gateway.",
  },
  {
    value: d.avgTurnaroundHours != null ? `${d.avgTurnaroundHours}h` : "—",
    label: "Average Turnaround",
    description: "From deposit confirmation to paid invoice.",
  },
];

export const StatsBar: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json?.data) setStats(json.data as StatsData);
      })
      .catch(() => {
        if (active) setStats({ requests: 0, payments: 0, commissions: 0, clients: 0, funded: 0, avgTurnaroundHours: null });
      });
    return () => {
      active = false;
    };
  }, []);

  if (!stats) {
    return (
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-14 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x divide-white/[0.08] animate-pulse">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="py-8 px-2 sm:px-6 lg:px-10">
              <div className="h-8 w-8 rounded-[10px] bg-white/[0.06] mb-6" />
              <div className="h-10 w-24 rounded bg-white/[0.08]" />
              <div className="h-4 w-32 rounded bg-white/[0.06] mt-4" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const rows = toStatRows(stats);

  return (
    <section className="max-w-7xl mx-auto px-5 md:px-8 py-14 md:py-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x divide-white/[0.08]">
        {rows.map((stat, idx) => {
          const Icon = ICONS[idx % ICONS.length];
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="group relative py-8 px-2 sm:px-6 lg:px-10 first:pl-2 lg:first:pl-0 border-b border-white/[0.06] sm:border-b-0"
            >
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 rounded-[10px] border border-white/[0.08] bg-white/[0.03] flex items-center justify-center transition-colors duration-300 group-hover:border-electric-lime/40 group-hover:bg-electric-lime/[0.06]">
                  <Icon className="w-4 h-4 text-text-secondary transition-colors duration-300 group-hover:text-electric-lime" />
                </div>
                <span className="h-px flex-1 bg-white/[0.06]" />
              </div>
              <div className="font-display font-medium text-4xl md:text-5xl tracking-tight text-text-primary leading-none">
                <CountUp value={stat.value} />
              </div>
              <h2 className="mt-3.5 text-sm font-semibold text-text-primary tracking-wide">
                {stat.label}
              </h2>
              <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">
                {stat.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};