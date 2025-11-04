"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";
import { TransferForm } from "@/components/TransferForm";
import { WalletBalance } from "@/components/WalletBalance";
import { Providers } from "./providers";

function HomePage() {
  const { ready, authenticated, login, logout, user, createWallet } =
    usePrivy();

  useEffect(() => {
    const initWallet = async () => {
      if (
        authenticated &&
        user &&
        !user.linkedAccounts?.find(account => account.type === "wallet")
      ) {
        try {
          await createWallet();
        } catch (error) {
          console.error("Error creating wallet:", error);
        }
      }
    };
    initWallet();
  }, [authenticated, user, createWallet]);

  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <main style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1>Privy Solana Sponsorship Demo</h1>

      {!authenticated ? (
        <div>
          <p>Sign in to test sponsored transactions</p>
          <button onClick={login}>Sign In</button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: "2rem" }}>
            <p>Connected as: {user?.email?.address}</p>
            <button onClick={logout}>Sign Out</button>
          </div>

          <WalletBalance />
          
          <TransferForm />
        </div>
      )}
    </main>
  );
}

export default function Page() {
  return (
    <Providers>
      <HomePage />
    </Providers>
  );
}
