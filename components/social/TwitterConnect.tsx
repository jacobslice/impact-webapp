"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export interface TwitterProfile {
  handle: string;
  displayName: string;
  avatarUrl: string;
}

const STORAGE_KEY = "solana_score_twitter";

function getStoredProfile(): TwitterProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function storeProfile(profile: TwitterProfile | null) {
  if (typeof window === "undefined") return;
  if (profile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/** Hook to access and manage the linked Twitter profile */
export function useTwitterProfile() {
  const [profile, setProfile] = useState<TwitterProfile | null>(null);

  useEffect(() => {
    setProfile(getStoredProfile());
  }, []);

  const link = useCallback((handle: string) => {
    const cleaned = handle.trim().replace(/^@/, "");
    if (!cleaned) return;
    const newProfile: TwitterProfile = {
      handle: cleaned,
      displayName: cleaned,
      avatarUrl: `https://unavatar.io/x/${cleaned}`,
    };
    storeProfile(newProfile);
    setProfile(newProfile);
  }, []);

  const unlink = useCallback(() => {
    storeProfile(null);
    setProfile(null);
  }, []);

  return { profile, link, unlink };
}

/**
 * Wallet header identity — replaces the generic gradient bubble.
 * When Twitter is linked: shows PFP ring + handle + badge.
 * When not linked: shows gradient bubble + address + "Link X" button.
 */
export function WalletIdentity({
  address,
  truncatedAddress,
}: {
  address: string;
  truncatedAddress: string;
}) {
  const { profile, link, unlink } = useTwitterProfile();
  const [showInput, setShowInput] = useState(false);
  const [handle, setHandle] = useState("");

  const handleSubmit = () => {
    if (handle.trim()) {
      link(handle);
      setShowInput(false);
      setHandle("");
    }
  };

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
          {showInput ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="@handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                autoFocus
                className="h-6 w-[110px] bg-white/[0.04] border border-[#1DA1F2]/30 rounded px-2 text-white/90 text-[10px] font-mono outline-none focus:border-[#1DA1F2]/50 transition-all placeholder:text-white/30"
              />
              <button
                onClick={handleSubmit}
                className="text-[10px] font-semibold text-[#1DA1F2] hover:text-[#1DA1F2]/80 transition-colors"
              >
                Link
              </button>
              <button
                onClick={() => { setShowInput(false); setHandle(""); }}
                className="text-[10px] text-white/30 hover:text-white/50 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1DA1F2]/70 hover:text-[#1DA1F2] transition-colors"
            >
              <svg className="w-[10px] h-[10px] fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Link X
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
