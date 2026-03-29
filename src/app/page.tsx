"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

function getDefaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split("T")[0];
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export default function Landing() {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const defaultDate = useMemo(() => getDefaultDate(), []);
  const todayDate = useMemo(() => getTodayDate(), []);
  const [date, setDate] = useState(defaultDate);
  const [flightNumber, setFlightNumber] = useState("");
  const [budget, setBudget] = useState(200);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      origin,
      destination,
      date,
      ...(flightNumber && { flight: flightNumber }),
      budget: String(budget),
    });
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="section-label mb-8">For those who can&apos;t afford to miss work</p>

          <h1 className="font-serif text-[clamp(40px,8vw,72px)] leading-[1.05] mb-6">
            Never miss a<br />
            <span className="font-serif-italic">shift.</span>
          </h1>

          <p className="text-base md:text-lg opacity-60 max-w-xl mx-auto mb-12 font-light">
            Your AI travel agent that fights for you when flights fall apart.
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          onSubmit={handleSubmit}
          className="w-full max-w-3xl"
        >
          {/* Desktop: single row */}
          <div className="hidden md:flex items-center border border-white/15 rounded-full">
            <input
              type="text"
              placeholder="Origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              required
              className="w-0 flex-1 min-w-0 bg-transparent px-5 py-4 text-sm placeholder-white/30 focus:outline-none"
            />
            <div className="w-px h-8 bg-white/10 shrink-0" />
            <input
              type="text"
              placeholder="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              className="w-0 flex-1 min-w-0 bg-transparent px-5 py-4 text-sm placeholder-white/30 focus:outline-none"
            />
            <div className="w-px h-8 bg-white/10 shrink-0" />
            <input
              type="date"
              value={date}
              min={todayDate}
              onChange={(e) => setDate(e.target.value)}
              required
              className="shrink-0 bg-transparent px-5 py-4 text-sm placeholder-white/30 focus:outline-none text-white/70"
            />
            <div className="w-px h-8 bg-white/10 shrink-0" />
            <input
              type="text"
              placeholder="e.g. AA 1247"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              className="w-24 shrink-0 bg-transparent px-5 py-4 text-sm placeholder-white/30 focus:outline-none"
            />
            <button type="submit" className="shrink-0 pill-button-teal rounded-full px-6 py-4 text-xs font-semibold tracking-wider uppercase m-1.5 whitespace-nowrap min-h-[44px]">
              Protect My Trip
            </button>
          </div>

          {/* Mobile: stacked */}
          <div className="md:hidden space-y-3">
            <input type="text" placeholder="Origin (e.g. JFK)" value={origin} onChange={(e) => setOrigin(e.target.value)} required className="w-full bg-transparent border border-white/15 rounded-full px-6 py-4 text-sm placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors" />
            <input type="text" placeholder="Destination (e.g. DFW)" value={destination} onChange={(e) => setDestination(e.target.value)} required className="w-full bg-transparent border border-white/15 rounded-full px-6 py-4 text-sm placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors" />
            <input type="date" value={date} min={todayDate} onChange={(e) => setDate(e.target.value)} required className="w-full bg-transparent border border-white/15 rounded-full px-6 py-4 text-sm text-white/70 focus:outline-none focus:border-white/30 transition-colors" />
            <input type="text" placeholder="Flight number (optional)" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} className="w-full bg-transparent border border-white/15 rounded-full px-6 py-4 text-sm placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors" />
            <div className="flex items-center gap-4 px-2">
              <span className="text-xs opacity-30 whitespace-nowrap">Budget: ${budget}</span>
              <input type="range" min={50} max={500} step={10} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="flex-1" />
            </div>
            <button type="submit" className="w-full pill-button pill-button-teal !py-4">Protect My Trip</button>
          </div>
        </motion.form>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 flex flex-col items-center gap-4">
          <span className="text-xs opacity-20">or</span>
          <button onClick={() => router.push("/dashboard?demo=true")} className="pill-button pill-button-sm">Run Live Demo</button>
        </motion.div>
      </section>

      {/* ===== STATS ===== */}
      <div className="max-w-7xl mx-auto px-6 md:px-8"><div className="dashed-divider" /></div>
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 md:px-8 grid grid-cols-3 gap-8 text-center">
          {[
            { number: "140,000+", label: "US Flights Canceled (2024)" },
            { number: "$280", label: "Avg Domestic One-Way Fare" },
            { number: "2.1%", label: "National Cancellation Rate" },
          ].map(({ number, label }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="font-serif text-[clamp(28px,5vw,48px)] mb-2">{number}</p>
              <p className="section-label">{label}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-[10px] opacity-20 text-center mt-6">Source: Bureau of Transportation Statistics, 2024</p>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <div className="max-w-7xl mx-auto px-6 md:px-8"><div className="dashed-divider" /></div>
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <p className="section-label text-center mb-16">——— How It Works ———</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
            {[
              { step: "01 — Monitor", title: "Watches your", titleItalic: "flight", desc: "Real-time status tracking with automatic disruption detection. The moment something changes, ReRoute knows." },
              { step: "02 — Find", title: "Searches every", titleItalic: "option", desc: "Flights, buses, trains, rideshares. Wanderu, Rome2Rio, direct airlines. Every mode, every price point." },
              { step: "03 — Fight", title: "Knows your", titleItalic: "rights", desc: "DOT regulations, compensation rules, airline obligations. K2 legal reasoning engine calculates exactly what you're owed." },
            ].map(({ step, title, titleItalic, desc }, i) => (
              <motion.div key={step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <p className="section-label mb-4">{step}</p>
                <h3 className="font-serif text-2xl md:text-3xl mb-4">{title} <span className="font-serif-italic">{titleItalic}</span></h3>
                <p className="text-sm opacity-50 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PULL QUOTE ===== */}
      <div className="max-w-7xl mx-auto px-6 md:px-8"><div className="dashed-divider" /></div>
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-serif-italic text-[clamp(24px,4vw,36px)] leading-snug opacity-70">
            A canceled flight doesn&apos;t just mean inconvenience. It means lost wages.
          </motion.p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
