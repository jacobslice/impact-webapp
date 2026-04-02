"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/trail", label: "PLAY" },
  { href: "/trail/dashboard", label: "DASHBOARD" },
  { href: "/trail/leaderboard", label: "LEADERBOARD" },
];

export function TrailNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between border-b border-[#33ff33]/20 pb-3 mb-6">
      <div className="text-sm tracking-widest text-[#33ff33]/60">
        ═══ SOLANA TRAIL ═══
      </div>
      <div className="flex gap-1">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1 text-xs font-mono border transition-all ${
                isActive
                  ? "border-[#33ff33] text-[#33ff33] bg-[#33ff33]/10"
                  : "border-[#33ff33]/20 text-[#33ff33]/40 hover:text-[#33ff33]/70 hover:border-[#33ff33]/40"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
