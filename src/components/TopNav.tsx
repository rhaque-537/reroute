"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat", label: "Chat" },
  { href: "/rights", label: "Rights" },
  { href: "/analytics", label: "Analytics" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 hidden md:block">
      <div className="bg-navy/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Plane size={18} className="text-teal" />
            <span className="font-serif text-lg">ReRoute</span>
          </Link>

          <nav className="flex items-center gap-10">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-[13px] tracking-wide transition-opacity ${
                  pathname === href ? "opacity-100" : "opacity-40 hover:opacity-70"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <Link href="/" className="pill-button pill-button-teal pill-button-sm !py-2 !px-6 !text-[11px]">
            Protect My Trip
          </Link>
        </div>
      </div>
    </header>
  );
}
