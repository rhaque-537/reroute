"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

type DemoStep = "landing" | "filling" | "dashboard-green" | "dashboard-yellow" | "dashboard-red" | "options" | "rights-loading" | "rights-result" | "analytics" | "chat" | "finale";

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

const fade = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.8 } };

const AIRPORT_DATA = [{ airport: "ORD", rate: 8.4 }, { airport: "JFK", rate: 6.8 }, { airport: "SFO", rate: 6.2 }, { airport: "DFW", rate: 4.5 }, { airport: "ATL", rate: 3.9 }];
const DISRUPTION_DATA = [{ name: "Weather", value: 35 }, { name: "Staffing", value: 30 }, { name: "Mech", value: 20 }, { name: "Other", value: 15 }];
const PIE_COLORS = ["#06d6a0", "#fbbf24", "#ef4444", "#64748b"];

const feedItems = [
  { text: "Monitoring flight status", time: "10:14 AM" },
  { text: "Delay detected — scanning alternatives", time: "10:17 AM" },
  { text: "Found 4 rebooking options", time: "10:18 AM" },
  { text: "You're owed compensation under DOT rules", time: "10:19 AM" },
];

const options = [
  { emoji: "✈️", mode: "Flight", price: 289, source: "Google Flights" },
  { emoji: "🚌", mode: "Bus + Flight", price: 97, source: "Wanderu + Google Flights", badge: "Best Value" },
  { emoji: "🚂", mode: "Train + Flight", price: 175, source: "Amtrak + Google Flights" },
  { emoji: "🚗", mode: "Rideshare + Flight", price: 130, source: "Rome2Rio" },
];

