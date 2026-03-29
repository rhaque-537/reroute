"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, DollarSign, Scale, Search, Clock, XCircle,
  TrendingUp, Bus, Train, Car, Star, Shield, Calculator,
  BarChart3, TrendingDown, Users, MessageCircle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

type DemoStep =
  | "landing"
  | "filling"
  | "dashboard-green"
  | "dashboard-yellow"
  | "dashboard-red"
  | "options"
  | "rights-loading"
  | "rights-result"
  | "analytics"
  | "chat"
  | "finale";

const TIMELINE: { step: DemoStep; at: number }[] = [
  { step: "landing", at: 0 },
  { step: "filling", at: 3000 },
  { step: "dashboard-green", at: 8000 },
  { step: "dashboard-yellow", at: 13000 },
  { step: "dashboard-red", at: 18000 },
  { step: "options", at: 23000 },
  { step: "rights-loading", at: 30000 },
  { step: "rights-result", at: 33000 },
  { step: "analytics", at: 39000 },
  { step: "chat", at: 44000 },
  { step: "finale", at: 50000 },
];

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5 },
};

const slideUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const AIRPORT_DATA = [
  { airport: "JFK", rate: 18.2 },
  { airport: "LAX", rate: 14.7 },
  { airport: "ORD", rate: 22.1 },
  { airport: "DFW", rate: 11.3 },
  { airport: "ATL", rate: 16.8 },
];

const DISRUPTION_DATA = [
  { name: "TSA", value: 34 },
  { name: "Weather", value: 28 },
  { name: "Mechanical", value: 22 },
  { name: "Other", value: 16 },
];

const PIE_COLORS = ["#06d6a0", "#fbbf24", "#ef4444", "#64748b"];

const options = [
  { icon: Plane, type: "Next available flight", price: 289, arrival: "11:00 PM", duration: "4h", badge: null },
  { icon: Bus, type: "Greyhound + flight combo", price: 97, arrival: "9:00 PM", duration: "8h", badge: "BEST VALUE" },
  { icon: Train, type: "Amtrak", price: 65, arrival: "Next AM", duration: "14h", badge: null },
  { icon: Car, type: "Rideshare split", price: 120, arrival: "10:00 PM", duration: "6h", badge: null },
];

const demoFeed = [
  { text: "Monitoring flight status...", icon: "🔍" },
  { text: "⚠️ Delay detected — scanning alternatives", icon: "⚠️" },
  { text: "Found 4 rebooking options", icon: "✅" },
  { text: "You're owed compensation under DOT rules", icon: "⚖️" },
];

