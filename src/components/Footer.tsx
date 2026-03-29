"use client";

import Link from "next/link";
import { Plane } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-navy">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="dashed-divider" />

        <div className="py-16 text-center">
          <Plane size={20} className="text-teal mx-auto mb-4" />
          <p className="font-serif text-xl mb-1">ReRoute</p>
          <p className="section-label">Never miss a shift</p>
        </div>

        <div className="dashed-divider" />

        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          <div>
            <p className="section-label mb-5">Navigate</p>
            <div className="space-y-3">
              {[
                { href: "/", label: "Home" },
                { href: "/dashboard", label: "Dashboard" },
                { href: "/chat", label: "Chat" },
                { href: "/rights", label: "Your Rights" },
                { href: "/analytics", label: "Analytics" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="block text-sm opacity-50 hover:opacity-100 transition-opacity">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="section-label mb-5">Resources</p>
            <div className="space-y-3">
              <p className="text-sm opacity-50">DOT Consumer Protections</p>
              <p className="text-sm opacity-50">14 CFR Part 259</p>
              <p className="text-sm opacity-50">14 CFR Part 250</p>
              <p className="text-sm opacity-50">Wanderu</p>
              <p className="text-sm opacity-50">Rome2Rio</p>
            </div>
          </div>

          <div>
            <p className="section-label mb-5">Technology</p>
            <div className="space-y-3">
              <p className="text-sm opacity-50">Lava AI Gateway</p>
              <p className="text-sm opacity-50">Claude Sonnet</p>
              <p className="text-sm opacity-50">K2 Think V2</p>
              <p className="text-sm opacity-50">Hermes 3 (405B)</p>
              <p className="text-sm opacity-50">Hex Analytics</p>
            </div>
          </div>
        </div>

        <div className="dashed-divider" />

        <div className="py-8 text-center">
          <p className="text-xs opacity-30">
            &copy; 2026 ReRoute. Built at YHack 2026. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
