import type { ScoreData, ScoreBreakdownItem } from "./types";

export const MOCK_SCORE_DATA: ScoreData = {
  wallet: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  score: 87,
  protocol_fees_paid: 12450,
  network_fees_paid: 2.3,
  current_holdings: 45200,
  protocol_count: 8,
  protocols_used:
    "jupiter aggregator ultra (v6),raydium cpmm,meteora,drift perps,orca,phantom,pump.fun,axiom",
  months_active: 18,
  is_sybil: null,
  jup_fees_paid: 3200,
  jup_staker: true,
  jup_perps_user: true,
};

export const MOCK_BREAKDOWN: ScoreBreakdownItem[] = [
  { name: "Transaction Volume", score: 92, maxScore: 100 },
  { name: "Protocol Diversity", score: 88, maxScore: 100 },
  { name: "Account Age", score: 85, maxScore: 100 },
  { name: "DeFi Activity", score: 90, maxScore: 100 },
  { name: "NFT Engagement", score: 72, maxScore: 100 },
  { name: "Governance", score: 65, maxScore: 100 },
];

export const MOCK_LEADERBOARD = [
  { rank: 1, wallet: "G5nxEXuFMfV74DSnsrSatqCW32F34XUnBeq3PfDS7w5E", score: 99.02, protocols: 11, tier: "Diamond" },
  { rank: 2, wallet: "4CqecFud362LKgALvChyhj6276he3Sy8yKim1uvFNV1m", score: 99.02, protocols: 13, tier: "Diamond" },
  { rank: 3, wallet: "BLhQ4fWgkNAJ4MWXSdXaTnxwZxwHh7QTnMQb6i3Z2QYy", score: 99.01, protocols: 11, tier: "Diamond" },
  { rank: 4, wallet: "2huXTbjeBhtMZ1ugNwUGucYBRasRaaiypymUX6P1Kwjx", score: 99.01, protocols: 10, tier: "Diamond" },
  { rank: 5, wallet: "58qWG9YQjQ5STkmMVGihZYJjFhiH5ex63aMo7xhJHdZ1", score: 99.01, protocols: 12, tier: "Diamond" },
  { rank: 6, wallet: "4BdKaxN8G6ka4GYtQQWk4G4dZRUTX2vQH9GcXdBREFUk", score: 99.00, protocols: 13, tier: "Diamond" },
  { rank: 7, wallet: "CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o", score: 99.00, protocols: 13, tier: "Diamond" },
  { rank: 8, wallet: "GijFWw4oNyh9ko3FaZforNsi3jk6wDovARpkKahPD4o5", score: 99.00, protocols: 11, tier: "Diamond" },
  { rank: 9, wallet: "8deJ9xeUvXSJwicYptA9mHsU2rN2pDx37KWzkDkEXhU6", score: 98.99, protocols: 12, tier: "Diamond" },
  { rank: 10, wallet: "4hSXPtxZgXFpo6Vxq9yqxNjcBoqWN3VoaPJWonUtupzD", score: 98.99, protocols: 13, tier: "Diamond" },
  { rank: 11, wallet: "7rtiKSUDLBm59b1SBmD9oajcP8xE64vAGSMbAN5CXy1q", score: 98.98, protocols: 10, tier: "Diamond" },
  { rank: 12, wallet: "CueDkwDYr8ZXRwMseprUpCqsz1Zj1VgLnZNRFyQHkfwZ", score: 98.98, protocols: 12, tier: "Diamond" },
  { rank: 13, wallet: "6LChaYRYtEYjLEHhzo4HdEmgNwu2aia8CM8VhR9wn6n7", score: 98.98, protocols: 11, tier: "Diamond" },
  { rank: 14, wallet: "9ZzjXiwkGRDBwVHJitfx8AmnN2YUbnqW6M1tH38juEeJ", score: 98.98, protocols: 11, tier: "Diamond" },
  { rank: 15, wallet: "6T8Yr9DUUS2R8GHevaeaZcoxA1Jku51ZBkmcM7NaZiNE", score: 98.97, protocols: 13, tier: "Diamond" },
  { rank: 16, wallet: "3mqbxgQ8UEwNixoGJhuyB5KDwkgN2K5jTbSpccR7bxAp", score: 98.97, protocols: 10, tier: "Diamond" },
  { rank: 17, wallet: "EHg5YkU2SZBTvuT87rUsvxArGp3HLeye1fXaSDfuMyaf", score: 98.97, protocols: 11, tier: "Diamond" },
  { rank: 18, wallet: "GSsn72vbsehdReptLLDWdUhypDd5aXo4999x5g9tbt6g", score: 98.97, protocols: 10, tier: "Diamond" },
  { rank: 19, wallet: "286CHN57Km41GsAnDv866WKd6YB6HPSjFgF4rGDJTRLf", score: 98.96, protocols: 12, tier: "Diamond" },
  { rank: 20, wallet: "pndujwi7BeaRRenYHSShyNQXAdBNEzKDR5jgzbheJFT", score: 98.96, protocols: 12, tier: "Diamond" },
];

export const SCORE_DISTRIBUTION = [
  { range: "90-100", percentage: 3.2 },
  { range: "80-89", percentage: 7.1 },
  { range: "60-79", percentage: 22.4 },
  { range: "40-59", percentage: 31.8 },
  { range: "20-39", percentage: 24.5 },
  { range: "0-19", percentage: 11.0 },
];
