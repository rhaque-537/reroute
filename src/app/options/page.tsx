"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const options = [
  { emoji: "✈️", mode: "Flight", detail: "JFK 6:10 PM ——— DFW 11:00 PM", duration: "4h direct", price: 289, source: "via Google Flights", badge: null },
  { emoji: "🚌", mode: "Bus + Flight", detail: "JFK 1:00 PM ——— DFW 9:00 PM", duration: "8h multi-modal", price: 97, source: "via Wanderu", badge: "Best Value" },
  { emoji: "🚂", mode: "Train", detail: "Penn Station 2:15 PM ——— DFW next AM", duration: "14h overnight", price: 65, source: "via Amtrak.com", badge: null },
  { emoji: "🚗", mode: "Rideshare", detail: "JFK 4:00 PM ——— DFW 10:00 PM", duration: "6h split fare", price: 120, source: "via Rome2Rio", badge: null },
];

export default function OptionsPage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 pt-12 md:pt-16">
      <div className="text-center mb-4">
        <p className="section-label mb-4">——— Alternatives Found ———</p>
        <h1 className="font-serif text-[clamp(32px,5vw,48px)] leading-tight mb-2">
          Your <span className="font-serif-italic">alternatives</span>
        </h1>
        <p className="text-sm opacity-40">Searched via Wanderu, Rome2Rio, and direct airlines</p>
      </div>

      <div className="dashed-divider my-10" />

      {/* Options list */}
      <div>
        {options.map((opt, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between py-6 md:py-8 gap-4">
              {/* Left: mode */}
              <div className="w-28 md:w-36 shrink-0">
                <span className="text-lg mr-2">{opt.emoji}</span>
                <span className="section-label">{opt.mode}</span>
              </div>

              {/* Center: route + duration */}
              <div className="flex-1 hidden md:block">
                <p className="text-sm opacity-60 font-mono tracking-wide">{opt.detail}</p>
                <p className="text-xs opacity-30 mt-1">{opt.duration}</p>
              </div>
              <div className="flex-1 md:hidden">
                <p className="text-xs opacity-30">{opt.duration}</p>
              </div>

              {/* Right: price */}
              <div className="text-right shrink-0">
                <div className="flex items-center gap-2 justify-end">
                  <span className="font-serif text-2xl md:text-3xl">${opt.price}</span>
                  {opt.badge && (
                    <span className="text-[9px] tracking-[0.2em] uppercase border border-teal/40 text-teal px-2 py-0.5 rounded-full">{opt.badge}</span>
                  )}
                </div>
                <p className="text-[10px] opacity-30 mt-1">{opt.source}</p>
              </div>
            </div>
            {i < options.length - 1 && <div className="dashed-divider" />}
          </motion.div>
        ))}
      </div>

      <div className="dashed-divider my-10" />

      {/* Savings + CTA */}
      <div className="text-center pb-12">
        <p className="font-serif-italic text-lg opacity-60 mb-10">
          You save $192 vs airline rebooking
        </p>
        <button onClick={() => router.push("/chat")} className="pill-button">
          Let ReRoute Handle It
        </button>
      </div>
    </div>
  );
}
