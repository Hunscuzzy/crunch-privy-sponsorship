"use client";

import { useState } from "react";
import { useWallets } from "@privy-io/react-auth/solana";
import { useTokenTransfer } from "@/hooks/useTokenTransfer";

export function TransferForm() {
  const walletsData = useWallets();
  const { wallets } = walletsData;

  const { executeTransfer, executeTransferLoading, error } = useTokenTransfer();

  const [amount, setAmount] = useState("0.001");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [coin, setCoin] = useState<"SOL" | "USDC">("SOL");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!destinationAddress) {
      alert("Please enter a destination address");
      return;
    }

    try {
      await executeTransfer({
        amount: parseFloat(amount),
        destinationAddress,
        coin,
      });
      alert("Transfer successful!");
    } catch (err) {
      console.error("Transfer error:", err);
    }
  };

  if (!wallets || wallets.length === 0) {
    return <div>Waiting for wallet creation...</div>;
  }

  const walletAddress = wallets[0]?.address || "Loading...";

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <h2>Test Solana Transfer with Sponsorship</h2>

      <div>
        <label>
          Token:
          <select
            value={coin}
            onChange={e => setCoin(e.target.value as "SOL" | "USDC")}
          >
            <option value="SOL">SOL</option>
            <option value="USDC">USDC</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          Amount:
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            step="0.001"
            min="0"
            required
          />
        </label>
      </div>

      <div>
        <label>
          Destination Address:
          <input
            type="text"
            value={destinationAddress}
            onChange={e => setDestinationAddress(e.target.value)}
            placeholder="Enter Solana address"
            required
            style={{ width: "100%", minWidth: "400px" }}
          />
        </label>
      </div>

      <button type="submit" disabled={executeTransferLoading}>
        {executeTransferLoading ? "Transferring..." : "Send Transfer"}
      </button>

      {error && <div style={{ color: "red" }}>Error: {error}</div>}

      <div
        style={{
          marginTop: "2rem",
          fontSize: "0.9rem",
          padding: "1rem",
          border: "1px solid #666",
          color: "#666",
        }}
      >
        <p>Connected wallet: {walletAddress}</p>
        <p>Network: Devnet</p>
        <p>Sponsorship enabled: Yes</p>
      </div>
    </form>
  );
}
