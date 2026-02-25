"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { WalletButton } from "@/components/wallet/WalletButton";

export function Topbar() {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const val = searchValue.trim();
    if (!val) return;
    router.push(`/score/${encodeURIComponent(val)}`);
    setSearchValue("");
  };

  return (
    <header className="fixed top-0 left-14 right-0 h-[52px] bg-[#0f0e17]/82 backdrop-blur-2xl border-b border-purple-500/15 flex items-center px-5 z-40 gap-4">
      {/* Brand */}
      <div className="flex items-baseline gap-1.5 whitespace-nowrap">
        <h1 className="text-[15px] font-bold bg-gradient-to-r from-[#9945FF] to-[#00D1FF] bg-clip-text text-transparent">
          Solana Score
        </h1>
        <span className="text-[10px] text-white/35">by Slice Analytics</span>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-[420px] relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/35" strokeWidth={2} />
        <input
          type="text"
          placeholder="Search wallet address or .sol domain..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full h-8 bg-white/[0.04] border border-purple-500/15 rounded-lg pl-8 pr-3 text-white/90 text-[11.5px] font-[inherit] outline-none transition-all placeholder:text-white/35 focus:border-purple-500/35 focus:shadow-[0_0_0_3px_rgba(153,69,255,0.08)]"
        />
      </form>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        <WalletButton />
      </div>
    </header>
  );
}
