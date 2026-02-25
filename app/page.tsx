"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";

export default function HomePage() {
  const [address, setAddress] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const val = address.trim();
    if (!val) return;
    router.push(`/score/${encodeURIComponent(val)}`);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-[#9945FF] via-[#00D1FF] to-[#14F195] bg-clip-text text-transparent">
          Solana Score
        </h1>
        <p className="text-white/55 text-sm max-w-md mx-auto">
          Measure your on-chain reputation across the Solana ecosystem.
          Search any wallet to see its score.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-10">
        <div className="glass-card flex items-center gap-3 p-2 pr-2">
          <Search className="w-5 h-5 text-white/35 ml-3 shrink-0" />
          <input
            type="text"
            placeholder="Enter Solana wallet address or .sol domain..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1 bg-transparent text-white/90 text-sm outline-none placeholder:text-white/35"
          />
          <button
            type="submit"
            disabled={!address.trim()}
            className="h-10 px-6 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white hover:shadow-[0_2px_20px_rgba(153,69,255,0.4)] hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            Check Score
          </button>
        </div>
      </form>

      {/* Leaderboard */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🏆</span>
          <h2 className="text-sm font-bold text-white/90">Top Solana Scores</h2>
        </div>
        <LeaderboardTable limit={10} showTitle={false} />
      </div>
    </div>
  );
}
