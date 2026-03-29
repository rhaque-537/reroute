"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, MessageCircle, Shield, BarChart3 } from "lucide-react";

const tabs = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/chat", icon: MessageCircle, label: "Chat" },
  { href: "/rights", icon: Shield, label: "Rights" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-navy-light border-t border-navy-lighter z-50">
      <div className="flex justify-around items-center h-16">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-0.5 transition-colors ${
                active ? "text-teal" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
