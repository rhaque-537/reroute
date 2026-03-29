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
        className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:border-white/30 transition-all min-w-[44px] min-h-[44px]"
        aria-label="About ReRoute"
      >
        <Info size={16} className="opacity-40" />
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
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative bg-navy border border-white/10 rounded-sm p-10 max-w-[480px] w-full z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity min-w-[44px] min-h-[44px]"
              >
                <X size={18} />
              </button>

              <div className="text-center mb-8">
                <Plane size={24} className="text-teal mx-auto mb-4" />
                <h2 className="font-serif text-2xl mb-1">ReRoute</h2>
                <p className="section-label">AI Travel Recovery for Workers</p>
              </div>

              <div className="dashed-divider pt-6 mb-6">
                <p className="text-sm opacity-70 leading-relaxed text-center">
                  The 2025–2026 TSA staffing crisis left thousands stranded.
                  White collar workers rebook with points. Blue collar workers
                  lose shifts and wages. ReRoute changes that.
                </p>
              </div>

              <div className="dashed-divider pt-6 mb-6">
                <p className="section-label text-center mb-4">Powered by</p>
                <p className="text-xs opacity-50 text-center leading-relaxed">
                  Lava AI Gateway &bull; Claude AI &bull; K2 Think V2 &bull; Hermes 3<br />
                  Hex Analytics &bull; Wanderu &bull; Rome2Rio &bull; Next.js
                </p>
              </div>

              <div className="dashed-divider pt-6 text-center">
                <p className="section-label">Built at YHack 2026</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
