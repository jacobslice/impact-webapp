import Image from "next/image";
import { getProtocol } from "@/lib/protocols";

interface ProtocolGridProps {
  protocolsUsed: string[] | string | null;
  feesPaid?: number;
}

const SECTOR_BADGE_COLORS: Record<string, string> = {
  Dex: "bg-[#9945FF]/12 text-[#b88aff]",
  "Dex Aggregator": "bg-[#9945FF]/12 text-[#b88aff]",
  Launchpad: "bg-[#14F195]/10 text-[#14F195]",
  Perps: "bg-[#ff9f43]/10 text-[#ff9f43]",
  "Trading App": "bg-[#ffc837]/10 text-[#ffc837]",
  Wallet: "bg-[#ab82ff]/10 text-[#ab82ff]",
  Other: "bg-[#00D1FF]/10 text-[#00D1FF]",
};

export function ProtocolGrid({ protocolsUsed }: ProtocolGridProps) {
  if (!protocolsUsed) return null;

  // Handle both array (from Dune API) and comma-separated string (from mock data)
  const protocolNames = Array.isArray(protocolsUsed)
    ? protocolsUsed
    : protocolsUsed.split(",").map((p) => p.trim());

  const protocols = protocolNames
    .filter(Boolean)
    .map((name) => getProtocol(name));

  // Deduplicate by displayName (e.g., multiple Raydium variants)
  const seen = new Set<string>();
  const unique = protocols.filter((p) => {
    const key = p.displayName.split(" ")[0]; // Group by first word (e.g., "Raydium")
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <div className="glass-card p-4">
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-white/35 mb-3.5">
        Active Protocols
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {unique.map((protocol) => {
          const badgeColor =
            SECTOR_BADGE_COLORS[protocol.sector] || SECTOR_BADGE_COLORS.Other;
          return (
            <div
              key={protocol.name}
              className="glass-card p-3.5 flex flex-col gap-2.5 cursor-pointer hover:-translate-y-px transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/8 bg-white/5">
                  {protocol.logo ? (
                    <Image
                      src={protocol.logo}
                      alt={protocol.displayName}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/60">
                      {protocol.displayName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[12.5px] font-bold text-white/90">
                    {protocol.displayName}
                  </div>
                  <span
                    className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${badgeColor}`}
                  >
                    {protocol.sector}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
