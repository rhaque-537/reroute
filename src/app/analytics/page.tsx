"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#06d6a0", "#fbbf24", "#ef4444", "#64748b"];

// Data based on BTS Air Travel Consumer Reports, crisis-period elevated rates
const FALLBACK = {
  airportCancellations: [
    { airport: "ORD", rate: 8.4 }, { airport: "JFK", rate: 6.8 },
    { airport: "SFO", rate: 6.2 }, { airport: "DFW", rate: 4.5 }, { airport: "ATL", rate: 3.9 },
  ],
  costTrends: [
    { date: "Mar 1", cost: 285 }, { date: "Mar 5", cost: 310 }, { date: "Mar 9", cost: 345 },
    { date: "Mar 13", cost: 320 }, { date: "Mar 17", cost: 380 }, { date: "Mar 21", cost: 410 },
    { date: "Mar 25", cost: 435 }, { date: "Mar 29", cost: 395 },
  ],
  disruptionCauses: [
    { name: "Weather", value: 35 }, { name: "Staffing/ATC", value: 30 },
    { name: "Mechanical", value: 20 }, { name: "Other", value: 15 },
  ],
  stats: { totalCanceled: 140000, avgLoss: 280, avgSaved: 185 },
};

interface AnalyticsData {
  airportCancellations: { airport: string; rate: number }[];
  costTrends: { date: string; cost: number }[];
  disruptionCauses: { name: string; value: number }[];
  stats: { totalCanceled: number; avgLoss: number; avgSaved: number };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/analytics");
        setData(await res.json());
      } catch {
        setData(FALLBACK);
      }
    })();
  }, []);

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-6 md:px-8 pt-12">
        <div className="h-16 w-64 bg-white/5 rounded animate-pulse mb-8" />
        <div className="h-48 w-full bg-white/5 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-8 pt-12 md:pt-16 pb-16">
      {/* Header */}
      <div className="text-center mb-4">
        <p className="section-label mb-4">——— Analytics powered by Hex ———</p>
        <h1 className="font-serif text-[clamp(32px,5vw,48px)] leading-tight">
          TSA Crisis <span className="font-serif-italic">Impact</span>
        </h1>
      </div>

      <div className="dashed-divider my-10" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-8 text-center mb-4">
        {[
          { number: data.stats.totalCanceled.toLocaleString(), label: "Flights Canceled", color: "" },
          { number: `$${data.stats.avgLoss}`, label: "Avg Worker Loss", color: "" },
          { number: `$${data.stats.avgSaved}`, label: "Avg ReRoute Saves", color: "text-teal" },
        ].map(({ number, label, color }, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <p className={`font-serif text-[clamp(24px,4vw,40px)] mb-1 ${color}`}>{number}</p>
            <p className="section-label">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="dashed-divider my-10" />

      {/* Bar chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <p className="section-label mb-6">Cancellation Rate by Airport</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.airportCancellations}>
            <XAxis dataKey="airport" stroke="rgba(255,255,255,0.3)" fontSize={11} axisLine={false} tickLine={false} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} axisLine={false} tickLine={false} unit="%" />
            <Bar dataKey="rate" fill="rgba(255,255,255,0.15)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="dashed-divider my-10" />

      {/* Line chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <p className="section-label mb-6">Average Rebooking Cost — 30 Days</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data.costTrends}>
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} axisLine={false} tickLine={false} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} axisLine={false} tickLine={false} unit="$" />
            <Line type="monotone" dataKey="cost" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="dashed-divider my-10" />

      {/* Pie chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <p className="section-label mb-6">Disruption Causes</p>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie data={data.disruptionCauses} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" strokeWidth={0}>
                {data.disruptionCauses.map((_, i) => (<Cell key={i} fill={COLORS[i]} />))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {data.disruptionCauses.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-sm opacity-60">{d.name}</span>
                <span className="text-sm opacity-30">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="dashed-divider my-10" />
      <p className="text-[10px] opacity-20 text-center">Analytics powered by Hex</p>
    </div>
  );
}
