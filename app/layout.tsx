import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { WalletProvider } from "@/components/providers/WalletProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Solana Score | Check Your On-Chain Reputation",
  description:
    "Check your Solana Score - a reputation metric measuring cross-protocol activity on Solana. Powered by Slice Analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${inter.className} antialiased`}>
        <WalletProvider>
          <Sidebar />
          <Topbar />
          <main className="ml-14 mt-[52px] p-5 relative z-[1] min-h-[calc(100vh-52px)]">
            <div className="max-w-[1300px] mx-auto">
              {children}
              <Footer />
            </div>
          </main>
        </WalletProvider>
      </body>
    </html>
  );
}
