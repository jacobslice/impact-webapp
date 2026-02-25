"use client";

import Link from "next/link";
import { MOCK_LEADERBOARD } from "@/lib/mock-data";
import { getTier, truncateAddress } from "@/lib/types";

interface LeaderboardTableProps {
  highlightWallet?: string;
  limit?: number;
  showTitle?: boolean;
}

export function LeaderboardTable({
  highlightWallet,
  limit = 10,
  showTitle = true,
}: LeaderboardTableProps) {
  const entries = MOCK_LEADERBOARD.slice(0, limit);

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <span className="text-[13px]">🥇</span>;
    if (rank === 2) return <span className="text-[13px]">🥈</span>;
    if (rank === 3) return <span className="text-[13px]">🥉</span>;
    return <span className="font-extrabold text-white/90">{rank}</span>;
  };

  return (
    <div>
      {showTitle && (
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-white/35 mb-3.5">
          Leaderboard
        </div>
      )}
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-[9.5px] font-semibold uppercase tracking-wider text-white/35 border-b border-white/[0.04]">
            <th className="text-left py-0 px-2 pb-2.5 w-10">#</th>
            <th className="text-left py-0 px-2 pb-2.5">Wallet</th>
            <th className="text-right py-0 px-2 pb-2.5">Score</th>
            <th className="text-right py-0 px-2 pb-2.5">Tier</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const tier = getTier(entry.score);
            const isYou =
              highlightWallet &&
              entry.wallet.toLowerCase() === highlightWallet.toLowerCase();
            return (
              <tr
                key={entry.wallet}
                className={`border-b border-white/[0.025] hover:bg-white/[0.015] transition-colors ${
                  isYou ? "bg-[#9945FF]/8" : ""
                }`}
              >
                <td className="py-2 px-2">{getRankDisplay(entry.rank)}</td>
                <td className="py-2 px-2">
                  <Link
                    href={`/score/${entry.wallet}`}
                    className="font-mono text-[11px] text-white/55 hover:text-white/80 transition-colors"
                  >
                    {truncateAddress(entry.wallet, 6)}
                    {isYou && (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white ml-1">
                        YOU
                      </span>
                    )}
                  </Link>
                </td>
                <td className="py-2 px-2 text-right font-extrabold text-[#14F195] text-[11.5px]">
                  {entry.score.toFixed(2)}
                </td>
                <td className={`py-2 px-2 text-right text-[10px] font-semibold ${tier.color}`}>
                  <span className="mr-1">{tier.icon}</span>
                  {tier.name}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