export default function DemoPage() {
  const [step, setStep] = useState<DemoStep>("landing");
  const [formOrigin, setFormOrigin] = useState("");
  const [formDest, setFormDest] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formFlight, setFormFlight] = useState("");
  const [formBudget, setFormBudget] = useState(200);
  const [savings, setSavings] = useState(0);
  const [feedItems, setFeedItems] = useState<typeof demoFeed>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"warning" | "error">("warning");
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [typingText, setTypingText] = useState("");
  const [reasoningVisible, setReasoningVisible] = useState(false);

  const animateSavings = useCallback((target: number) => {
    let current = 0;
    const s = target / 30;
    const iv = setInterval(() => {
      current += s;
      if (current >= target) { current = target; clearInterval(iv); }
      setSavings(Math.round(current));
    }, 50);
  }, []);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    TIMELINE.forEach(({ step: s, at }) => {
      timers.push(setTimeout(() => setStep(s), at));
    });

    // Form filling animation (starts at 3s)
    const typeField = (setter: (v: string) => void, value: string, startAt: number) => {
      for (let i = 0; i <= value.length; i++) {
        timers.push(setTimeout(() => setter(value.slice(0, i)), startAt + i * 80));
      }
    };
    typeField(setFormOrigin, "JFK", 3200);
    typeField(setFormDest, "DFW", 4200);
    timers.push(setTimeout(() => setFormDate("2026-04-02"), 5200));
    typeField(setFormFlight, "AA 1247", 5600);
    timers.push(setTimeout(() => setFormBudget(150), 6800));

    // Dashboard feed items
    timers.push(setTimeout(() => setFeedItems([demoFeed[0]]), 9000));
    timers.push(setTimeout(() => {
      setFeedItems(p => [...p, demoFeed[1]]);
      setToastMsg("⚠️ DELAYED: Flight AA 1247");
      setToastType("warning");
    }, 13000));
    timers.push(setTimeout(() => setToastMsg(null), 16000));
    timers.push(setTimeout(() => {
      setFeedItems(p => [...p, demoFeed[2]]);
      setToastMsg("⚠️ CANCELED: Flight AA 1247");
      setToastType("error");
      animateSavings(247);
    }, 18000));
    timers.push(setTimeout(() => {
      setFeedItems(p => [...p, demoFeed[3]]);
    }, 20000));
    timers.push(setTimeout(() => setToastMsg(null), 22000));

    // Rights reasoning reveal
    timers.push(setTimeout(() => setReasoningVisible(true), 34000));

    // Chat messages
    const agentMsg = "Hey — I detected your flight AA 1247 was just canceled. I've already found you 4 alternatives. Want me to walk you through them, or should I just book the cheapest option?";
    timers.push(setTimeout(() => setChatMessages([{ role: "assistant", content: agentMsg }]), 44500));
    timers.push(setTimeout(() => setChatMessages(p => [...p, { role: "user", content: "Book the cheapest one" }]), 46500));

    const resp = "Done! I've booked the Greyhound + short flight combo for $97. You'll arrive at DFW by 9pm — plenty of time for your Tuesday morning shift. That's $192 saved.";
    let partial = "";
    for (let i = 0; i < resp.length; i++) {
      timers.push(setTimeout(() => {
        partial = resp.slice(0, i + 1);
        setTypingText(partial);
      }, 47500 + i * 20));
    }

    return () => timers.forEach(clearTimeout);
  }, [animateSavings]);

  const statusForDashboard = step === "dashboard-green" ? "on-time" : step === "dashboard-yellow" ? "delayed" : "canceled";
  const statusCfg = {
    "on-time": { color: "bg-green-500", text: "ON TIME", icon: Plane },
    delayed: { color: "bg-amber", text: "DELAYED", icon: Clock },
    canceled: { color: "bg-disruption", text: "CANCELED", icon: XCircle },
  }[statusForDashboard];
  const StatusIcon = statusCfg.icon;

  return (
    <div className="relative min-h-screen bg-navy overflow-hidden">
      {/* Toast overlay */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl font-semibold text-sm shadow-2xl ${
              toastType === "error" ? "bg-disruption text-white" : "bg-amber text-navy"
            }`}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-navy-lighter">
        <motion.div
          className="h-full bg-teal"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 55, ease: "linear" }}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* ========== LANDING ========== */}
        {(step === "landing" || step === "filling") && (
          <motion.div key="landing" {...fade} className="px-5 pt-10 pb-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal flex items-center justify-center">
                  <Plane size={22} className="text-navy" />
                </div>
                <h1 className="text-2xl font-bold">ReRoute</h1>
              </div>
              <h2 className="text-3xl font-extrabold leading-tight mb-2">Never Miss a Shift.</h2>
              <p className="text-gray-400 text-sm">Your AI travel agent that fights for you when flights fall apart.</p>
            </div>

            <div className="space-y-3 mb-6">
              <input readOnly value={formOrigin} placeholder="Origin city (e.g. JFK)" className="w-full bg-navy-light border border-navy-lighter rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-teal transition-colors" />
              <input readOnly value={formDest} placeholder="Destination city (e.g. DFW)" className="w-full bg-navy-light border border-navy-lighter rounded-xl px-4 py-3 text-white placeholder-gray-500" />
              <input readOnly value={formDate} placeholder="Travel date" className="w-full bg-navy-light border border-navy-lighter rounded-xl px-4 py-3 text-white placeholder-gray-500" />
              <input readOnly value={formFlight} placeholder="Flight number (optional)" className="w-full bg-navy-light border border-navy-lighter rounded-xl px-4 py-3 text-white placeholder-gray-500" />
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Budget</span>
                  <span className="text-teal font-semibold">${formBudget}</span>
                </div>
                <div className="w-full h-2 bg-navy-lighter rounded-full">
                  <motion.div className="h-full bg-teal rounded-full" animate={{ width: `${((formBudget - 50) / 450) * 100}%` }} />
                </div>
              </div>
            </div>

            <motion.button
              animate={step === "filling" && formFlight.length >= 7 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-full bg-teal text-navy font-bold text-lg py-4 rounded-xl min-h-[44px]"
            >
              Protect My Trip
            </motion.button>

            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: DollarSign, title: "Saves You Money" },
                { icon: Scale, title: "Knows Your Rights" },
                { icon: Search, title: "Finds Every Option" },
              ].map(({ icon: Icon, title }) => (
                <div key={title} className="bg-navy-light border border-navy-lighter rounded-xl p-3 text-center">
                  <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center mx-auto mb-1">
                    <Icon size={16} className="text-teal" />
                  </div>
                  <p className="text-[10px] font-semibold">{title}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ========== DASHBOARD ========== */}
        {(step === "dashboard-green" || step === "dashboard-yellow" || step === "dashboard-red") && (
          <motion.div key="dashboard" {...fade} className="px-5 pt-8">
            <h1 className="text-xl font-bold mb-5">Trip Monitor</h1>

            <div className="bg-navy-light border border-navy-lighter rounded-2xl p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Plane size={20} className="text-teal" />
                  <div>
                    <p className="font-bold text-lg">JFK → DFW</p>
                    <p className="text-sm text-gray-400">AA 1247 · 2026-04-02</p>
                  </div>
                </div>
                <motion.div
                  key={statusForDashboard}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`${statusCfg.color} px-3 py-1.5 rounded-full flex items-center gap-1.5`}
                >
                  <StatusIcon size={14} className={statusForDashboard === "delayed" ? "text-navy" : "text-white"} />
                  <span className={`text-xs font-bold ${statusForDashboard === "delayed" ? "text-navy" : "text-white"}`}>
                    {statusCfg.text}
                  </span>
                </motion.div>
              </div>
            </div>

            <div className="bg-navy-light border border-navy-lighter rounded-2xl p-5 mb-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Agent Activity</h3>
              <div className="space-y-3">
                <AnimatePresence>
                  {feedItems.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <p className="text-sm text-gray-300">{item.text}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {feedItems.length === 0 && <p className="text-sm text-gray-500">Waiting for activity...</p>}
              </div>
            </div>

            <motion.div className="bg-navy-light border border-navy-lighter rounded-2xl p-5 mb-4" {...slideUp}>
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
          </motion.div>
        )}

        {/* ========== OPTIONS ========== */}
        {step === "options" && (
          <motion.div key="options" {...fade} className="px-5 pt-8 pb-8">
            <motion.div {...slideUp} className="bg-teal/10 border border-teal/30 rounded-xl px-4 py-3 mb-5">
              <p className="text-teal text-sm font-semibold text-center">You save $192 vs rebooking the same airline</p>
            </motion.div>
            <h1 className="text-xl font-bold mb-4">Rebooking Options</h1>
            <div className="overflow-x-auto -mx-5 px-5 pb-2">
              <div className="flex gap-3" style={{ minWidth: "max-content" }}>
                {options.map((opt, i) => {
                  const Icon = opt.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="bg-navy-light border border-navy-lighter rounded-2xl p-5 flex flex-col w-[185px] shrink-0 relative"
                    >
                      {opt.badge && (
                        <div className="absolute -top-2 -right-2 bg-teal text-navy text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Star size={10} fill="currentColor" />{opt.badge}
                        </div>
                      )}
                      <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center mb-3">
                        <Icon size={20} className="text-teal" />
                      </div>
                      <p className="text-[10px] text-gray-400 mb-1">{opt.type}</p>
                      <p className="text-2xl font-extrabold mb-2">${opt.price}</p>
                      <p className="text-[10px] text-gray-400">Arrives: {opt.arrival}</p>
                      <p className="text-[10px] text-gray-400 mb-3">{opt.duration} travel</p>
                      <button className="w-full bg-teal/10 text-teal font-semibold text-xs py-2 rounded-xl min-h-[44px]">Book This</button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ========== RIGHTS ========== */}
        {(step === "rights-loading" || step === "rights-result") && (
          <motion.div key="rights" {...fade} className="px-5 pt-8 pb-8">
            <div className="flex items-center gap-2 mb-5">
              <Shield size={20} className="text-teal" />
              <h1 className="text-xl font-bold">Know Your Rights</h1>
            </div>

            <div className="bg-navy-light border border-navy-lighter rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Calculator size={18} className="text-teal" />
                <h2 className="font-bold text-sm">Compensation Calculator</h2>
              </div>
              <div className="space-y-2 text-xs text-gray-400">
                <p>Disruption: <span className="text-white">Cancellation</span></p>
                <p>Delay: <span className="text-white">4 hours</span></p>
                <p>Route: <span className="text-white">Domestic (JFK → DFW)</span></p>
                <p>Ticket: <span className="text-white">$289</span></p>
              </div>
              {step === "rights-loading" && (
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="mt-4 text-teal text-sm font-semibold">
                  Analyzing your rights...
                </motion.div>
              )}
            </div>

            <AnimatePresence>
              {step === "rights-result" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="bg-teal/10 border border-teal/30 rounded-2xl p-5 text-center">
                    <p className="text-sm text-teal mb-1">You are owed:</p>
                    <p className="text-4xl font-extrabold text-teal">$650</p>
                    <p className="text-xs text-gray-400 mt-2">14 CFR Part 259 • DOT Automatic Refunds Rule</p>
                  </div>

                  <div className="bg-navy-light border border-navy-lighter rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">K2 Reasoning Chain</span>
                    </div>
                    <AnimatePresence>
                      {reasoningVisible && (
                        <motion.pre
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          className="text-[10px] text-gray-400 whitespace-pre-wrap leading-relaxed font-sans overflow-hidden"
                        >
{`Step 1: Flight AA 1247 (JFK→DFW) was canceled.
This is a controllable cancellation — airline bears full responsibility.

Step 2: Under 14 CFR Part 259 and the 2024 DOT Automatic Refunds Rule:
• Passenger entitled to full cash refund ($289 ticket price)
• Free rebooking on next available flight required
• Meal vouchers required (delay > 3 hours)

Step 3: Additional compensation calculation:
• 200% of one-way fare for 1-2 hour arrival delay = $578
• Capped at $775 for domestic flights
• With expenses: total recovery ≈ $650

Step 4: Airline must provide written notice of rights.`}
                        </motion.pre>
                      )}
                    </AnimatePresence>
                    <p className="text-[10px] text-teal/60 mt-2">Powered by K2 Think V2 Reasoning Engine</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ========== ANALYTICS ========== */}
        {step === "analytics" && (
          <motion.div key="analytics" {...fade} className="px-5 pt-8 pb-8">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 size={20} className="text-teal" />
              <h1 className="text-lg font-bold">TSA Crisis Impact Dashboard</h1>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { icon: TrendingDown, val: "12,847", label: "Canceled", color: "text-disruption" },
                { icon: DollarSign, val: "$340", label: "Avg loss", color: "text-amber" },
                { icon: Users, val: "$247", label: "Avg saved", color: "text-teal" },
              ].map((s, i) => {
                const I = s.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-navy-light border border-navy-lighter rounded-xl p-2.5 text-center">
                    <I size={16} className={`${s.color} mx-auto mb-1`} />
                    <p className={`text-base font-extrabold ${s.color}`}>{s.val}</p>
                    <p className="text-[9px] text-gray-400">{s.label}</p>
                  </motion.div>
                );
              })}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-navy-light border border-navy-lighter rounded-2xl p-3 mb-3">
              <h3 className="text-xs font-semibold mb-2">Cancellation Rate by Airport</h3>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={AIRPORT_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="airport" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} unit="%" />
                  <Bar dataKey="rate" fill="#06d6a0" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-navy-light border border-navy-lighter rounded-2xl p-3">
              <h3 className="text-xs font-semibold mb-2">Disruption Causes</h3>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={DISRUPTION_DATA} cx="50%" cy="50%" outerRadius={50} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={false} fontSize={9}>
                    {DISRUPTION_DATA.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i]} />))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
            <p className="text-[9px] text-gray-500 text-center mt-2">Analytics powered by Hex</p>
          </motion.div>
        )}

        {/* ========== CHAT ========== */}
        {step === "chat" && (
          <motion.div key="chat" {...fade} className="px-5 pt-8 pb-8">
            <div className="flex items-center gap-2 mb-5">
              <MessageCircle size={20} className="text-teal" />
              <h1 className="text-xl font-bold">ReRoute Chat</h1>
            </div>
            <div className="space-y-3">
              {chatMessages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user" ? "bg-teal text-navy rounded-br-md" : "bg-navy-light border border-navy-lighter text-gray-200 rounded-bl-md"
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {typingText && chatMessages.length >= 2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed bg-navy-light border border-navy-lighter text-gray-200">
                    {typingText}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ========== FINALE ========== */}
        {step === "finale" && (
          <motion.div
            key="finale"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center min-h-screen px-8"
          >
            <div className="bg-navy-light border border-teal/30 rounded-3xl p-8 text-center max-w-[380px] w-full">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="w-16 h-16 rounded-2xl bg-teal flex items-center justify-center mx-auto mb-5"
              >
                <Plane size={30} className="text-navy" />
              </motion.div>
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-2xl font-extrabold mb-3">
                ReRoute saved this worker <span className="text-teal">$192</span> and their <span className="text-teal">Tuesday shift</span>.
              </motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-gray-400 text-sm mb-6">
                Three AI models. One unified gateway. Zero missed shifts.
              </motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="space-y-2">
                <p className="text-xs text-gray-500">Powered by Lava AI Gateway</p>
                <p className="text-xs text-gray-500">Claude Sonnet · K2 Think V2 · Hermes 3</p>
                <p className="text-xs text-teal font-semibold mt-3">Built at YHack 2026</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
