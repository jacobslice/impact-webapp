"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { ScoreDistribution } from "@/components/dashboard/ScoreDistribution";

export default function LeaderboardPage() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🏆</span>
        <div>
          <h1 className="text-xl font-bold text-white/90">Leaderboard</h1>
          <p className="text-[11px] text-white/35">
            Top Solana Score wallets — updated weekly
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
        {/* Main leaderboard */}
        <div className="glass-card p-5">
          <LeaderboardTable
            highlightWallet={walletAddress}
            limit={20}
            showTitle={false}
          />
        </div>

        {/* Sidebar: Distribution + Info */}
        <div className="flex flex-col gap-5">
          <div className="glass-card p-5">
            <ScoreDistribution userScore={walletAddress ? 87 : 50} />
          </div>

          <div className="glass-card p-5">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-white/35 mb-3">
              About the Leaderboard
            </div>
            <p className="text-[11.5px] text-white/55 leading-relaxed">
              Rankings are based on Solana Score, which measures cross-protocol
              activity including transaction volume, protocol diversity, account
              age, DeFi activity, NFT engagement, and governance participation.
            </p>
            <p className="text-[11.5px] text-white/55 leading-relaxed mt-3">
              Data is sourced from Dune Analytics and refreshed weekly. Only
              wallets with confirmed on-chain activity are included.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
