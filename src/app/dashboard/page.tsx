"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { fireToast } from "@/components/Toast";

type Status = "on-time" | "delayed" | "canceled";

const statusCfg: Record<Status, { color: string; text: string }> = {
  "on-time": { color: "bg-teal", text: "ON TIME" },
  delayed: { color: "bg-amber", text: "DELAYED" },
  canceled: { color: "bg-disruption", text: "CANCELED" },
};

const demoFeed = [
  { text: "Monitoring flight status", time: "10:14 AM" },
  { text: "Delay detected — scanning alternatives", time: "10:17 AM" },
  { text: "Found 4 rebooking options across all carriers", time: "10:18 AM" },
  { text: "You're owed compensation under DOT rules", time: "10:19 AM" },
];

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isDemo = searchParams.get("demo") === "true";
  const origin = searchParams.get("origin") || "JFK";
  const destination = searchParams.get("destination") || "DFW";
  const date = searchParams.get("date") || "2026-04-02";
  const flight = searchParams.get("flight") || "AA 1247";

  const [status, setStatus] = useState<Status>("on-time");
  const [feedItems, setFeedItems] = useState<typeof demoFeed>([]);
  const [savings, setSavings] = useState(0);

  const animateSavings = useCallback((target: number) => {
    let current = 0;
    const step = target / 40;
    const iv = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(iv); }
      setSavings(Math.round(current));
    }, 50);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!isDemo) {
      setFeedItems([demoFeed[0]]);
      animateSavings(247);
      return;
    }

    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setFeedItems([demoFeed[0]]), 500));
    timers.push(setTimeout(() => {
      setStatus("delayed");
      setFeedItems(p => [...p, demoFeed[1]]);
      fireToast("⚠️ DELAYED: Flight " + flight, "warning");
    }, 3000));
    timers.push(setTimeout(() => {
      setStatus("canceled");
      setFeedItems(p => [...p, demoFeed[2]]);
      fireToast("⚠️ CANCELED: Flight " + flight, "error");
      animateSavings(247);
    }, 6000));
    timers.push(setTimeout(() => setFeedItems(p => [...p, demoFeed[3]]), 8000));
    timers.push(setTimeout(() => router.push("/options"), 10000));
    return () => timers.forEach(clearTimeout);
  }, [isDemo, flight, router, animateSavings]);

  const cfg = statusCfg[status];

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 pt-12 md:pt-16">
      {/* Route header */}
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="font-serif text-[clamp(36px,6vw,56px)] leading-none">
          {origin} → {destination}
        </h1>
        <motion.span
          key={status}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`${cfg.color} ${status === "on-time" ? "text-navy" : "text-white"} text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full`}
        >
          {cfg.text}
        </motion.span>
      </div>
      <p className="text-sm opacity-40 mb-4">{flight} · {date}</p>

      <div className="dashed-divider mb-12 mt-8" />

      {/* Activity timeline */}
      <p className="section-label mb-8">——— Agent Activity ———</p>
      <div className="relative pl-8 mb-12">
        {/* Vertical dashed line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px border-l border-dashed border-white/15" />
        <div className="space-y-8">
          <AnimatePresence>
            {feedItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <div className="absolute -left-8 top-1.5 w-[15px] h-[15px] rounded-full border border-white/20 bg-navy flex items-center justify-center">
                  <div className={`w-[5px] h-[5px] rounded-full ${i === feedItems.length - 1 ? "bg-teal" : "bg-white/30"}`} />
                </div>
                <p className="text-sm opacity-80">{item.text}</p>
                <p className="text-xs opacity-30 mt-1">{item.time}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          {feedItems.length === 0 && <p className="text-sm opacity-30">Waiting for activity...</p>}
        </div>
      </div>

      <div className="dashed-divider mb-12" />

      {/* Savings */}
      <div className="text-center mb-12">
        <p className="section-label mb-3">Saved so far</p>
        <p className="font-serif text-[clamp(48px,10vw,72px)] leading-none text-teal">${savings}</p>
      </div>

      <div className="dashed-divider mb-12" />

      {/* CTA */}
      <div className="text-center pb-8">
        <button onClick={() => router.push("/chat")} className="pill-button">Talk to ReRoute</button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto px-6 md:px-8 pt-12">
        <div className="h-16 w-64 bg-white/5 rounded animate-pulse mb-8" />
        <div className="h-48 w-full bg-white/5 rounded animate-pulse" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
