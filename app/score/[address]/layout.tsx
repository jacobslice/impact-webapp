import type { Metadata } from "next";

interface Props {
  params: Promise<{ address: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  const truncated =
    address.length > 12
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;

  const ogImageUrl = `/api/og/${address}`;

  return {
    title: `Solana Score — ${truncated}`,
    description: `Check the Solana Score for wallet ${truncated}. See on-chain reputation, protocol activity, and more.`,
    openGraph: {
      title: `Solana Score — ${truncated}`,
      description: `Check the on-chain reputation score for this Solana wallet.`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Solana Score for ${truncated}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Solana Score — ${truncated}`,
      description: `Check the on-chain reputation score for this Solana wallet.`,
      images: [ogImageUrl],
    },
  };
}

export default function ScoreLayout({ children }: Props) {
  return <>{children}</>;
}
