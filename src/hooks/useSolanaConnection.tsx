import { Connection } from "@solana/web3.js";
import { useMemo } from "react";

export function useSolanaConnection() {
  return useMemo(
    () => new Connection("https://api.devnet.solana.com", "confirmed"),
    []
  );
}