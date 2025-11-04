"use client";

import { useState } from "react";
import { useWallets } from "@privy-io/react-auth/solana";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useSolanaConnection } from "@/hooks/useSolanaConnection";

export function WalletBalance() {
  const { wallets } = useWallets();
  const connection = useSolanaConnection();
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchBalance = async () => {
    if (!wallets || wallets.length === 0 || loading) return;
    
    setLoading(true);
    try {
      const walletAddress = wallets[0].address;
      const publicKey = new PublicKey(walletAddress);
      
      // Only fetch SOL balance to avoid rate limits
      const balance = await connection.getBalance(publicKey);
      setSolBalance(balance / LAMPORTS_PER_SOL);
      setHasLoaded(true);
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!wallets || wallets.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: "2rem", padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
      <h3>Wallet Info</h3>
      <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1rem", wordBreak: "break-all" }}>
        Address: {wallets[0].address}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <strong>SOL Balance:</strong>{" "}
          {loading ? "Loading..." : hasLoaded && solBalance !== null ? `${solBalance.toFixed(4)} SOL` : "Click to load"}
        </div>
        <button 
          onClick={fetchBalance} 
          disabled={loading}
          style={{ fontSize: "0.9rem", padding: "0.25rem 0.5rem" }}
        >
          {hasLoaded ? "Refresh" : "Load Balance"}
        </button>
      </div>
      <p style={{ fontSize: "0.8rem", color: "#999", marginTop: "0.5rem" }}>
        Note: Balance fetching is manual to avoid devnet rate limits
      </p>
    </div>
  );
}