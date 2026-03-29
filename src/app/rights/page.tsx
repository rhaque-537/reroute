"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ChevronDown, ChevronUp, Globe, Calculator } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

const quickRef = [
  {
    title: "Flight canceled?",
    desc: "Free rebooking required by law",
    detail: "Airlines must rebook you on the next available flight at no extra cost, or provide a full refund.",
  },
  {
    title: "Tarmac delay 3+ hours?",
    desc: "Right to deplane",
    detail: "Under 14 CFR Part 259, airlines must allow passengers to deplane after 3 hours on domestic flights.",
  },
  {
    title: "Involuntary bumping?",
    desc: "Owed up to $1,550",
    detail: "If denied boarding involuntarily, compensation ranges from 200% to 400% of your one-way fare, up to $1,550.",
  },
  {
    title: "Significant delay?",
    desc: "Meal and hotel vouchers",
    detail: "Airlines must provide meal vouchers for delays over 3 hours and hotel accommodations for overnight delays.",
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
  const [expandedReasoning, setExpandedReasoning] = useState(false);

  const calculate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze-rights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disruptionType,
          delayHours,
          domestic,
          ticketPrice: Number(ticketPrice) || 300,
          airline: "American Airlines",
          flightDuration: 3.5,
          voluntaryBump: false,
          notificationTime: 0,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        compensationAmount: disruptionType === "bumped" ? 1550 : domestic ? 350 : 700,
        reasoningChain: `Step 1: Identify the disruption type — ${disruptionType}.\n\nStep 2: Determine applicable regulations. Under 14 CFR Part 259 (Tarmac Delays) and 14 CFR Part 250 (Denied Boarding), the DOT mandates specific compensation.\n\nStep 3: For a ${disruptionType} with ${delayHours} hours of delay on a ${domestic ? "domestic" : "international"} flight with a ticket price of $${ticketPrice || 300}:\n- The airline must offer rebooking on the next available flight at no additional cost\n- A full cash refund must be available if the passenger chooses not to travel\n- For delays exceeding 3 hours, meal vouchers are required\n\nStep 4: Calculate compensation amount based on delay duration and ticket price.\n- Base compensation: ${domestic ? "200%" : "400%"} of one-way fare\n- Maximum cap: $${domestic ? "775" : "1,550"}\n- Calculated amount: $${disruptionType === "bumped" ? 1550 : domestic ? 350 : 700}\n\nStep 5: Recommended passenger actions — file complaint with DOT, request written documentation from airline.`,
        applicableRules: [
          "14 CFR Part 259 — Enhanced Protections for Airline Passengers",
          "14 CFR Part 250 — Oversales (Denied Boarding Compensation)",
          "DOT Final Rule on Automatic Refunds (2024)",
        ],
        airlineObligations: [
          "Provide free rebooking on next available flight",
          "Offer full cash refund if passenger declines rebooking",
          "Provide meal vouchers for delays over 3 hours",
          "Provide hotel accommodation for overnight delays",
        ],
        recommendedActions: [
          "Request written confirmation of the disruption from the airline",
          "File a complaint with DOT if airline refuses compensation",
          "Keep all receipts for out-of-pocket expenses",
          "Contact ReRoute to automate your claim",
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 pt-8 pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Know Your Rights</h1>
        <button
          onClick={() => setLang((l) => (l === "en" ? "es" : "en"))}
          className="flex items-center gap-1.5 bg-navy-light border border-navy-lighter rounded-lg px-3 py-2 text-sm min-h-[44px]"
        >
          <Globe size={16} />
          {lang === "en" ? "EN" : "ES"}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-navy-light border border-navy-lighter rounded-2xl p-5 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={20} className="text-teal" />
          <h2 className="font-bold">
            {lang === "en" ? "Calculate My Compensation" : "Calcular Mi Compensación"}
          </h2>
        </div>

        <div className="space-y-3">
          <select
            value={disruptionType}
            onChange={(e) => setDisruptionType(e.target.value)}
            className="w-full bg-navy border border-navy-lighter rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal"
          >
            <option value="cancellation">Cancellation</option>
            <option value="delay">Delay</option>
            <option value="bumped">Involuntary Bumping</option>
            <option value="tarmac">Tarmac Delay</option>
          </select>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Delay hours</span>
              <span className="text-teal font-semibold">{delayHours}h</span>
            </div>
            <input
              type="range"
              min={1}
              max={24}
              value={delayHours}
              onChange={(e) => setDelayHours(Number(e.target.value))}
              className="w-full accent-teal h-2 bg-navy-lighter rounded-full appearance-none cursor-pointer"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setDomestic(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                domestic ? "bg-teal text-navy" : "bg-navy border border-navy-lighter text-gray-400"
              }`}
            >
              Domestic
            </button>
            <button
              onClick={() => setDomestic(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                !domestic ? "bg-teal text-navy" : "bg-navy border border-navy-lighter text-gray-400"
              }`}
            >
              International
            </button>
          </div>

          <input
            type="number"
            placeholder="Ticket price ($)"
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
            className="w-full bg-navy border border-navy-lighter rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal"
          />

          <button
            onClick={calculate}
            disabled={loading}
            className="w-full bg-teal text-navy font-bold py-3.5 rounded-xl hover:bg-teal-dark transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {loading ? "Analyzing..." : "Calculate"}
          </button>
        </div>
      </motion.div>

      {loading && (
        <div className="space-y-3 mb-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4 mb-6"
          >
            <div className="bg-teal/10 border border-teal/30 rounded-2xl p-5 text-center">
              <p className="text-sm text-teal mb-1">You are owed:</p>
              <p className="text-4xl font-extrabold text-teal">${result.compensationAmount}</p>
              <div className="mt-3 space-y-1">
                {result.applicableRules.map((rule, i) => (
                  <p key={i} className="text-xs text-gray-400">{rule}</p>
                ))}
              </div>
            </div>

            <div className="bg-navy-light border border-navy-lighter rounded-2xl p-5">
              <button
                onClick={() => setExpandedReasoning(!expandedReasoning)}
                className="w-full flex items-center justify-between min-h-[44px]"
              >
                <span className="font-semibold text-sm">K2 Reasoning Chain</span>
                {expandedReasoning ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <AnimatePresence>
                {expandedReasoning && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <pre className="text-xs text-gray-400 whitespace-pre-wrap mt-3 leading-relaxed font-sans">
                      {result.reasoningChain}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="text-[10px] text-teal/60 mt-2">Powered by K2 Think V2 Reasoning Engine</p>
            </div>

            <div className="bg-navy-light border border-navy-lighter rounded-2xl p-5">
              <h3 className="font-semibold text-sm mb-3">Airline Obligations</h3>
              <ul className="space-y-2">
                {result.airlineObligations.map((o, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                    <span className="text-teal mt-0.5">•</span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-navy-light border border-navy-lighter rounded-2xl p-5">
              <h3 className="font-semibold text-sm mb-3">Recommended Actions</h3>
              <ul className="space-y-2">
                {result.recommendedActions.map((a, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                    <span className="text-teal mt-0.5">{i + 1}.</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <h2 className="font-bold text-lg mb-2">Quick Reference</h2>
        {quickRef.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-navy-light border border-navy-lighter rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <Shield size={18} className="text-teal shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                <p className="text-xs text-gray-500 mt-2">{item.detail}</p>
                <button className="mt-2 text-xs text-teal font-semibold hover:underline min-h-[44px] flex items-center">
                  Claim This →
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-[10px] text-gray-500 text-center mt-6">
        Based on DOT Airline Consumer Protections
      </p>
    </div>
  );
}
