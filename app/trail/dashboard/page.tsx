"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useTwitterProfile } from "@/components/social/TwitterConnect";
import { CRTWrapper } from "@/components/trail/CRTWrapper";
import { TrailNav } from "@/components/trail/TrailNav";
import { PixelPFP } from "@/components/trail/PixelPFP";
import {
  getTier, truncateAddress, estimatePercentile, estimateRank,
  computeBreakdown, computeSectorScores,
} from "@/lib/types";
import type { ScoreData, ScoreBreakdownItem, SectorScore } from "@/lib/types";
import type { PlayerStats, GameResult } from "@/lib/trail-db";

export default function TrailDashboard() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { profile, link: linkTwitter } = useTwitterProfile();
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [games, setGames] = useState<GameResult[]>([]);
  const [trailLoading, setTrailLoading] = useState(false);
  const [expandedGame, setExpandedGame] = useState<number | null>(null);

  const wallet = connected && publicKey ? publicKey.toBase58() : null;
  const twitter = profile?.handle || null;
  const hasIdentity = wallet || twitter;

  // Fetch Solana Score from Dune
  useEffect(() => {
    if (!wallet) return;
    setScoreLoading(true);
    fetch(`/api/score?address=${encodeURIComponent(wallet)}`)
      .then(r => r.json())
      .then(data => { if (data.data) setScoreData(data.data); })
      .catch(() => {})
      .finally(() => setScoreLoading(false));
  }, [wallet]);

  // Fetch trail game history
  useEffect(() => {
    if (!hasIdentity) return;
    setTrailLoading(true);
    const params = new URLSearchParams();
    if (wallet) params.set("wallet", wallet);
    else if (twitter) params.set("twitter", twitter);

    fetch(`/api/trail/history?${params}`)
      .then(r => r.json())
      .then(data => {
        setStats(data.stats || null);
        setGames(data.games || []);
      })
      .catch(() => {})
      .finally(() => setTrailLoading(false));
  }, [wallet, twitter, hasIdentity]);

  const tier = scoreData ? getTier(scoreData.score) : null;
  const percentile = scoreData ? estimatePercentile(scoreData.score) : null;
  const rank = scoreData ? estimateRank(scoreData.score) : null;
  const breakdown = scoreData ? computeBreakdown(scoreData) : null;
  const sectors = scoreData ? computeSectorScores(scoreData) : null;

  return (
    <CRTWrapper showSkip={false}>
      <TrailNav />

      <div className="space-y-5">
        <h1 className="text-xl tracking-wider">═══ DASHBOARD ═══</h1>

        {/* ── IDENTITY ── */}
        <div className="border border-[#33ff33]/20 p-4 space-y-3">
          <div className="text-xs text-[#33ff33]/40">IDENTITY</div>
          <div className="flex items-center gap-4 flex-wrap">
            {profile ? (
              <div className="flex items-center gap-2">
                <PixelPFP handle={profile.handle} size={36} />
                <span className="text-sm">@{profile.handle}</span>
                <span className="text-[#33ff33]/30 text-xs">✓ connected</span>
              </div>
            ) : (
              <button
                onClick={linkTwitter}
                className="px-3 py-1.5 border border-[#1DA1F2]/40 text-[#1DA1F2]/80 hover:bg-[#1DA1F2]/10 text-xs font-mono transition-all"
              >
                𝕏 CONNECT X
              </button>
            )}
            {wallet ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#33ff33]/50 font-mono">{truncateAddress(wallet, 6)}</span>
                <span className="text-[#33ff33]/30 text-xs">✓ wallet</span>
              </div>
            ) : (
              <button
                onClick={() => setVisible(true)}
                className="px-3 py-1.5 border border-[#33ff33]/30 text-[#33ff33]/60 hover:bg-[#33ff33]/10 text-xs font-mono transition-all"
              >
                CONNECT WALLET
              </button>
            )}
          </div>
        </div>

        {!hasIdentity && (
          <div className="text-center py-8 text-[#33ff33]/40">
            <p className="text-sm">Connect your wallet or X account to view your dashboard.</p>
          </div>
        )}

        {(scoreLoading || trailLoading) && (
          <div className="text-center py-4 text-[#33ff33]/40 animate-pulse text-sm">
            LOADING DATA...
          </div>
        )}

        {/* ── SOLANA SCORE ── */}
        {scoreData && tier && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-5">
              {/* Score + Tier */}
              <div className="border border-[#33ff33]/20 p-4 text-center">
                <div className="text-xs text-[#33ff33]/40 mb-2">SOLANA SCORE</div>
                <div className="text-5xl font-bold" style={{ textShadow: "0 0 20px #33ff33, 0 0 40px #33ff3366" }}>
                  {typeof scoreData.score === "number" ? scoreData.score.toFixed(2) : scoreData.score}
                </div>
                <div className="text-sm mt-1" style={{ color: tier.color }}>{tier.name}</div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-[10px]">
                  <div className="border border-[#33ff33]/10 p-1.5">
                    <div className="text-[#33ff33]/30">PERCENTILE</div>
                    <div className="text-[#33ff33]/80">Top {(100 - (percentile ?? 0)).toFixed(1)}%</div>
                  </div>
                  <div className="border border-[#33ff33]/10 p-1.5">
                    <div className="text-[#33ff33]/30">RANK</div>
                    <div className="text-[#33ff33]/80">#{(rank ?? 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-3">
                <CRTStatCard
                  label="SYBIL CHECK"
                  value={scoreData.is_sybil === "true" || scoreData.is_sybil === "1" ? "FAIL" : "PASS"}
                  color={scoreData.is_sybil === "true" || scoreData.is_sybil === "1" ? "#ff4444" : "#33ff33"}
                />
                <CRTStatCard
                  label="NETWORK FEES"
                  value={`${scoreData.network_fees_paid.toFixed(2)} SOL`}
                />
                <CRTStatCard
                  label="WALLET AGE"
                  value={`${scoreData.months_active} month${scoreData.months_active !== 1 ? "s" : ""}`}
                />
                <CRTStatCard
                  label="PROTOCOLS USED"
                  value={`${scoreData.protocol_count}`}
                />
              </div>
            </div>

            {/* ── SCORE BREAKDOWN ── */}
            {breakdown && (
              <div className="border border-[#33ff33]/20 p-4">
                <div className="text-xs text-[#33ff33]/40 mb-3">SCORE BREAKDOWN</div>
                <div className="space-y-2">
                  {breakdown.map((b, i) => (
                    <CRTBar key={i} item={b} />
                  ))}
                </div>
              </div>
            )}

            {/* ── SECTOR ACTIVITY ── */}
            {sectors && (
              <div className="border border-[#33ff33]/20 p-4">
                <div className="text-xs text-[#33ff33]/40 mb-3">SECTOR ACTIVITY</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sectors.map((s, i) => (
                    <CRTSector key={i} sector={s} />
                  ))}
                </div>
              </div>
            )}

            {/* ── PROTOCOLS USED ── */}
            {scoreData.protocols_used && (
              <div className="border border-[#33ff33]/20 p-4">
                <div className="text-xs text-[#33ff33]/40 mb-3">PROTOCOLS USED</div>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(scoreData.protocols_used)
                    ? scoreData.protocols_used
                    : scoreData.protocols_used.split(",").map(s => s.trim())
                  ).filter(Boolean).map((p, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 border border-[#33ff33]/15 text-[#33ff33]/60 text-[10px] font-mono"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── TRAIL GAME STATS ── */}
        {stats && stats.games_played > 0 && (
          <div className="border border-[#33ff33]/20 p-4">
            <div className="text-xs text-[#33ff33]/40 mb-3">TRAIL STATS</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatBox label="GAMES PLAYED" value={stats.games_played} />
              <StatBox label="BEST SCORE" value={stats.best_score} />
              <StatBox label="AVG SCORE" value={stats.avg_score} />
              <StatBox label="KOLs KILLED" value={stats.total_kols_killed} />
            </div>
            {stats.favorite_profession && (
              <div className="mt-3 text-xs text-[#33ff33]/40">
                Favorite profession: <span className="text-[#33ff33]/70">{stats.favorite_profession}</span>
              </div>
            )}
          </div>
        )}

        {/* ── GAME HISTORY ── */}
        {games.length > 0 && (
          <div className="border border-[#33ff33]/20 p-4">
            <div className="text-xs text-[#33ff33]/40 mb-3">GAME HISTORY</div>
            <div className="space-y-1">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 text-[10px] text-[#33ff33]/30 border-b border-[#33ff33]/10 pb-1">
                <span>DATE</span>
                <span>PROFESSION</span>
                <span>SCORE</span>
                <span>SURVIVORS</span>
              </div>
              {games.map(game => (
                <div key={game.id}>
                  <button
                    onClick={() => setExpandedGame(expandedGame === game.id ? null : game.id)}
                    className="w-full grid grid-cols-[1fr_auto_auto_auto] gap-3 text-xs py-1.5 hover:bg-[#33ff33]/5 transition-colors text-left"
                  >
                    <span className="text-[#33ff33]/50">
                      {new Date(game.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <span className="text-[#33ff33]/60">{game.profession}</span>
                    <span className="text-[#33ff33]">{game.final_score}</span>
                    <span className="text-[#33ff33]/60">{game.survivors}/{game.party_size}</span>
                  </button>
                  {expandedGame === game.id && (
                    <div className="border-l border-[#33ff33]/10 ml-2 pl-3 py-2 space-y-1 text-[10px] text-[#33ff33]/40 max-h-40 overflow-y-auto">
                      {(game.events_log || []).map((event, i) => (
                        <div key={i}>{event}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {hasIdentity && !trailLoading && !scoreLoading && !scoreData && (!stats || stats.games_played === 0) && (
          <div className="text-center py-8 text-[#33ff33]/40">
            <p className="text-sm">No data found for this wallet.</p>
            <a href="/trail" className="inline-block mt-3 px-4 py-2 border border-[#33ff33]/30 text-[#33ff33]/60 hover:bg-[#33ff33]/10 text-xs font-mono transition-all">
              PLAY YOUR FIRST GAME →
            </a>
          </div>
        )}
      </div>
    </CRTWrapper>
  );
}

// ── CRT-styled sub-components ──

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-lg text-[#33ff33]">{value.toLocaleString()}</div>
      <div className="text-[10px] text-[#33ff33]/30">{label}</div>
    </div>
  );
}

function CRTStatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="border border-[#33ff33]/15 p-3">
      <div className="text-[10px] text-[#33ff33]/30 mb-1">{label}</div>
      <div className="text-sm font-bold" style={{ color: color || "#33ff33" }}>{value}</div>
    </div>
  );
}

function CRTBar({ item }: { item: ScoreBreakdownItem }) {
  const pct = Math.min(100, Math.max(0, item.score));
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-36 text-[#33ff33]/60 shrink-0">
        {item.name} {item.weight ? `(${item.weight})` : ""}
      </span>
      <div className="flex-1 bg-[#33ff33]/10 h-3 relative">
        <div
          className="h-full bg-[#33ff33]/50 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-[#33ff33]/80">{Math.round(item.score)}</span>
    </div>
  );
}

function CRTSector({ sector }: { sector: SectorScore }) {
  const pct = Math.min(100, Math.max(0, sector.score));
  return (
    <div className="border border-[#33ff33]/10 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#33ff33]/70">{sector.name}</span>
        <span className="text-[10px] text-[#33ff33]/40">{Math.round(pct)}%</span>
      </div>
      <div className="bg-[#33ff33]/10 h-2">
        <div
          className="h-full bg-[#33ff33]/40 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      {sector.protocols.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {sector.protocols.map((p, i) => (
            <span key={i} className="text-[8px] text-[#33ff33]/30 border border-[#33ff33]/10 px-1">
              {p}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-[8px] text-[#33ff33]/20">No activity</div>
      )}
    </div>
  );
}
