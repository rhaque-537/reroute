"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import AboutModal from "@/components/AboutModal";
import { Toaster } from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDemo = pathname === "/demo";

  return (
    <html lang="en">
      <head>
        <title>ReRoute — Never Miss a Shift</title>
        <meta name="description" content="Your AI travel agent that fights for you when flights fall apart." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ReRoute" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-navy min-h-screen">
        {!isDemo && <TopNav />}
        {!isDemo && (
          <div className="fixed top-3 right-3 z-[60] md:top-auto md:bottom-6 md:right-6">
            <AboutModal />
          </div>
        )}
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={isDemo ? "" : "pb-16 md:pb-0 md:pt-16"}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
        {!isDemo && <BottomNav />}
        <Toaster />
      </body>
    </html>
  );
}
