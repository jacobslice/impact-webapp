"use client";

interface ShareOnXProps {
  address: string;
  score: number;
  tier: string;
}

export function ShareOnX({ address, score, tier }: ShareOnXProps) {
  const handleShare = () => {
    const text = `My Solana Score is ${Math.round(score)}/100 (${tier}) 💎\n\nCheck your wallet's on-chain reputation:`;
    const url = `${window.location.origin}/score/${address}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleShare}
      className="h-8 px-3.5 rounded-lg text-[11px] font-semibold bg-[#1d9bf0] text-white shadow-[0_2px_12px_rgba(29,155,240,0.3)] hover:bg-[#1a8cd8] hover:shadow-[0_2px_20px_rgba(29,155,240,0.45)] hover:-translate-y-px transition-all flex items-center gap-1.5"
    >
      <svg className="w-[13px] h-[13px] fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      Share on X
    </button>
  );
}
