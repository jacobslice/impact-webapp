"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export interface TwitterProfile {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  following: number;
  verified: boolean;
}

/** Hook to access the Twitter profile from server session */
export function useTwitterProfile() {
  const [profile, setProfile] = useState<TwitterProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/twitter/me");
      const data = await res.json();
      setProfile(data.user || null);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const link = useCallback(() => {
    window.location.href = "/api/auth/twitter";
  }, []);

  const unlink = useCallback(async () => {
    try {
      await fetch("/api/auth/twitter/logout", { method: "POST" });
      setProfile(null);
    } catch {
      // ignore
    }
  }, []);

  return { profile, loading, link, unlink };
}

/**
 * Wallet header identity — replaces the generic gradient bubble.
 * When Twitter is linked: shows PFP ring + handle + badge + follower count.
 * When not linked: shows gradient bubble + address + "Connect X" button.
 */
export function WalletIdentity({
  address,
  truncatedAddress,
}: {
  address: string;
  truncatedAddress: string;
}) {
  const { profile, loading, link, unlink } = useTwitterProfile();

  if (loading) {
    return (
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-full bg-white/[0.04] animate-pulse shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 w-32 bg-white/[0.04] rounded animate-pulse mb-1" />
          <div className="h-3 w-24 bg-white/[0.04] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (profile) {
    return (
      <div className="flex items-center gap-3.5">
        {/* PFP with conic-gradient ring */}
        <div
          className="w-11 h-11 rounded-full p-[2px] shrink-0"
          style={{ background: "conic-gradient(#9945FF, #14F195, #00D1FF, #9945FF)" }}
        >
          <Image
            src={profile.avatarUrl}
            alt={profile.displayName}
            width={44}
            height={44}
            className="w-full h-full rounded-full object-cover border-2 border-[#0c0b14]"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-white/90 truncate">
              {profile.displayName}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1DA1F2] bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 rounded-full px-2 py-0.5 shrink-0">
              <svg className="w-[10px] h-[10px] fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Connected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/45">@{profile.handle}</span>
            <span className="text-white/15">·</span>
            <span className="text-[11px] text-white/35">
              {profile.followers.toLocaleString()} followers
            </span>
            <span className="text-white/15">·</span>
            <span className="text-[11px] font-mono text-white/30 truncate">
              {truncatedAddress}
            </span>
            <button
              onClick={unlink}
              className="text-[10px] text-white/20 hover:text-red-400 transition-colors shrink-0"
            >
              Unlink
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3.5">
      {/* Default gradient bubble */}
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center text-white font-extrabold text-sm shrink-0">
        {address.slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-bold text-white/90 font-mono truncate">
          {truncatedAddress}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/35">Connected Wallet</span>
          <span className="text-white/15">·</span>
          <button
            onClick={link}
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1DA1F2]/70 hover:text-[#1DA1F2] transition-colors"
          >
            <svg className="w-[10px] h-[10px] fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Connect X
          </button>
        </div>
      </div>
    </div>
  );
}
