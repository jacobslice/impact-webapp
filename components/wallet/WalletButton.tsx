"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { truncateAddress } from "@/lib/types";
import { Wallet } from "lucide-react";

export function WalletButton() {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-white/60">
          {truncateAddress(publicKey.toBase58(), 4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="h-8 px-3 rounded-lg text-[11px] font-semibold bg-white/5 border border-purple-500/15 text-white/55 hover:text-white/80 hover:bg-white/8 transition-all"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className="h-8 px-3.5 rounded-lg text-[11px] font-semibold bg-gradient-to-r from-[#9945FF] to-[#7c3aed] text-white shadow-[0_2px_12px_rgba(153,69,255,0.25)] hover:shadow-[0_2px_20px_rgba(153,69,255,0.4)] hover:-translate-y-px transition-all flex items-center gap-1.5"
    >
      <Wallet className="w-3.5 h-3.5" />
      Connect
    </button>
  );
}
