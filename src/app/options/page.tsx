"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Plane, Bus, Train, Car, Star } from "lucide-react";

const options = [
  {
    icon: Plane,
    type: "Next available flight",
    price: 289,
    arrival: "11:00 PM",
    duration: "4h travel",
    badge: null,
  },
  {
    icon: Bus,
    type: "Greyhound + short flight combo",
    price: 97,
    arrival: "9:00 PM",
    duration: "8h travel",
    badge: "BEST VALUE",
  },
  {
    icon: Train,
    type: "Amtrak",
    price: 65,
    arrival: "Next morning",
    duration: "14h travel",
    badge: null,
  },
  {
    icon: Car,
    type: "Rideshare split",
    price: 120,
    arrival: "10:00 PM",
    duration: "6h travel",
    badge: null,
  },
];

export default function OptionsPage() {
  const router = useRouter();

  return (
    <div className="px-5 pt-8 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-teal/10 border border-teal/30 rounded-xl px-4 py-3 mb-6"
      >
        <p className="text-teal text-sm font-semibold text-center">
          You save $192 vs rebooking the same airline
        </p>
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
                transition={{ delay: i * 0.1 }}
                className="bg-navy-light border border-navy-lighter rounded-2xl p-5 flex flex-col w-[200px] shrink-0 relative"
              >
                {opt.badge && (
                  <div className="absolute -top-2 -right-2 bg-teal text-navy text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Star size={10} fill="currentColor" />
                    {opt.badge}
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center mb-3">
                  <Icon size={20} className="text-teal" />
                </div>
                <p className="text-xs text-gray-400 mb-1">{opt.type}</p>
                <p className="text-2xl font-extrabold mb-3">${opt.price}</p>
                <div className="space-y-1 mb-4 flex-1">
                  <p className="text-xs text-gray-400">Arrives: {opt.arrival}</p>
                  <p className="text-xs text-gray-400">{opt.duration}</p>
                </div>
                <button className="w-full bg-teal/10 text-teal font-semibold text-sm py-2.5 rounded-xl hover:bg-teal/20 transition-colors min-h-[44px]">
                  Book This
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <button
          onClick={() => router.push("/chat")}
          className="w-full bg-teal text-navy font-bold py-4 rounded-xl hover:bg-teal-dark transition-colors min-h-[44px]"
        >
          Let ReRoute Handle It
        </button>
      </motion.div>
    </div>
  );
}
