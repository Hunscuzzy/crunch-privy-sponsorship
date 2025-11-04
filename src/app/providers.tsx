"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { SOLANA_RPCS } from "@/utils/solana";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        loginMethods: ["email", "google"],
        solana: {
          rpcs: {
            "solana:mainnet": SOLANA_RPCS["mainnet-beta"],
            "solana:devnet": SOLANA_RPCS["devnet"],
          },
        },
        embeddedWallets: {
          showWalletUIs: false,
          solana: {
            createOnLogin: "users-without-wallets",
          },
          ethereum: {
            createOnLogin: "off",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
