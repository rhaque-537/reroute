"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingDown, Users, DollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/Skeleton";

const COLORS = ["#06d6a0", "#fbbf24", "#ef4444", "#64748b"];

interface AnalyticsData {
  airportCancellations: { airport: string; rate: number }[];
  costTrends: { date: string; cost: number }[];
  disruptionCauses: { name: string; value: number }[];
  stats: {
    totalCanceled: number;
    avgLoss: number;
    avgSaved: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/analytics");
        const json = await res.json();
        setData(json);
      } catch {
        setData({
          airportCancellations: [
            { airport: "JFK", rate: 18.2 },
            { airport: "LAX", rate: 14.7 },
            { airport: "ORD", rate: 22.1 },
            { airport: "DFW", rate: 11.3 },
            { airport: "ATL", rate: 16.8 },
          ],
          costTrends: [
            { date: "Mar 1", cost: 245 },
            { date: "Mar 5", cost: 267 },
            { date: "Mar 9", cost: 312 },
            { date: "Mar 13", cost: 289 },
            { date: "Mar 17", cost: 334 },
            { date: "Mar 21", cost: 356 },
            { date: "Mar 25", cost: 378 },
            { date: "Mar 29", cost: 341 },
          ],
          disruptionCauses: [
            { name: "TSA Staffing", value: 34 },
            { name: "Weather", value: 28 },
            { name: "Mechanical", value: 22 },
            { name: "Other", value: 16 },
          ],
          stats: { totalCanceled: 12847, avgLoss: 340, avgSaved: 247 },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="px-5 pt-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="px-5 pt-8 pb-8">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 size={22} className="text-teal" />
        <h1 className="text-xl font-bold">TSA Crisis Impact Dashboard</h1>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {
            icon: TrendingDown,
            value: data.stats.totalCanceled.toLocaleString(),
            label: "Flights canceled",
            color: "text-disruption",
          },
          {
            icon: DollarSign,
            value: `$${data.stats.avgLoss}`,
            label: "Avg worker loss",
            color: "text-amber",
          },
          {
            icon: Users,
            value: `$${data.stats.avgSaved}`,
            label: "Avg ReRoute saves",
            color: "text-teal",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-navy-light border border-navy-lighter rounded-xl p-3 text-center"
            >
              <Icon size={18} className={`${stat.color} mx-auto mb-1`} />
              <p className={`text-lg font-extrabold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-gray-400">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-navy-light border border-navy-lighter rounded-2xl p-4 mb-4"
      >
        <h3 className="text-sm font-semibold mb-3">Cancellation Rate by Airport</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.airportCancellations}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="airport" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#06d6a0" }}
            />
            <Bar dataKey="rate" fill="#06d6a0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-navy-light border border-navy-lighter rounded-2xl p-4 mb-4"
      >
        <h3 className="text-sm font-semibold mb-3">Average Rebooking Cost (30 Days)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.costTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} unit="$" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#fbbf24" }}
            />
            <Line type="monotone" dataKey="cost" stroke="#fbbf24" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-navy-light border border-navy-lighter rounded-2xl p-4 mb-4"
      >
        <h3 className="text-sm font-semibold mb-3">Disruption Causes</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data.disruptionCauses}
              cx="50%"
              cy="50%"
              outerRadius={70}
              dataKey="value"
              label={({ name, value }) => `${name} ${value}%`}
              labelLine={false}
              fontSize={10}
            >
              {data.disruptionCauses.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      <p className="text-[10px] text-gray-500 text-center mt-4">
        Analytics powered by Hex
      </p>
    </div>
  );
}
