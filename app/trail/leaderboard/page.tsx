"use client";

import { useState, useEffect } from "react";
import { CRTWrapper } from "@/components/trail/CRTWrapper";
import { TrailNav } from "@/components/trail/TrailNav";
import { PixelPFP } from "@/components/trail/PixelPFP";
import type { LeaderboardEntry, KOLDeathEntry } from "@/lib/trail-db";

type Tab = "scores" | "deaths";

export default function TrailLeaderboard() {
  const [tab, setTab] = useState<Tab>("scores");
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [deaths, setDeaths] = useState<KOLDeathEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/trail/leaderboard?type=score&limit=50").then(r => r.json()),
      fetch("/api/trail/leaderboard?type=deaths").then(r => r.json()),
    ])
      .then(([scoreData, deathData]) => {
        setScores(scoreData.leaderboard || []);
        setDeaths(deathData.deaths || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <CRTWrapper showSkip={false}>
      <TrailNav />

      <div className="space-y-6">
        <h1 className="text-xl tracking-wider">═══ LEADERBOARD ═══</h1>

        {/* Tabs */}
        <div className="flex gap-1">
          <TabButton active={tab === "scores"} onClick={() => setTab("scores")}>
            HIGH SCORES
          </TabButton>
          <TabButton active={tab === "deaths"} onClick={() => setTab("deaths")}>
            KOL DEATH BOARD
          </TabButton>
        </div>

        {loading && (
          <div className="text-center py-8 text-[#33ff33]/40 animate-pulse">
            LOADING DATA...
          </div>
        )}

        {/* High Scores */}
        {!loading && tab === "scores" && (
          <div className="border border-[#33ff33]/20 p-4">
            {scores.length === 0 ? (
              <div className="text-center py-6 text-[#33ff33]/40 text-sm">
                No games played yet. Be the first!
              </div>
            ) : (
              <div className="space-y-1">
                <div className="grid grid-cols-[2rem_1fr_auto_auto_auto] gap-3 text-[10px] text-[#33ff33]/30 border-b border-[#33ff33]/10 pb-1">
                  <span>#</span>
                  <span>PLAYER</span>
                  <span>PROFESSION</span>
                  <span>TRAIL SCORE</span>
                  <span>SOL SCORE</span>
                </div>
                {scores.map((entry, i) => (
                  <div
                    key={entry.id}
                    className={`grid grid-cols-[2rem_1fr_auto_auto_auto] gap-3 items-center text-xs py-1.5 ${
                      i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-400" : "text-[#33ff33]/70"
                    }`}
                  >
                    <span className="text-[#33ff33]/30">{i + 1}</span>
                    <div className="flex items-center gap-2 min-w-0">
                      {entry.twitter_handle ? (
                        <>
                          <PixelPFP handle={entry.twitter_handle} size={24} />
                          <span className="truncate">@{entry.twitter_handle}</span>
                        </>
                      ) : entry.wallet ? (
                        <span className="font-mono truncate">{entry.wallet.slice(0, 4)}...{entry.wallet.slice(-4)}</span>
                      ) : (
                        <span className="truncate">{entry.player_name}</span>
                      )}
                    </div>
                    <span className="text-[#33ff33]/40">{entry.profession}</span>
                    <span className="font-bold">{entry.final_score}</span>
                    <span className="text-[#33ff33]/40">{entry.solana_score ?? "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* KOL Death Board */}
        {!loading && tab === "deaths" && (
          <div className="border border-[#33ff33]/20 p-4">
            {deaths.length === 0 ? (
              <div className="text-center py-6 text-[#33ff33]/40 text-sm">
                No KOLs have died yet. Play a game!
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-[auto_1fr_3rem] gap-3 text-[10px] text-[#33ff33]/30 border-b border-[#33ff33]/10 pb-1">
                  <span>KOL</span>
                  <span>MOST COMMON CAUSE OF DEATH</span>
                  <span className="text-right">DEATHS</span>
                </div>
                {deaths.map((kol, i) => (
                  <div key={kol.kol_handle} className="grid grid-cols-[auto_1fr_3rem] gap-3 items-start text-xs">
                    <div className="flex items-center gap-2">
                      <PixelPFP handle={kol.kol_handle} size={28} />
                      <div>
                        <div className="text-[#33ff33]/80">@{kol.kol_handle}</div>
                        {i === 0 && <div className="text-[8px] text-red-400/60">MOST TARGETED</div>}
                        {deaths.length > 2 && i === deaths.length - 1 && (
                          <div className="text-[8px] text-[#33ff33]/30">SAFEST KOL</div>
                        )}
                      </div>
                    </div>
                    <div className="text-[#33ff33]/40 text-[11px] leading-tight pt-1">
                      &ldquo;{kol.top_death}&rdquo;
                    </div>
                    <div className="text-right">
                      <span className="text-red-400/80 font-bold">{kol.death_count}</span>
                      <div className="text-[8px] text-[#33ff33]/20">☠</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </CRTWrapper>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 text-xs font-mono border transition-all ${
        active
          ? "border-[#33ff33] text-[#33ff33] bg-[#33ff33]/10"
          : "border-[#33ff33]/20 text-[#33ff33]/40 hover:text-[#33ff33]/70 hover:border-[#33ff33]/40"
      }`}
    >
      {children}
    </button>
  );
}
