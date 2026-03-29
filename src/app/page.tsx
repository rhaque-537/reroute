"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plane, DollarSign, Scale, Search } from "lucide-react";

export default function Landing() {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
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
    <div className="px-5 pt-12 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal flex items-center justify-center">
            <Plane size={22} className="text-navy" />
          </div>
          <h1 className="text-2xl font-bold">ReRoute</h1>
        </div>
        <h2 className="text-3xl font-extrabold leading-tight mb-3">
          Never Miss a Shift.
        </h2>
        <p className="text-gray-400 text-base">
          Your AI travel agent that fights for you when flights fall apart.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        onSubmit={handleSubmit}
        className="space-y-4 mb-8"
      >
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Origin city (e.g. JFK)"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            required
            className="w-full bg-navy-light border border-navy-lighter rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-teal transition-colors"
          />
          <input
            type="text"
            placeholder="Destination city (e.g. DFW)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            className="w-full bg-navy-light border border-navy-lighter rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-teal transition-colors"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full bg-navy-light border border-navy-lighter rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-teal transition-colors"
          />
          <input
            type="text"
            placeholder="Flight number (optional)"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            className="w-full bg-navy-light border border-navy-lighter rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-teal transition-colors"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Budget</span>
            <span className="text-teal font-semibold">${budget}</span>
          </div>
          <input
            type="range"
            min={50}
            max={500}
            step={10}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full accent-teal h-2 bg-navy-lighter rounded-full appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$50</span>
            <span>$500</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-teal text-navy font-bold text-lg py-4 rounded-xl hover:bg-teal-dark transition-colors min-h-[44px]"
        >
          Protect My Trip
        </button>
      </motion.form>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-3 gap-3 mb-8"
      >
        {[
          { icon: DollarSign, title: "Saves You Money", desc: "Finds cheapest options across all transport" },
          { icon: Scale, title: "Knows Your Rights", desc: "DOT rules enforced automatically" },
          { icon: Search, title: "Finds Every Option", desc: "Flights, buses, trains, rideshares" },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-navy-light border border-navy-lighter rounded-xl p-3 text-center">
            <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center mx-auto mb-2">
              <Icon size={20} className="text-teal" />
            </div>
            <p className="text-xs font-semibold mb-1">{title}</p>
            <p className="text-[10px] text-gray-400 leading-tight">{desc}</p>
          </div>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        onClick={() => router.push("/dashboard?demo=true")}
        className="w-full border-2 border-teal text-teal font-semibold py-3.5 rounded-xl hover:bg-teal/10 transition-colors min-h-[44px]"
      >
        Run Live Demo
      </motion.button>
    </div>
  );
}
