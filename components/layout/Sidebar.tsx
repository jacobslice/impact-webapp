"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  Building2,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
  { icon: Building2, label: "For Protocols", href: "/for-protocols" },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname.startsWith("/score") || pathname.startsWith("/dashboard");
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-14 bg-[#08080c] border-r border-purple-500/15 flex flex-col items-center py-3.5 z-50">
      {/* Logo */}
      <Link
        href="/"
        className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center text-white font-black text-sm mb-6 shadow-[0_0_18px_rgba(153,69,255,0.3)] hover:shadow-[0_0_24px_rgba(153,69,255,0.5)] transition-shadow"
      >
        S
      </Link>

      {/* Nav Icons */}
      <div className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`relative w-[38px] h-[38px] flex items-center justify-center rounded-[10px] transition-all ${
                active
                  ? "bg-[#9945FF]/13 text-[#9945FF] shadow-[0_0_16px_rgba(153,69,255,0.2)]"
                  : "text-white/35 hover:bg-white/5 hover:text-white/55"
              }`}
            >
              {active && (
                <span className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-[3px] bg-[#9945FF]" />
              )}
              <item.icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
            </Link>
          );
        })}
      </div>

      {/* Bottom: Settings */}
      <div className="mt-auto">
        <button
          title="Settings"
          className="w-[38px] h-[38px] flex items-center justify-center rounded-[10px] text-white/35 hover:bg-white/5 hover:text-white/55 transition-all"
        >
          <Settings className="w-[18px] h-[18px]" strokeWidth={1.8} />
        </button>
      </div>
    </nav>
  );
}
