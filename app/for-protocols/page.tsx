"use client";

import { useState } from "react";
import {
  Shield,
  Users,
  Target,
  BarChart3,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Mail,
} from "lucide-react";

export default function ForProtocolsPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: Wire up to email service
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9945FF]/10 border border-[#9945FF]/20 text-[#9945FF] text-[10px] font-semibold uppercase tracking-wider mb-4">
          For Protocols
        </div>
        <h1 className="text-3xl font-black text-white/90 mb-3">
          Understand Your Users with{" "}
          <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
            Solana Score
          </span>
        </h1>
        <p className="text-white/55 text-sm max-w-xl mx-auto">
          Use on-chain reputation scoring for sybil removal, user understanding,
          and acquiring ideal customers across the Solana ecosystem.
        </p>
      </div>

      {/* Value Props */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {[
          {
            icon: Shield,
            title: "Sybil Removal",
            description:
              "Identify and filter bot/sybil wallets from genuine users. Higher scores correlate with organic behavior and real activity.",
          },
          {
            icon: Users,
            title: "User Understanding",
            description:
              "Segment your users by on-chain activity level, protocol diversity, and engagement depth to build better products.",
          },
          {
            icon: Target,
            title: "Customer Acquisition",
            description:
              "Target high-value users across the ecosystem. Score data helps you find users most likely to engage and retain.",
          },
        ].map((prop) => (
          <div key={prop.title} className="glass-card p-5">
            <prop.icon className="w-8 h-8 text-[#9945FF] mb-3" strokeWidth={1.5} />
            <h3 className="text-sm font-bold text-white/90 mb-2">{prop.title}</h3>
            <p className="text-[11.5px] text-white/55 leading-relaxed">
              {prop.description}
            </p>
          </div>
        ))}
      </div>

      {/* Case Study */}
      <div className="glass-card p-6 mb-12">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-5 h-5 text-[#14F195]" />
          <h2 className="text-lg font-bold text-white/90">
            Case Study: Jupiter Exchange
          </h2>
        </div>

        <p className="text-[11.5px] text-white/55 leading-relaxed mb-5">
          We analyzed <span className="text-white/90 font-semibold">30 million Jupiter users</span> to
          validate that Solana Score effectively measures genuine user quality and
          predicts valuable on-chain behavior.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Users Analyzed", value: "30M", icon: Users },
            { label: "Score Correlation", value: "Strong", icon: TrendingUp },
            { label: "Sybil Detection", value: "92%", icon: Shield },
            { label: "Retention Lift", value: "3.2x", icon: CheckCircle },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/[0.03] border border-white/[0.04] rounded-lg p-3 text-center"
            >
              <stat.icon className="w-5 h-5 text-[#9945FF] mx-auto mb-2" strokeWidth={1.5} />
              <div className="text-lg font-extrabold text-white/90">{stat.value}</div>
              <div className="text-[9.5px] text-white/35 font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-bold text-white/90 mb-3">Key Findings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              title: "Higher Staking Rates",
              desc: "Wallets with scores above 60 are 4.5x more likely to stake JUP tokens, indicating long-term commitment.",
            },
            {
              title: "Better Retention",
              desc: "High-score users have 3.2x higher 30-day retention rates compared to low-score users.",
            },
            {
              title: "More Fees Paid",
              desc: "Top-quartile scored wallets generate 12x more protocol fees than bottom-quartile wallets.",
            },
            {
              title: "Sybil Detection",
              desc: "92% of wallets flagged as sybil by manual review had scores below 15, validating the scoring methodology.",
            },
          ].map((finding) => (
            <div
              key={finding.title}
              className="flex gap-3 bg-white/[0.02] border border-white/[0.04] rounded-lg p-3"
            >
              <CheckCircle className="w-4 h-4 text-[#14F195] shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <div className="text-[11.5px] font-semibold text-white/90 mb-0.5">
                  {finding.title}
                </div>
                <div className="text-[10.5px] text-white/55 leading-relaxed">
                  {finding.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Coming Soon */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[radial-gradient(ellipse,rgba(153,69,255,0.12)_0%,transparent_70%)] pointer-events-none" />

        <div className="flex items-center gap-2 mb-4">
          <div className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#9945FF]/15 text-[#9945FF] border border-[#9945FF]/20">
            Coming Soon
          </div>
          <h2 className="text-lg font-bold text-white/90">Solana Score API</h2>
        </div>

        <p className="text-[11.5px] text-white/55 leading-relaxed mb-5 max-w-2xl">
          Integrate Solana Score directly into your protocol. Look up any wallet&apos;s
          score, run sybil checks, and segment users programmatically. Built on the{" "}
          <span className="text-white/80 font-medium">x402 standard</span> for
          seamless pay-per-query access.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {[
            { title: "Score Lookup", desc: "Get any wallet's score, tier, and breakdown in real-time" },
            { title: "Sybil Checks", desc: "Boolean sybil detection with configurable score thresholds" },
            { title: "User Segments", desc: "Categorize users into segments based on on-chain behavior" },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-2 bg-white/[0.02] border border-white/[0.04] rounded-lg p-3"
            >
              <ArrowRight className="w-3.5 h-3.5 text-[#14F195] shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <div className="text-[11px] font-semibold text-white/90 mb-0.5">
                  {feature.title}
                </div>
                <div className="text-[10px] text-white/55">{feature.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Email waitlist */}
        {submitted ? (
          <div className="flex items-center gap-2 bg-[#14F195]/10 border border-[#14F195]/20 rounded-lg px-4 py-3">
            <CheckCircle className="w-4 h-4 text-[#14F195]" />
            <span className="text-[11.5px] text-[#14F195] font-medium">
              You&apos;re on the list! We&apos;ll notify you when the API launches.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/35" />
              <input
                type="email"
                placeholder="Enter your email for early access..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 bg-white/[0.04] border border-purple-500/15 rounded-lg pl-9 pr-3 text-white/90 text-[11.5px] outline-none placeholder:text-white/35 focus:border-purple-500/35 focus:shadow-[0_0_0_3px_rgba(153,69,255,0.08)] transition-all"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-5 rounded-lg text-[11.5px] font-semibold bg-gradient-to-r from-[#9945FF] to-[#7c3aed] text-white shadow-[0_2px_12px_rgba(153,69,255,0.25)] hover:shadow-[0_2px_20px_rgba(153,69,255,0.4)] hover:-translate-y-px transition-all"
            >
              Join Waitlist
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
