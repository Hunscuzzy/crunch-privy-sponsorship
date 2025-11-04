import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Constants
export const USDC_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
export const USDC_DECIMALS = 6;

// Environment-based configuration
export const SOLANA_CLUSTER = (process.env.NEXT_PUBLIC_SOLANA_CLUSTER ||
  "devnet") as "mainnet-beta" | "devnet";

// Token addresses
export const TOKEN_ADDRESS = {
  USDC_MAINNET: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDC_DEVNET: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
};

export const USDC_TOKEN_MINT =
  SOLANA_CLUSTER === "mainnet-beta"
    ? TOKEN_ADDRESS.USDC_MAINNET
    : TOKEN_ADDRESS.USDC_DEVNET;

// RPC Configuration
export const SOLANA_RPCS = {
  "mainnet-beta": {
    rpc: createSolanaRpc("https://api.mainnet-beta.solana.com"),
    rpcSubscriptions: createSolanaRpcSubscriptions(
      "wss://api.mainnet-beta.solana.com"
    ),
  },
  devnet: {
    rpc: createSolanaRpc("https://api.devnet.solana.com"),
    rpcSubscriptions: createSolanaRpcSubscriptions(
      "wss://api.devnet.solana.com"
    ),
  },
};

// Helper to get token balances
export interface TokenBalance {
  token: string;
  mint?: string;
  balance: number;
}

export async function getAllTokenBalances(
  publicKey: PublicKey,
  connection: Connection
): Promise<TokenBalance[]> {
  const balances: TokenBalance[] = [];

  // Get SOL balance
  try {
    const solBalance = await connection.getBalance(publicKey);
    balances.push({
      token: "SOL",
      balance: solBalance / LAMPORTS_PER_SOL,
    });
  } catch (error) {
    console.error("Error getting SOL balance:", error);
  }

  // Get USDC balance
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { mint: new PublicKey(USDC_TOKEN_MINT) }
    );

    if (tokenAccounts.value.length > 0) {
      const usdcBalance =
        tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount ||
        0;
      balances.push({
        token: "USDC",
        mint: USDC_TOKEN_MINT,
        balance: usdcBalance,
      });
    } else {
      balances.push({
        token: "USDC",
        mint: USDC_TOKEN_MINT,
        balance: 0,
      });
    }
  } catch (error) {
    console.error("Error getting USDC balance:", error);
    balances.push({
      token: "USDC",
      mint: USDC_TOKEN_MINT,
      balance: 0,
    });
  }

  return balances;
}