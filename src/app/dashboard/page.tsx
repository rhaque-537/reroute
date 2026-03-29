"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Clock, XCircle, TrendingUp } from "lucide-react";
import { fireToast } from "@/components/Toast";
import { Skeleton } from "@/components/Skeleton";

type Status = "on-time" | "delayed" | "canceled";

const statusConfig = {
  "on-time": { color: "bg-green-500", text: "ON TIME", icon: Plane },
  delayed: { color: "bg-amber", text: "DELAYED", icon: Clock },
  canceled: { color: "bg-disruption", text: "CANCELED", icon: XCircle },
};

const demoFeed = [
  { text: "Monitoring flight status...", icon: "🔍", delay: 0 },
  { text: "⚠️ Delay detected — scanning alternatives", icon: "⚠️", delay: 3000 },
  { text: "Found 4 rebooking options", icon: "✅", delay: 6000 },
  { text: "You're owed compensation under DOT rules", icon: "⚖️", delay: 8000 },
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
  const [loading, setLoading] = useState(true);

  const animateSavings = useCallback((target: number) => {
    let current = 0;
    const step = target / 40;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setSavings(Math.round(current));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isDemo) {
      setFeedItems([demoFeed[0]]);
      animateSavings(247);
      return;
    }

    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => {
      setFeedItems([demoFeed[0]]);
    }, 500));

    timers.push(setTimeout(() => {
      setStatus("delayed");
      setFeedItems((prev) => [...prev, demoFeed[1]]);
      fireToast("⚠️ DELAYED: Flight " + flight, "warning");
    }, 3000));

    timers.push(setTimeout(() => {
      setStatus("canceled");
      setFeedItems((prev) => [...prev, demoFeed[2]]);
      fireToast("⚠️ CANCELED: Flight " + flight, "error");
      animateSavings(247);
    }, 6000));

    timers.push(setTimeout(() => {
      setFeedItems((prev) => [...prev, demoFeed[3]]);
    }, 8000));

    timers.push(setTimeout(() => {
      router.push("/options");
    }, 10000));

    return () => timers.forEach(clearTimeout);
  }, [isDemo, flight, router, animateSavings]);

  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  if (loading) {
    return (
      <div className="px-5 pt-8 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-8">
      <h1 className="text-xl font-bold mb-5">Trip Monitor</h1>

      <motion.div
        layout
        className="bg-navy-light border border-navy-lighter rounded-2xl p-5 mb-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Plane size={20} className="text-teal" />
            <div>
              <p className="font-bold text-lg">{origin} → {destination}</p>
              <p className="text-sm text-gray-400">{flight} · {date}</p>
            </div>
          </div>
          <motion.div
            key={status}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={`${cfg.color} px-3 py-1.5 rounded-full flex items-center gap-1.5`}
          >
            <StatusIcon size={14} className={status === "delayed" ? "text-navy" : "text-white"} />
            <span className={`text-xs font-bold ${status === "delayed" ? "text-navy" : "text-white"}`}>
              {cfg.text}
            </span>
          </motion.div>
        </div>
      </motion.div>

      <div className="bg-navy-light border border-navy-lighter rounded-2xl p-5 mb-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Agent Activity</h3>
        <div className="space-y-3">
          <AnimatePresence>
            {feedItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3"
              >
                <span className="text-lg mt-0.5">{item.icon}</span>
                <p className="text-sm text-gray-300">{item.text}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          {feedItems.length === 0 && (
            <p className="text-sm text-gray-500">Waiting for activity...</p>
          )}
        </div>
      </div>

      <motion.div
        className="bg-navy-light border border-navy-lighter rounded-2xl p-5 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Savings so far</p>
            <p className="text-3xl font-extrabold text-teal">${savings}</p>
          </div>
          <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center">
            <TrendingUp size={24} className="text-teal" />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[400px] px-5"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={() => router.push("/chat")}
          className="w-full bg-teal text-navy font-bold py-4 rounded-xl hover:bg-teal-dark transition-colors min-h-[44px]"
        >
          Talk to ReRoute
        </button>
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="px-5 pt-8 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
