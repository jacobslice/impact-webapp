"use client";

import { getTier } from "@/lib/types";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "lg";
}

export function ScoreGauge({ score, size = "lg" }: ScoreGaugeProps) {
  const tier = getTier(score);
  // Half-circle gauge: arc from left to right
  // Radius=90, center at (110,120), arc goes from (20,120) to (200,120)
  // Total arc length ≈ 283 (π * 90)
  const arcLength = Math.PI * 90;
  const filledLength = (score / 100) * arcLength;
  const dashOffset = arcLength - filledLength;

  const isSmall = size === "sm";
  const wrapW = isSmall ? 160 : 220;
  const wrapH = isSmall ? 95 : 130;

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="relative"
        style={{ width: wrapW, height: wrapH }}
      >
        <svg
          viewBox="0 0 220 130"
          width={wrapW}
          height={wrapH}
        >
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff4444" />
              <stop offset="25%" stopColor="#ff9f43" />
              <stop offset="50%" stopColor="#ffd93d" />
              <stop offset="75%" stopColor="#14F195" />
              <stop offset="100%" stopColor="#00D1FF" />
            </linearGradient>
            <filter id="gaugeGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Track */}
          <path
            d="M 20 120 A 90 90 0 0 1 200 120"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d="M 20 120 A 90 90 0 0 1 200 120"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={dashOffset}
            filter="url(#gaugeGlow)"
            className="transition-all duration-1000 ease-out"
          />
          {/* Tick marks */}
          <text x="14" y="128" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="Inter" fontWeight="500">0</text>
          <text x="104" y="16" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="Inter" fontWeight="500">50</text>
          <text x="194" y="128" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="Inter" fontWeight="500">100</text>
        </svg>
        {/* Score value */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
          <span
            className={`font-black leading-none bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent ${
              isSmall ? "text-3xl" : "text-[42px]"
            }`}
          >
            {Math.round(score)}
          </span>
        </div>
      </div>

      {/* Tier badge */}
      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#9945FF]/15 to-[#14F195]/10 border border-[#9945FF]/20 rounded-full px-3.5 py-1 text-[11px] font-bold text-[#14F195] mt-2">
        <span>{tier.icon}</span>
        {tier.name}
      </div>
    </div>
  );
}
