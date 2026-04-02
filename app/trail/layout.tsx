import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solana Trail",
  description: "The Oregon Trail of Crypto — How far can your wallet go?",
};

export default function TrailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Hide root layout sidebar/topbar/footer and break out of main padding */}
      <style>{`
        nav[class*="fixed left-0 top-0 bottom-0"],
        header[class*="fixed top-0 left-14"],
        footer { display: none !important; }
        main { margin: 0 !important; padding: 0 !important; }
        main > div { max-width: none !important; margin: 0 !important; }
      `}</style>
      {children}
    </>
  );
}
