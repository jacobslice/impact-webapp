import { Connection, PublicKey } from "@solana/web3.js";
import { resolve } from "@bonfida/spl-name-service";

const RPC_URL = "https://api.mainnet-beta.solana.com";

/**
 * Check if a string looks like a .sol domain
 */
export function isSolDomain(input: string): boolean {
  return /^[a-zA-Z0-9-]+\.sol$/i.test(input.trim());
}

/**
 * Resolve a .sol domain to a Solana wallet address.
 * Returns the address string, or null if resolution fails.
 */
export async function resolveSolDomain(domain: string): Promise<string | null> {
  try {
    const connection = new Connection(RPC_URL);
    const name = domain.trim().toLowerCase().replace(/\.sol$/, "");
    const owner: PublicKey = await resolve(connection, name);
    return owner.toBase58();
  } catch {
    return null;
  }
}
