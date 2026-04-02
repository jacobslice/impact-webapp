"use client";

import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export function CRTWrapper({
  children,
  onSkip,
  showSkip = true,
  showWallet = true,
}: {
  children: React.ReactNode;
  onSkip?: () => void;
  showSkip?: boolean;
  showWallet?: boolean;
}) {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  return (
    <div className="min-h-screen bg-[#001a00] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)",
      }} />
      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none z-40" style={{
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,10,0,0.8) 100%)",
      }} />
      {/* Flicker */}
      <div className="fixed inset-0 pointer-events-none z-30 animate-[flicker_0.15s_infinite_alternate]" style={{ opacity: 0.02, background: "#33ff33" }} />
      <style>{`
        @keyframes flicker { 0% { opacity: 0.02; } 100% { opacity: 0.04; } }
        .pixelated { image-rendering: pixelated; }
        .crt-curve { border-radius: 20px; box-shadow: inset 0 0 60px rgba(0,255,0,0.05), 0 0 30px rgba(0,255,0,0.1); }
      `}</style>

      {/* Top bar: wallet left, skip right */}
      <div className="fixed top-4 left-4 right-4 z-[60] flex items-center justify-between">
        {/* Wallet button */}
        {showWallet && (
          <div className="flex items-center gap-2">
            {connected && publicKey ? (
              <>
                <span className="text-[#33ff33]/50 text-[10px] font-mono">
                  {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                </span>
                <button
                  onClick={() => disconnect()}
                  className="text-[#33ff33]/30 hover:text-[#ff4444]/80 text-[10px] font-mono border border-[#33ff33]/15 hover:border-[#ff4444]/40 px-2 py-0.5 transition-all"
                >
                  DISCONNECT
                </button>
                <button
                  onClick={() => setVisible(true)}
                  className="text-[#33ff33]/30 hover:text-[#33ff33]/80 text-[10px] font-mono border border-[#33ff33]/15 hover:border-[#33ff33]/40 px-2 py-0.5 transition-all"
                >
                  CHANGE
                </button>
              </>
            ) : (
              <button
                onClick={() => setVisible(true)}
                className="text-[#33ff33]/40 hover:text-[#33ff33]/80 text-xs font-mono border border-[#33ff33]/20 px-3 py-1 rounded hover:border-[#33ff33]/50 transition-all"
              >
                CONNECT WALLET
              </button>
            )}
          </div>
        )}
        {!showWallet && <div />}

        {/* Skip button */}
        {showSkip && onSkip ? (
          <button onClick={onSkip} className="text-[#33ff33]/40 hover:text-[#33ff33]/80 text-xs font-mono border border-[#33ff33]/20 px-3 py-1 rounded hover:border-[#33ff33]/50 transition-all">
            SKIP →
          </button>
        ) : <div />}
      </div>

      <div className="w-full max-w-3xl font-mono crt-curve p-6" style={{ color: "#33ff33", textShadow: "0 0 8px #33ff3366, 0 0 2px #33ff33" }}>
        {children}
      </div>
    </div>
  );
}
