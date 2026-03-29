"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, X, Plane } from "lucide-react";

export default function AboutModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-navy-light border border-navy-lighter hover:border-teal transition-colors min-w-[44px] min-h-[44px]"
        aria-label="About ReRoute"
      >
        <Info size={18} className="text-gray-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center px-6"
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-navy-light border border-navy-lighter rounded-2xl p-6 max-w-[380px] w-full z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-navy-lighter transition-colors min-w-[44px] min-h-[44px]"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal flex items-center justify-center">
                  <Plane size={20} className="text-navy" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">ReRoute</h2>
                  <p className="text-xs text-gray-400">AI Travel Recovery for Workers</p>
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed mb-4">
                The 2025-2026 TSA staffing crisis left thousands stranded. White collar workers
                rebook with points. Blue collar workers lose shifts and wages. ReRoute changes that.
              </p>

              <div className="bg-navy border border-navy-lighter rounded-xl p-3 mb-4">
                <p className="text-[10px] text-gray-500 uppercase font-semibold mb-2 tracking-wider">Powered by</p>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Lava AI Gateway &bull; Claude AI &bull; K2 Think V2 &bull; Hermes 3 &bull; Hex Analytics &bull; Next.js
                </p>
              </div>

              <p className="text-xs text-teal font-semibold text-center">Built at YHack 2026</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