export default function DemoPage() {
  const [step, setStep] = useState<DemoStep>("landing");
  const [formOrigin, setFormOrigin] = useState("");
  const [formDest, setFormDest] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formFlight, setFormFlight] = useState("");
  const [savings, setSavings] = useState(0);
  const [visibleFeed, setVisibleFeed] = useState<typeof feedItems>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"warn" | "err">("warn");
  const [chatMsgs, setChatMsgs] = useState<{ role: string; text: string }[]>([]);
  const [typingText, setTypingText] = useState("");

  const animateSavings = useCallback((target: number) => {
    let c = 0; const s = target / 30;
    const iv = setInterval(() => { c += s; if (c >= target) { c = target; clearInterval(iv); } setSavings(Math.round(c)); }, 50);
  }, []);

  useEffect(() => {
    const t: NodeJS.Timeout[] = [];
    TIMELINE.forEach(({ step: s, at }) => t.push(setTimeout(() => setStep(s), at)));

    const type = (setter: (v: string) => void, val: string, start: number) => {
      for (let i = 0; i <= val.length; i++) t.push(setTimeout(() => setter(val.slice(0, i)), start + i * 80));
    };
    type(setFormOrigin, "JFK", 3200);
    type(setFormDest, "DFW", 4200);
    t.push(setTimeout(() => setFormDate("2026-04-02"), 5200));
    type(setFormFlight, "AA 1247", 5600);

    t.push(setTimeout(() => setVisibleFeed([feedItems[0]]), 9000));
    t.push(setTimeout(() => { setVisibleFeed(p => [...p, feedItems[1]]); setToastMsg("⚠️ DELAYED: Flight AA 1247"); setToastType("warn"); }, 13000));
    t.push(setTimeout(() => setToastMsg(null), 16000));
    t.push(setTimeout(() => { setVisibleFeed(p => [...p, feedItems[2]]); setToastMsg("⚠️ CANCELED: Flight AA 1247"); setToastType("err"); animateSavings(192); }, 18000));
    t.push(setTimeout(() => setVisibleFeed(p => [...p, feedItems[3]]), 20000));
    t.push(setTimeout(() => setToastMsg(null), 22000));

    const agentMsg = "Hey — I detected your flight AA 1247 from JFK to DFW was just canceled. I searched Wanderu, Rome2Rio, and direct airlines and found you 4 alternatives. Want me to walk you through them, or should I just book the cheapest option?";
    t.push(setTimeout(() => setChatMsgs([{ role: "assistant", text: agentMsg }]), 44500));
    t.push(setTimeout(() => setChatMsgs(p => [...p, { role: "user", text: "Book the cheapest one" }]), 46500));

    const resp = "Done! I found a bus-to-PHL + flight combo on Wanderu for $97. You'll arrive at DFW by 9pm — plenty of time for your Tuesday shift. That's $192 saved vs rebooking the same airline.";
    let partial = "";
    for (let i = 0; i < resp.length; i++) t.push(setTimeout(() => { partial = resp.slice(0, i + 1); setTypingText(partial); }, 47500 + i * 20));

    return () => t.forEach(clearTimeout);
  }, [animateSavings]);

  const statusText = step === "dashboard-green" ? "ON TIME" : step === "dashboard-yellow" ? "DELAYED" : "CANCELED";
  const statusColor = step === "dashboard-green" ? "bg-teal text-navy" : step === "dashboard-yellow" ? "bg-amber text-navy" : "bg-disruption text-white";

  return (
    <div className="relative min-h-screen bg-navy overflow-hidden">
      {/* Progress */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-[2px] bg-white/5">
        <motion.div className="h-full bg-teal" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 55, ease: "linear" }} />
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full text-sm font-medium shadow-2xl ${toastType === "err" ? "bg-disruption text-white" : "bg-amber text-navy"}`}>
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto px-6 md:px-8">
        <AnimatePresence mode="wait">

          {/* LANDING */}
          {(step === "landing" || step === "filling") && (
            <motion.div key="landing" {...fade} className="min-h-screen flex flex-col items-center justify-center text-center">
              <p className="section-label mb-8">For those who can&apos;t afford to miss work</p>
              <h1 className="font-serif text-[clamp(40px,8vw,64px)] leading-[1.05] mb-4">Never miss a<br /><span className="font-serif-italic">shift.</span></h1>
              <p className="text-sm opacity-50 mb-10">Your AI travel agent that fights for you when flights fall apart.</p>
              <div className="space-y-3 w-full max-w-sm">
                <input readOnly value={formOrigin} placeholder="Origin" className="w-full bg-transparent border border-white/15 rounded-full px-6 py-3 text-sm placeholder-white/20" />
                <input readOnly value={formDest} placeholder="Destination" className="w-full bg-transparent border border-white/15 rounded-full px-6 py-3 text-sm placeholder-white/20" />
                <input readOnly value={formDate} placeholder="Date" className="w-full bg-transparent border border-white/15 rounded-full px-6 py-3 text-sm placeholder-white/20" />
                <input readOnly value={formFlight} placeholder="Flight #" className="w-full bg-transparent border border-white/15 rounded-full px-6 py-3 text-sm placeholder-white/20" />
                <motion.div animate={step === "filling" && formFlight.length >= 7 ? { scale: [1, 1.03, 1] } : {}} transition={{ repeat: Infinity, duration: 1.2 }}
                  className="pill-button pill-button-teal w-full !justify-center">Protect My Trip</motion.div>
              </div>
            </motion.div>
          )}

          {/* DASHBOARD */}
          {(step === "dashboard-green" || step === "dashboard-yellow" || step === "dashboard-red") && (
            <motion.div key="dashboard" {...fade} className="pt-20 md:pt-24">
              <div className="flex items-baseline justify-between mb-2">
                <h1 className="font-serif text-[clamp(36px,6vw,48px)]">JFK → DFW</h1>
                <motion.span key={statusText} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className={`${statusColor} text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full`}>{statusText}</motion.span>
              </div>
              <p className="text-sm opacity-30 mb-8">AA 1247 · 2026-04-02</p>
              <div className="dashed-divider mb-8" />
              <p className="section-label mb-6">Agent Activity</p>
              <div className="relative pl-8 mb-8">
                <div className="absolute left-[7px] top-2 bottom-2 w-px border-l border-dashed border-white/15" />
                <div className="space-y-6">
                  <AnimatePresence>{visibleFeed.map((f, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative">
                      <div className="absolute -left-8 top-1.5 w-[13px] h-[13px] rounded-full border border-white/20 bg-navy flex items-center justify-center">
                        <div className={`w-[4px] h-[4px] rounded-full ${i === visibleFeed.length - 1 ? "bg-teal" : "bg-white/30"}`} />
                      </div>
                      <p className="text-sm opacity-70">{f.text}</p>
                      <p className="text-[10px] opacity-20">{f.time}</p>
                    </motion.div>
                  ))}</AnimatePresence>
                </div>
              </div>
              <div className="dashed-divider mb-8" />
              <div className="text-center"><p className="section-label mb-2">Saved so far</p><p className="font-serif text-5xl text-teal">${savings}</p></div>
            </motion.div>
          )}

          {/* OPTIONS */}
          {step === "options" && (
            <motion.div key="options" {...fade} className="pt-20 md:pt-24">
              <p className="section-label text-center mb-4">——— Alternatives Found ———</p>
              <h1 className="font-serif text-[clamp(32px,5vw,44px)] text-center mb-2">Your <span className="font-serif-italic">alternatives</span></h1>
              <div className="dashed-divider my-8" />
              {options.map((o, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }}>
                  <div className="flex items-center justify-between py-5">
                    <div className="flex items-center gap-3"><span>{o.emoji}</span><span className="section-label">{o.mode}</span></div>
                    <div className="text-right flex items-center gap-2">
                      <span className="font-serif text-2xl">${o.price}</span>
                      {(o as { badge?: string }).badge && <span className="text-[9px] tracking-widest uppercase border border-teal/40 text-teal px-2 py-0.5 rounded-full">{(o as { badge?: string }).badge}</span>}
                    </div>
                  </div>
                  {i < options.length - 1 && <div className="dashed-divider" />}
                </motion.div>
              ))}
              <div className="dashed-divider mt-4 mb-8" />
              <p className="font-serif-italic text-center opacity-50">You save $192 vs airline rebooking</p>
            </motion.div>
          )}

          {/* RIGHTS */}
          {(step === "rights-loading" || step === "rights-result") && (
            <motion.div key="rights" {...fade} className="pt-20 md:pt-24">
              <h1 className="font-serif text-[clamp(32px,5vw,44px)] leading-tight mb-2">Know your <span className="font-serif-italic">rights.</span></h1>
              <p className="section-label mb-6">——— Powered by K2 Think V2 ———</p>
              <div className="dashed-divider mb-8" />
              {step === "rights-loading" && <motion.p animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-teal text-sm">Analyzing your rights...</motion.p>}
              {step === "rights-result" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="text-center mb-8">
                    <p className="section-label mb-2">You are owed</p>
                    <p className="font-serif text-[64px] md:text-[80px] leading-none text-teal">$650</p>
                    <p className="text-xs opacity-30 mt-3">14 CFR Part 259 · DOT Automatic Refunds Rule</p>
                  </div>
                  <div className="dashed-divider mb-6" />
                  <p className="section-label mb-3">K2 Reasoning</p>
                  <div className="bg-white/[0.02] rounded-sm p-5">
                    <pre className="text-[11px] font-mono opacity-40 whitespace-pre-wrap leading-relaxed">{`Step 1: Flight AA 1247 canceled — airline responsible.
