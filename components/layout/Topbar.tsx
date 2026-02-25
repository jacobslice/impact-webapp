"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { Search, LayoutDashboard } from "lucide-react";
import { WalletButton } from "@/components/wallet/WalletButton";

export function Topbar() {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();
  const { connected } = useWallet();

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
      <div className="flex items-center gap-2 whitespace-nowrap">
        <h1 className="text-[15px] font-bold bg-gradient-to-r from-[#9945FF] to-[#00D1FF] bg-clip-text text-transparent">
          Solana Score
        </h1>
        <span className="text-white/20">|</span>
        <Image
          src="/images/slice-analytics-full.png"
          alt="Slice Analytics"
          width={100}
          height={24}
          className="opacity-70 hover:opacity-90 transition-opacity h-[18px] w-auto"
        />
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
        {connected && (
          <button
            onClick={() => router.push("/dashboard")}
            className="h-8 px-3.5 rounded-lg text-[11px] font-semibold bg-white/5 border border-purple-500/15 text-white/55 hover:text-white/80 hover:bg-white/8 transition-all flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            My Dashboard
          </button>
        )}
        <WalletButton />
      </div>
    </header>
  );
}
