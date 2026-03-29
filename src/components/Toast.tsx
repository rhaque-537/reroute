"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "warning" | "error" | "success";
}

interface ToastContextType {
  addToast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });
export const useToast = () => useContext(ToastContext);

let toastIdCounter = 0;
let globalAddToast: ((message: string, type?: Toast["type"]) => void) | null = null;

export function fireToast(message: string, type: Toast["type"] = "warning") {
  globalAddToast?.(message, type);
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "warning") => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  globalAddToast = addToast;

  const bgColors = {
    warning: "bg-amber text-navy",
    error: "bg-disruption text-white",
    success: "bg-teal text-navy",
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[400px] px-4 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`${bgColors[toast.type]} rounded-xl px-4 py-3 font-semibold text-sm flex items-center justify-between shadow-lg`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