Step 2: 14 CFR Part 259 + DOT Refunds Rule apply.
Step 3: Full refund $289 + expenses ≈ $650.
Step 4: Airline must provide written notice.`}</pre>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ANALYTICS */}
          {step === "analytics" && (
            <motion.div key="analytics" {...fade} className="pt-20 md:pt-24">
              <p className="section-label text-center mb-4">——— Hex Analytics ———</p>
              <h1 className="font-serif text-[clamp(28px,5vw,40px)] text-center mb-2">TSA Crisis <span className="font-serif-italic">Impact</span></h1>
              <div className="dashed-divider my-8" />
              <div className="grid grid-cols-3 gap-4 text-center mb-8">
                {[{ n: "140,000+", l: "Canceled (2024)" }, { n: "$280", l: "Avg Fare" }, { n: "$185", l: "Avg Saved", c: "text-teal" }].map((s, i) => (
                  <div key={i}><p className={`font-serif text-2xl ${s.c || ""}`}>{s.n}</p><p className="section-label">{s.l}</p></div>
                ))}
              </div>
              <div className="dashed-divider mb-6" />
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <p className="section-label mb-3">By Airport</p>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={AIRPORT_DATA}><XAxis dataKey="airport" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} /><YAxis hide /><Bar dataKey="rate" fill="rgba(255,255,255,0.12)" radius={[2,2,0,0]} /></BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart><Pie data={DISRUPTION_DATA} cx="50%" cy="50%" outerRadius={60} innerRadius={30} dataKey="value" strokeWidth={0}>{DISRUPTION_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}</Pie></PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* CHAT */}
          {step === "chat" && (
            <motion.div key="chat" {...fade} className="pt-20 md:pt-24">
              <h1 className="font-serif text-2xl mb-2">ReRoute <span className="font-serif-italic">Chat</span></h1>
              <div className="dashed-divider my-6" />
              <div className="space-y-6">
                {chatMsgs.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] ${m.role === "user" ? "" : ""}`}>
                      {m.role === "assistant" && <p className="text-[10px] tracking-[0.25em] uppercase opacity-20 mb-2">ReRoute</p>}
                      <div className={`text-sm leading-relaxed ${m.role === "user" ? "bg-white/[0.04] rounded-2xl rounded-br-sm px-5 py-3" : "opacity-70"}`}>{m.text}</div>
                    </div>
                  </motion.div>
                ))}
                {typingText && chatMsgs.length >= 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div><p className="text-[10px] tracking-[0.25em] uppercase opacity-20 mb-2">ReRoute</p><p className="text-sm leading-relaxed opacity-70">{typingText}</p></div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* FINALE */}
          {step === "finale" && (
            <motion.div key="finale" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="min-h-screen flex items-center justify-center">
              <div className="text-center max-w-lg">
                <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-serif text-[clamp(80px,20vw,140px)] leading-none text-teal mb-2">$192</motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="font-serif-italic text-[clamp(28px,5vw,48px)] leading-tight mb-6 opacity-80">saved.</motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-sm opacity-50 mb-12">and their Tuesday shift.</motion.p>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                  <div className="dashed-divider mb-8" />
                  <span className="pill-button pill-button-sm pointer-events-none">Built at YHack 2026</span>
                  <p className="text-xs opacity-20 mt-6">Lava AI Gateway · Claude Sonnet · K2 Think V2 · Hermes 3</p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
