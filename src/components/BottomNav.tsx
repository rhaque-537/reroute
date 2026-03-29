"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, MessageCircle, Shield, BarChart3 } from "lucide-react";

const tabs = [
  { href: "/", icon: Home },
  { href: "/dashboard", icon: LayoutDashboard },
  { href: "/chat", icon: MessageCircle },
  { href: "/rights", icon: Shield },
  { href: "/analytics", icon: BarChart3 },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="dashed-divider" />
      <div className="bg-navy/90 backdrop-blur-xl h-14 flex justify-around items-center">
        {tabs.map(({ href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-1 transition-colors"
            >
              <Icon size={20} className={active ? "text-teal" : "text-white/30"} strokeWidth={active ? 2 : 1.5} />
              {active && <div className="w-1 h-1 rounded-full bg-teal" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
