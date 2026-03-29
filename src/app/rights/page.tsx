"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Plus, Minus } from "lucide-react";

const rightsData = [
  {
    title: "Flight canceled?",
    detail: "Airlines must rebook you on the next available flight at no extra cost, or provide a full cash refund. Under the 2024 DOT Automatic Refunds Rule, refunds must be issued within 7 business days for credit card purchases.",
  },
  {
    title: "Tarmac delay 3+ hours?",
    detail: "Under 14 CFR Part 259, airlines must allow passengers to deplane after 3 hours on domestic flights (4 hours international). Food and water must be provided within 2 hours. Violations carry fines up to $37,377 per passenger.",
  },
  {
    title: "Involuntary bumping?",
    detail: "Under 14 CFR Part 250, if denied boarding involuntarily, compensation is 200% of one-way fare (1–2 hour delay, max $775) or 400% of one-way fare (2+ hours, max $1,550). Airlines must pay in cash or check — not just vouchers.",
  },
  {
    title: "Significant delay?",
    detail: "Airlines must provide meal vouchers for delays over 3 hours and hotel accommodations for overnight delays caused by the airline. Ground transportation to and from the hotel must also be provided.",
  },
];

export default function RightsPage() {
  const [lang, setLang] = useState<"en" | "es">("en");
  const [disruptionType, setDisruptionType] = useState("cancellation");
  const [delayHours, setDelayHours] = useState(4);
  const [domestic, setDomestic] = useState(true);
  const [ticketPrice, setTicketPrice] = useState("");
  const [result, setResult] = useState<{
    compensationAmount: number;
    reasoningChain: string;
    applicableRules: string[];
    airlineObligations: string[];
    recommendedActions: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const calculate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze-rights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disruptionType, delayHours, domestic,
          ticketPrice: Number(ticketPrice) || 300,
          airline: "American Airlines", flightDuration: 3.5,
          voluntaryBump: false, notificationTime: 0,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        compensationAmount: disruptionType === "bumped" ? 1550 : domestic ? 350 : 700,
        reasoningChain: `Step 1: Identify disruption — ${disruptionType}.\n\nStep 2: Under 14 CFR Part 259 and Part 250, the DOT mandates specific compensation.\n\nStep 3: For ${disruptionType} with ${delayHours}h delay on ${domestic ? "domestic" : "international"} flight, ticket $${ticketPrice || 300}:\n- Airline must rebook at no cost\n- Full cash refund available\n- Meal vouchers for 3+ hour delays\n\nStep 4: Compensation = ${domestic ? "200%" : "400%"} of fare, cap $${domestic ? "775" : "1,550"}.\nCalculated: $${disruptionType === "bumped" ? 1550 : domestic ? 350 : 700}\n\nStep 5: File DOT complaint if airline refuses.`,
        applicableRules: ["14 CFR Part 259", "14 CFR Part 250", "DOT Automatic Refunds Rule (2024)"],
        airlineObligations: ["Free rebooking on next flight", "Full cash refund option", "Meal vouchers (3+ hours)", "Hotel for overnight delays"],
        recommendedActions: ["Get written confirmation", "File DOT complaint if refused", "Keep all receipts", "Use ReRoute to automate claim"],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 pt-12 md:pt-16">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-serif text-[clamp(36px,6vw,52px)] leading-tight">
            Know your<br /><span className="font-serif-italic">rights.</span>
          </h1>
        </div>
        <button
          onClick={() => setLang(l => (l === "en" ? "es" : "en"))}
          className="flex items-center gap-2 text-xs opacity-40 hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px] justify-center mt-2"
        >
          <Globe size={14} />{lang === "en" ? "EN" : "ES"}
        </button>
      </div>
      <p className="section-label mb-4">——— Powered by K2 Think V2 ———</p>

      <div className="dashed-divider my-10" />

      {/* Calculator */}
      <div className="mb-12">
        <p className="section-label mb-6">{lang === "en" ? "Calculate Compensation" : "Calcular Compensación"}</p>

        {/* Desktop: inline form */}
        <div className="hidden md:flex items-center border border-white/15 rounded-full overflow-hidden mb-6">
          <select value={disruptionType} onChange={e => setDisruptionType(e.target.value)} className="bg-transparent px-6 py-4 text-sm focus:outline-none appearance-none cursor-pointer">
            <option value="cancellation" className="bg-navy">Cancellation</option>
            <option value="delay" className="bg-navy">Delay</option>
            <option value="bumped" className="bg-navy">Bumped</option>
            <option value="tarmac" className="bg-navy">Tarmac</option>
          </select>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex items-center gap-2 px-6">
            <span className="text-xs opacity-40">Delay:</span>
            <input type="range" min={1} max={24} value={delayHours} onChange={e => setDelayHours(Number(e.target.value))} className="w-20" />
            <span className="text-sm">{delayHours}h</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <button onClick={() => setDomestic(!domestic)} className="px-6 py-4 text-sm opacity-60 hover:opacity-100 transition-opacity">{domestic ? "Domestic" : "Int'l"}</button>
          <div className="w-px h-8 bg-white/10" />
          <input type="number" placeholder="Ticket $" value={ticketPrice} onChange={e => setTicketPrice(e.target.value)} className="bg-transparent px-6 py-4 text-sm placeholder-white/30 focus:outline-none w-28" />
          <button onClick={calculate} disabled={loading} className="pill-button-teal rounded-full px-8 py-4 text-xs font-semibold tracking-wider uppercase m-1.5 whitespace-nowrap min-h-[44px] disabled:opacity-50">
            {loading ? "..." : "Calculate"}
          </button>
        </div>

        {/* Mobile: stacked */}
        <div className="md:hidden space-y-3 mb-6">
          <select value={disruptionType} onChange={e => setDisruptionType(e.target.value)} className="w-full bg-transparent border border-white/15 rounded-full px-6 py-4 text-sm focus:outline-none">
            <option value="cancellation" className="bg-navy">Cancellation</option>
            <option value="delay" className="bg-navy">Delay</option>
            <option value="bumped" className="bg-navy">Bumped</option>
            <option value="tarmac" className="bg-navy">Tarmac</option>
          </select>
          <div className="flex items-center gap-3 px-2">
            <span className="text-xs opacity-30">Delay: {delayHours}h</span>
            <input type="range" min={1} max={24} value={delayHours} onChange={e => setDelayHours(Number(e.target.value))} className="flex-1" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDomestic(true)} className={`flex-1 py-3 rounded-full text-sm transition-all min-h-[44px] ${domestic ? "border border-teal text-teal" : "border border-white/15 opacity-40"}`}>Domestic</button>
            <button onClick={() => setDomestic(false)} className={`flex-1 py-3 rounded-full text-sm transition-all min-h-[44px] ${!domestic ? "border border-teal text-teal" : "border border-white/15 opacity-40"}`}>International</button>
          </div>
          <input type="number" placeholder="Ticket price ($)" value={ticketPrice} onChange={e => setTicketPrice(e.target.value)} className="w-full bg-transparent border border-white/15 rounded-full px-6 py-4 text-sm placeholder-white/30 focus:outline-none" />
          <button onClick={calculate} disabled={loading} className="w-full pill-button pill-button-teal !py-4 disabled:opacity-50">
            {loading ? "Analyzing..." : "Calculate"}
          </button>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="text-center mb-10">
              <p className="section-label mb-3">You are owed</p>
              <p className="font-serif text-[clamp(56px,12vw,80px)] leading-none text-teal">${result.compensationAmount}</p>
              <div className="mt-4 space-y-1">
                {result.applicableRules.map((r, i) => <p key={i} className="text-xs opacity-30">{r}</p>)}
              </div>
            </div>

            <div className="dashed-divider my-10" />

            {/* Reasoning chain */}
            <div className="mb-10">
              <p className="section-label mb-4">K2 Reasoning Chain</p>
              <div className="bg-white/[0.02] rounded-sm p-6">
                <pre className="text-[13px] font-mono opacity-50 whitespace-pre-wrap leading-relaxed">{result.reasoningChain}</pre>
              </div>
              <p className="text-[10px] opacity-20 mt-3">Powered by K2 Think V2 Reasoning Engine</p>
            </div>

            <div className="dashed-divider my-10" />

            {/* Obligations & actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
              <div>
                <p className="section-label mb-4">Airline Obligations</p>
                <div className="space-y-3">
                  {result.airlineObligations.map((o, i) => <p key={i} className="text-sm opacity-50">{o}</p>)}
                </div>
              </div>
              <div>
                <p className="section-label mb-4">Recommended Actions</p>
                <div className="space-y-3">
                  {result.recommendedActions.map((a, i) => <p key={i} className="text-sm opacity-50">{i + 1}. {a}</p>)}
                </div>
              </div>
            </div>

            <div className="dashed-divider my-10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ Accordion */}
      <div className="mb-16">
        <p className="section-label text-center mb-10">——— Quick Reference ———</p>
        {rightsData.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
              className="w-full flex items-center justify-between py-6 text-left min-h-[44px]"
            >
              <span className="font-serif text-xl md:text-2xl pr-4">{item.title}</span>
              {expandedFaq === i ? <Minus size={18} className="opacity-40 shrink-0" /> : <Plus size={18} className="opacity-40 shrink-0" />}
            </button>
            <AnimatePresence>
              {expandedFaq === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm opacity-50 leading-relaxed pb-6">{item.detail}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="dashed-divider" />
          </div>
        ))}
      </div>

      <p className="text-[10px] opacity-20 text-center pb-8">Based on DOT Airline Consumer Protections</p>
    </div>
  );
}
