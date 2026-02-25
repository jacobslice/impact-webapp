"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ScoreGauge } from "@/components/score/ScoreGauge";
import { ScoreBreakdownBars } from "@/components/score/ScoreBreakdownBars";
import { ProtocolGrid } from "@/components/dashboard/ProtocolGrid";
import { ShareOnX } from "@/components/share/ShareOnX";
import { MOCK_BREAKDOWN, MOCK_SCORE_DATA } from "@/lib/mock-data";
import { getTier, truncateAddress, formatCurrency, estimatePercentile, estimateRank } from "@/lib/types";
import type { ScoreData } from "@/lib/types";
import { Wallet, ArrowLeft } from "lucide-react";

export default function ScorePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const router = useRouter();
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScore = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/score?address=${encodeURIComponent(address)}`);
        const result = await response.json();

        if (!response.ok) {
          if (result.notFound) {
            setError("not_found");
          } else {
            setError(result.error || "Failed to fetch score");
          }
          return;
        }

        setScoreData(result.data);
      } catch {
        // Fall back to mock data if API fails
        if (address === MOCK_SCORE_DATA.wallet || address.startsWith("7xKXtg")) {
          setScoreData(MOCK_SCORE_DATA);
        } else {
          // Use mock data with the searched address for demo
          setScoreData({ ...MOCK_SCORE_DATA, wallet: address });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, [address]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#9945FF]/30 border-t-[#9945FF] rounded-full animate-spin" />
          <p className="text-white/55 text-sm">Loading score...</p>
        </div>
      </div>
    );
  }

  if (error === "not_found") {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-white/90 mb-2">Not Scored Yet</h2>
        <p className="text-white/55 text-sm mb-6">
          This address hasn&apos;t been analyzed yet. Check back later.
        </p>
        <button
          onClick={() => router.push("/")}
          className="h-10 px-5 rounded-lg text-sm font-semibold bg-white/5 border border-purple-500/15 text-white/55 hover:text-white/80 hover:bg-white/8 transition-all"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (error || !scoreData) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-white/90 mb-2">Error</h2>
        <p className="text-white/55 text-sm mb-6">{error || "Something went wrong"}</p>
        <button
          onClick={() => router.push("/")}
          className="h-10 px-5 rounded-lg text-sm font-semibold bg-white/5 border border-purple-500/15 text-white/55 hover:text-white/80 hover:bg-white/8 transition-all"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const tier = getTier(scoreData.score);
  const percentile = estimatePercentile(scoreData.score);
  const rank = estimateRank(scoreData.score);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-1.5 text-white/35 hover:text-white/60 text-[11px] font-medium mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Search
      </button>

      {/* Wallet header */}
      <div className="glass-card flex items-center gap-3.5 p-4 mb-5">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center text-white font-extrabold text-sm shrink-0">
          {address.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold text-white/90 font-mono truncate">
            {truncateAddress(address, 8)}
          </div>
          <div className="text-[11px] text-white/35">
            Simplified View — Connect wallet for full dashboard
          </div>
        </div>
        <div className="flex gap-2">
          <ShareOnX address={address} score={scoreData.score} tier={tier.name} />
          <button
            onClick={() => router.push("/dashboard")}
            className="h-8 px-3.5 rounded-lg text-[11px] font-semibold bg-gradient-to-r from-[#9945FF] to-[#7c3aed] text-white shadow-[0_2px_12px_rgba(153,69,255,0.25)] hover:shadow-[0_2px_20px_rgba(153,69,255,0.4)] hover:-translate-y-px transition-all flex items-center gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5" />
            Connect for Full View
          </button>
        </div>
      </div>

      {/* Score + Breakdown row */}
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

        {/* Breakdown */}
        <div className="glass-card p-5">
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-white/35 mb-4">
            Score Breakdown
          </div>
          <ScoreBreakdownBars items={MOCK_BREAKDOWN} />

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/[0.04]">
            <div>
              <div className="text-[9.5px] text-white/35 font-medium uppercase tracking-wider mb-1">
                Protocol Fees
              </div>
              <div className="text-sm font-bold text-white/90">
                {formatCurrency(scoreData.protocol_fees_paid)}
              </div>
            </div>
            <div>
              <div className="text-[9.5px] text-white/35 font-medium uppercase tracking-wider mb-1">
                Holdings
              </div>
              <div className="text-sm font-bold text-white/90">
                {formatCurrency(scoreData.current_holdings)}
              </div>
            </div>
            <div>
              <div className="text-[9.5px] text-white/35 font-medium uppercase tracking-wider mb-1">
                Months Active
              </div>
              <div className="text-sm font-bold text-white/90">
                {scoreData.months_active}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Protocols */}
      {scoreData.protocols_used && (
        <ProtocolGrid protocolsUsed={scoreData.protocols_used} />
      )}
    </div>
  );
}
