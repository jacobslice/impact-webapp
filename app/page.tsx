"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getProtocol, SECTOR_COLORS } from "@/lib/protocols";
import {
  getScoreTier,
  estimatePercentile,
  getRecentLookups,
  addRecentLookup,
  truncateAddress,
  type RecentLookup,
} from "@/lib/score-utils";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { LEADERBOARD_DATA, obfuscateAddress } from "@/lib/leaderboard-data";

interface ScoreData {
  wallet: string;
  score: number;
  protocol_fees_paid: number;
  network_fees_paid: number;
  current_holdings: number;
  protocol_count: number;
  protocols_used: string | null;
  months_active: number;
  jup_fees_paid: number;
  jup_staker: boolean;
  jup_perps_user: boolean;
}

export default function Home() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recentLookups, setRecentLookups] = useState<RecentLookup[]>([]);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    setRecentLookups(getRecentLookups());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchScore(address.trim());
  };

  const fetchScore = async (addr: string) => {
    if (!addr) return;

    setLoading(true);
    setError(null);
    setScoreData(null);
    setNotFound(false);
    setShowBreakdown(false);

    try {
      const response = await fetch(
        `/api/score?address=${encodeURIComponent(addr)}`
      );
      const result = await response.json();

      if (!response.ok) {
        if (result.notFound) {
          setNotFound(true);
        } else {
          setError(result.error || "Failed to fetch score");
        }
        return;
      }

      setScoreData(result.data);

      const tier = getScoreTier(result.data.score);
      addRecentLookup({
        address: result.data.wallet,
        score: result.data.score,
        tier: tier.name,
      });
      setRecentLookups(getRecentLookups());
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = async () => {
    if (!scoreData?.wallet) return;
    try {
      await navigator.clipboard.writeText(scoreData.wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const protocols =
    scoreData?.protocols_used && typeof scoreData.protocols_used === "string"
      ? scoreData.protocols_used.split(",").map((p) => p.trim())
      : [];

  const tier = scoreData ? getScoreTier(scoreData.score) : null;
  const percentile = scoreData ? estimatePercentile(scoreData.score) : 0;

  return (
    <div className="min-h-screen text-white">
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Header with Logo */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/slice-logo.png"
              alt="Slice Analytics"
              width={120}
              height={40}
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
          <h1 className="text-5xl font-bold mb-4 tracking-tight bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#9945FF] bg-clip-text text-transparent drop-shadow-[0_0_32px_rgba(153,69,255,0.3)]">
            Solana Score
          </h1>
          <p className="text-zinc-400">
            Check your on-chain reputation score on Solana
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3 rounded-xl">
            <Input
              type="text"
              placeholder="Enter Solana address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1 h-12 backdrop-blur-sm bg-zinc-900/60 border-zinc-700/50 text-white placeholder:text-zinc-500 text-base focus:ring-[#9945FF]/50 focus:border-[#9945FF]/50"
            />
            <Button
              type="submit"
              disabled={loading || !address.trim()}
              className="h-12 bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-[#8035E5] hover:to-[#10D480] text-white px-8 font-medium transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Loading
                </span>
              ) : (
                "Check Score"
              )}
            </Button>
          </div>
        </form>

        {/* Recent Lookups */}
        {!scoreData && !loading && recentLookups.length > 0 && (
          <div className="mb-8">
            <p className="text-sm text-zinc-500 mb-3">Recent lookups</p>
            <div className="flex flex-wrap gap-2">
              {recentLookups.map((lookup) => (
                <button
                  key={lookup.address}
                  onClick={() => {
                    setAddress(lookup.address);
                    fetchScore(lookup.address);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-900/40 backdrop-blur-sm hover:bg-zinc-800/60 border border-zinc-700/50 rounded-lg text-sm transition-all hover:scale-[1.02]"
                >
                  <span className="text-zinc-400 font-mono">
                    {truncateAddress(lookup.address, 6)}
                  </span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-300">{lookup.score.toFixed(1)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard - Show when no score is loaded */}
        {!scoreData && !loading && !error && !notFound && (
          <Card className="glass relative overflow-hidden border-zinc-800/50 mb-8 accent-bar-solana">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Top Solana Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
                      <th className="text-left py-3 px-2">#</th>
                      <th className="text-left py-3 px-2">Address</th>
                      <th className="text-right py-3 px-2">Score</th>
                      <th className="text-right py-3 px-2">Protocols</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LEADERBOARD_DATA.slice(0, 10).map((entry, index) => (
                      <tr
                        key={entry.wallet}
                        className="border-b border-zinc-800/50 hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => {
                          setAddress(entry.wallet);
                          fetchScore(entry.wallet);
                        }}
                      >
                        <td className="py-3 px-2">
                          <span className={`font-bold ${
                            index === 0 ? "text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]" :
                            index === 1 ? "text-zinc-300 drop-shadow-[0_0_6px_rgba(212,212,216,0.3)]" :
                            index === 2 ? "text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.3)]" :
                            "text-zinc-500"
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-mono text-zinc-300">
                            {obfuscateAddress(entry.wallet)}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className="font-bold text-white">
                            {entry.score.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className="text-zinc-400">
                            {entry.protocolCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 mb-6">
            {error}
          </div>
        )}

        {/* Not Found State */}
        {notFound && (
          <Card className="bg-zinc-900 border-zinc-700">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Not Scored Yet
              </h3>
              <p className="text-zinc-400">
                This address hasn&apos;t been analyzed yet. Check back later.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Score Display */}
        {scoreData && tier && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Score Ring with Tier Badge */}
            <Card className="glass gradient-border overflow-hidden border-transparent fade-in-up fade-in-up-1">
              <CardContent className="p-8">
                <div className="flex flex-col items-center">
                  {/* Tier Badge */}
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 backdrop-blur-sm ${tier.bgColor} ${tier.borderColor} drop-shadow-[0_0_10px_rgba(153,69,255,0.15)]`}
                  >
                    <span className="text-lg">{tier.icon}</span>
                    <span className={`font-semibold ${tier.color}`}>
                      {tier.name}
                    </span>
                  </div>

                  {/* Score Ring */}
                  <div className="relative w-52 h-52 mb-4 glow-ring">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#27272a"
                        strokeWidth="6"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="url(#scoreGradient)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray="264 264"
                        strokeDashoffset={264 - (scoreData.score / 100) * 264}
                        className="score-ring-animate"
                        style={{ "--ring-offset": `${264 - (scoreData.score / 100) * 264}` } as React.CSSProperties}
                      />
                      <defs>
                        <linearGradient
                          id="scoreGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#9945FF" />
                          <stop offset="100%" stopColor="#14F195" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold text-white">
                        {scoreData.score.toFixed(1)}
                      </span>
                      <span className="text-zinc-500 text-sm font-medium">
                        out of 100
                      </span>
                    </div>
                  </div>

                  {/* Percentile */}
                  <p className="text-zinc-400 text-sm mb-4">
                    Top{" "}
                    <span className="text-white font-semibold">
                      {(100 - percentile).toFixed(1)}%
                    </span>{" "}
                    of Solana users
                  </p>

                  {/* Address with Copy Button */}
                  <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg px-3 py-2">
                    <p className="text-zinc-500 text-xs font-mono">
                      {truncateAddress(scoreData.wallet, 8)}
                    </p>
                    <button
                      onClick={copyAddress}
                      className="text-zinc-400 hover:text-white transition-colors"
                      title="Copy address"
                    >
                      {copied ? (
                        <svg
                          className="w-4 h-4 text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Breakdown Toggle */}
            <Card className="glass border-zinc-800/50 fade-in-up fade-in-up-2">
              <CardHeader
                className="cursor-pointer"
                onClick={() => setShowBreakdown(!showBreakdown)}
              >
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-zinc-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Score Breakdown
                  </span>
                  <svg
                    className={`w-5 h-5 text-zinc-400 transition-transform ${
                      showBreakdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </CardTitle>
              </CardHeader>
              {showBreakdown && (
                <CardContent>
                  <ScoreBreakdown
                    protocolFees={scoreData.protocol_fees_paid}
                    networkFees={scoreData.network_fees_paid}
                    holdings={scoreData.current_holdings}
                    protocolCount={scoreData.protocol_count}
                    monthsActive={scoreData.months_active}
                  />
                </CardContent>
              )}
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 fade-in-up fade-in-up-3">
              <Card className="glass relative overflow-hidden border-zinc-800/50 hover:border-zinc-700/50 transition-all accent-bar-purple">
                <CardHeader className="pb-1 pt-5 px-4">
                  <CardTitle className="text-xs text-zinc-500 uppercase tracking-wider">
                    Protocol Fees
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4 px-4">
                  <p className="text-3xl font-bold text-white">
                    ${scoreData.protocol_fees_paid.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass relative overflow-hidden border-zinc-800/50 hover:border-zinc-700/50 transition-all accent-bar-purple">
                <CardHeader className="pb-1 pt-5 px-4">
                  <CardTitle className="text-xs text-zinc-500 uppercase tracking-wider">
                    Network Fees
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4 px-4">
                  <p className="text-3xl font-bold text-white">
                    {scoreData.network_fees_paid.toFixed(4)}{" "}
                    <span className="text-lg text-zinc-400">SOL</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="glass relative overflow-hidden border-zinc-800/50 hover:border-zinc-700/50 transition-all accent-bar-green">
                <CardHeader className="pb-1 pt-5 px-4">
                  <CardTitle className="text-xs text-zinc-500 uppercase tracking-wider">
                    Holdings
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4 px-4">
                  <p className="text-3xl font-bold text-white">
                    ${scoreData.current_holdings.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass relative overflow-hidden border-zinc-800/50 hover:border-zinc-700/50 transition-all accent-bar-green">
                <CardHeader className="pb-1 pt-5 px-4">
                  <CardTitle className="text-xs text-zinc-500 uppercase tracking-wider">
                    Months Active
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4 px-4">
                  <p className="text-3xl font-bold text-white">
                    {scoreData.months_active}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Protocols Used */}
            <Card className="glass border-zinc-800/50 fade-in-up fade-in-up-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  Protocols Used
                  <span className="text-sm font-normal text-zinc-500">
                    ({scoreData.protocol_count})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {protocols.map((protocolName, index) => {
                    const protocol = getProtocol(protocolName);
                    const sectorColor =
                      SECTOR_COLORS[protocol.sector] || SECTOR_COLORS.Other;

                    return (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all hover:scale-110 hover:shadow-[0_0_12px_rgba(153,69,255,0.25)] ${sectorColor}`}
                          >
                            {protocol.logo ? (
                              <Image
                                src={protocol.logo}
                                alt={protocol.displayName}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              <span className="text-xl font-bold">
                                {protocol.displayName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="bg-zinc-800 border-zinc-700 text-white"
                        >
                          <div className="text-center">
                            <p className="font-medium">
                              {protocol.displayName}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {protocol.sector}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Jupiter Activity */}
            {(scoreData.jup_staker || scoreData.jup_perps_user) && (
              <Card className="glass border-zinc-800/50 fade-in-up fade-in-up-5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Image
                      src="/images/protocols/jupiter.svg"
                      alt="Jupiter"
                      width={20}
                      height={20}
                    />
                    Jupiter Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {scoreData.jup_staker && (
                      <span className="flex items-center gap-2 px-4 py-2 bg-purple-900/30 backdrop-blur-sm border border-purple-700/50 rounded-lg text-sm text-purple-300">
                        <svg
                          className="w-4 h-4 pulse-subtle"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        JUP Staker
                      </span>
                    )}
                    {scoreData.jup_perps_user && (
                      <span className="flex items-center gap-2 px-4 py-2 bg-green-900/30 backdrop-blur-sm border border-green-700/50 rounded-lg text-sm text-green-300">
                        <svg
                          className="w-4 h-4 pulse-subtle"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                        Perps User
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* New Search Button */}
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setScoreData(null);
                  setAddress("");
                }}
                className="border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
              >
                Check Another Address
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 text-center">
          <div className="h-px mb-8 bg-gradient-to-r from-transparent via-[#9945FF]/20 to-transparent" />
          <div className="flex items-center justify-center gap-2 text-zinc-500 text-xs opacity-30">
            <span>Powered by</span>
            <Image
              src="/images/slice-logo.png"
              alt="Slice Analytics"
              width={80}
              height={26}
              className="opacity-60"
            />
            <span className="mx-2">×</span>
            <Image
              src="/images/dune-logo.png"
              alt="Dune Analytics"
              width={60}
              height={20}
              className="opacity-60"
            />
          </div>
        </footer>
      </main>
    </div>
  );
}
