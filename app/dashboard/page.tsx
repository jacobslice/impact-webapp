"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { ScoreGauge } from "@/components/score/ScoreGauge";
import { ScoreBreakdownBars } from "@/components/score/ScoreBreakdownBars";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ProtocolGrid } from "@/components/dashboard/ProtocolGrid";
import { ScoreDistribution } from "@/components/dashboard/ScoreDistribution";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { ShareOnX } from "@/components/share/ShareOnX";
import { WalletIdentity } from "@/components/social/TwitterConnect";
import { MOCK_BREAKDOWN, MOCK_SCORE_DATA } from "@/lib/mock-data";
import { getTier, truncateAddress, estimatePercentile, estimateRank } from "@/lib/types";
import type { ScoreData } from "@/lib/types";
import { Wallet } from "lucide-react";

export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const router = useRouter();
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) return;

    const fetchScore = async () => {
      setLoading(true);
      const address = publicKey.toBase58();

      try {
        const response = await fetch(`/api/score?address=${encodeURIComponent(address)}`);
        const result = await response.json();

        if (response.ok) {
          setScoreData(result.data);
        } else {
          // Fallback to mock data for demo
          setScoreData({ ...MOCK_SCORE_DATA, wallet: address });
        }
      } catch {
        setScoreData({ ...MOCK_SCORE_DATA, wallet: address });
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, [connected, publicKey]);

  // Not connected state
  if (!connected || !publicKey) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="glass-card p-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center mx-auto mb-5">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white/90 mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-white/55 text-sm mb-6 max-w-sm mx-auto">
            Connect your Solana wallet to see your full dashboard with detailed score breakdown, stats, and leaderboard position.
          </p>
          <button
            onClick={() => setVisible(true)}
            className="h-11 px-6 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#9945FF] to-[#7c3aed] text-white shadow-[0_2px_12px_rgba(153,69,255,0.25)] hover:shadow-[0_2px_20px_rgba(153,69,255,0.4)] hover:-translate-y-px transition-all"
          >
            Connect Wallet
          </button>
          <p className="text-white/35 text-xs mt-4">
            Or{" "}
            <button
              onClick={() => router.push("/")}
              className="text-[#9945FF] hover:underline"
            >
              search any wallet
            </button>{" "}
            for a simplified view
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#9945FF]/30 border-t-[#9945FF] rounded-full animate-spin" />
          <p className="text-white/55 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!scoreData) return null;

  const address = publicKey.toBase58();
  const tier = getTier(scoreData.score);
  const percentile = estimatePercentile(scoreData.score);
  const rank = estimateRank(scoreData.score);

  return (
    <div>
      {/* Wallet header */}
      <div className="glass-card flex items-center p-4 mb-5">
        <div className="flex-1 min-w-0">
          <WalletIdentity address={address} truncatedAddress={truncateAddress(address, 8)} />
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <ShareOnX address={address} score={scoreData.score} tier={tier.name} />
        </div>
      </div>

      {/* Top row: Score gauge + Stats + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5 mb-5">
        {/* Score gauge card */}
        <div className="glass-card p-6 flex flex-col items-center relative overflow-hidden">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[260px] h-[200px] bg-[radial-gradient(ellipse,rgba(153,69,255,0.12)_0%,transparent_70%)] pointer-events-none" />
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-white/35 mb-4 self-start">
            Wallet Score
          </div>
          <ScoreGauge score={scoreData.score} />

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-2 w-full mt-4">
            <div className="bg-white/[0.03] border border-white/[0.04] rounded-lg p-2 text-center">
              <div className="text-[9.5px] text-white/35 font-medium uppercase tracking-wider mb-0.5">
                Percentile
              </div>
              <div className="text-sm font-bold text-white/90">
                Top {(100 - percentile).toFixed(1)}%
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.04] rounded-lg p-2 text-center">
              <div className="text-[9.5px] text-white/35 font-medium uppercase tracking-wider mb-0.5">
                Rank
              </div>
              <div className="text-sm font-bold text-white/90">
                #{rank.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Stats + Breakdown */}
        <div className="flex flex-col gap-5">
          <StatsCards data={scoreData} />
          <div className="glass-card p-5 flex-1">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-white/35 mb-4">
              Score Breakdown
            </div>
            <ScoreBreakdownBars items={MOCK_BREAKDOWN} />
          </div>
        </div>
      </div>

      {/* Protocols */}
      {scoreData.protocols_used && (
        <div className="mb-5">
          <ProtocolGrid protocolsUsed={scoreData.protocols_used} />
        </div>
      )}

      {/* Bottom row: Leaderboard + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <LeaderboardTable highlightWallet={address} limit={10} />
        </div>
        <div className="glass-card p-5">
          <ScoreDistribution userScore={scoreData.score} />
        </div>
      </div>
    </div>
  );
}
