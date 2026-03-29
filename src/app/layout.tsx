"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "@/components/Toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <head>
        <title>ReRoute — Never Miss a Shift</title>
        <meta name="description" content="Your AI travel agent that fights for you when flights fall apart." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="bg-navy min-h-screen">
        <div className="mx-auto max-w-[430px] min-h-screen relative bg-navy">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="pb-20"
            >
              {children}
            </motion.div>
          </AnimatePresence>
          <BottomNav />
          <Toaster />
        </div>
      </body>
    </html>
  );
}
