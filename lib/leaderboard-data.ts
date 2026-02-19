// Top wallets by Solana Score (static data)
export interface LeaderboardEntry {
  wallet: string;
  score: number;
  protocolCount: number;
}

export const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { wallet: "G5nxEXuFMfV74DSnsrSatqCW32F34XUnBeq3PfDS7w5E", score: 99.02, protocolCount: 11 },
  { wallet: "4CqecFud362LKgALvChyhj6276he3Sy8yKim1uvFNV1m", score: 99.02, protocolCount: 13 },
  { wallet: "BLhQ4fWgkNAJ4MWXSdXaTnxwZxwHh7QTnMQb6i3Z2QYy", score: 99.01, protocolCount: 11 },
  { wallet: "2huXTbjeBhtMZ1ugNwUGucYBRasRaaiypymUX6P1Kwjx", score: 99.01, protocolCount: 10 },
  { wallet: "58qWG9YQjQ5STkmMVGihZYJjFhiH5ex63aMo7xhJHdZ1", score: 99.01, protocolCount: 12 },
  { wallet: "4BdKaxN8G6ka4GYtQQWk4G4dZRUTX2vQH9GcXdBREFUk", score: 99.00, protocolCount: 13 },
  { wallet: "CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o", score: 99.00, protocolCount: 13 },
  { wallet: "GijFWw4oNyh9ko3FaZforNsi3jk6wDovARpkKahPD4o5", score: 99.00, protocolCount: 11 },
  { wallet: "8deJ9xeUvXSJwicYptA9mHsU2rN2pDx37KWzkDkEXhU6", score: 98.99, protocolCount: 12 },
  { wallet: "4hSXPtxZgXFpo6Vxq9yqxNjcBoqWN3VoaPJWonUtupzD", score: 98.99, protocolCount: 13 },
  { wallet: "7rtiKSUDLBm59b1SBmD9oajcP8xE64vAGSMbAN5CXy1q", score: 98.98, protocolCount: 10 },
  { wallet: "CueDkwDYr8ZXRwMseprUpCqsz1Zj1VgLnZNRFyQHkfwZ", score: 98.98, protocolCount: 12 },
  { wallet: "6LChaYRYtEYjLEHhzo4HdEmgNwu2aia8CM8VhR9wn6n7", score: 98.98, protocolCount: 11 },
  { wallet: "9ZzjXiwkGRDBwVHJitfx8AmnN2YUbnqW6M1tH38juEeJ", score: 98.98, protocolCount: 11 },
  { wallet: "6T8Yr9DUUS2R8GHevaeaZcoxA1Jku51ZBkmcM7NaZiNE", score: 98.97, protocolCount: 13 },
  { wallet: "3mqbxgQ8UEwNixoGJhuyB5KDwkgN2K5jTbSpccR7bxAp", score: 98.97, protocolCount: 10 },
  { wallet: "EHg5YkU2SZBTvuT87rUsvxArGp3HLeye1fXaSDfuMyaf", score: 98.97, protocolCount: 11 },
  { wallet: "GSsn72vbsehdReptLLDWdUhypDd5aXo4999x5g9tbt6g", score: 98.97, protocolCount: 10 },
  { wallet: "286CHN57Km41GsAnDv866WKd6YB6HPSjFgF4rGDJTRLf", score: 98.96, protocolCount: 12 },
  { wallet: "pndujwi7BeaRRenYHSShyNQXAdBNEzKDR5jgzbheJFT", score: 98.96, protocolCount: 12 },
];

// Obfuscate address: G5nx...w5E
export function obfuscateAddress(address: string): string {
  if (address.length < 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-3)}`;
}
