import { useCallback, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { address, createNoopSigner, Address } from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import {
  findAssociatedTokenPda,
  getTransferCheckedInstruction,
} from "@solana-program/token";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  useSignAndSendTransaction,
  useWallets,
} from "@privy-io/react-auth/solana";
import {
  SOLANA_CLUSTER,
  USDC_PROGRAM,
  SOLANA_RPCS,
  USDC_TOKEN_MINT,
  USDC_DECIMALS,
  getAllTokenBalances,
} from "@/utils/solana";
import { buildSerializedTx, toLifetime } from "@/utils/buildSerializedTx";
import { useSolanaConnection } from "./useSolanaConnection";

interface TransferParams {
  amount: number;
  destinationAddress: string;
  coin: "SOL" | "USDC";
}

interface UseTokenTransferReturn {
  executeTransfer: (params: TransferParams) => Promise<void>;
  executeTransferLoading: boolean;
  error: string | null;
}

const noopSigner = (a: Address) => createNoopSigner(a);

export function useTokenTransfer(): UseTokenTransferReturn {
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const connection = useSolanaConnection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeTransfer = useCallback(
    async ({ amount, destinationAddress, coin }: TransferParams) => {
      setLoading(true);
      setError(null);

      try {
        if (!wallets?.length) throw new Error("No wallet connected");

        const selectedWallet = wallets[0];
        const userAddr = address(selectedWallet.address);
        const destAddr = address(destinationAddress);

        const { rpc } = SOLANA_RPCS[SOLANA_CLUSTER];
        const { getLatestBlockhash } = rpc;
        const { value: latestBlockhash } = await getLatestBlockhash().send();

        const feePayer = userAddr;

        let instructions = [];

        if (coin === "SOL") {
          instructions = [
            getTransferSolInstruction({
              amount: BigInt(Math.round(amount * LAMPORTS_PER_SOL)),
              destination: destAddr,
              source: noopSigner(userAddr),
            }),
          ];
        } else if (coin === "USDC") {
          const mint = address(USDC_TOKEN_MINT);
          const tokenProgram = address(USDC_PROGRAM);

          const [ataSourceAddress] = await findAssociatedTokenPda({
            mint,
            owner: userAddr,
            tokenProgram,
          });

          const [ataDestinationAddress] = await findAssociatedTokenPda({
            mint,
            owner: destAddr,
            tokenProgram,
          });

          instructions = [
            getTransferCheckedInstruction({
              source: ataSourceAddress,
              mint,
              destination: ataDestinationAddress,
              authority: noopSigner(userAddr),
              amount: BigInt(Math.round(amount * Math.pow(10, USDC_DECIMALS))),
              decimals: USDC_DECIMALS,
            }),
          ];
        } else {
          throw new Error(`Unsupported token: ${coin}`);
        }

        const transaction = buildSerializedTx({
          instructions,
          feePayer,
          lifetime: toLifetime(latestBlockhash),
        });

        const destPublicKey = new PublicKey(destinationAddress);
        const initialDestBalances = await getAllTokenBalances(
          destPublicKey,
          connection,
        );

        const initialDestBalance =
          coin === "SOL"
            ? initialDestBalances.find((b) => b.token === "SOL")?.balance || 0
            : initialDestBalances.find((b) => b.mint === USDC_TOKEN_MINT)
                ?.balance || 0;

        console.log("Initial destination balance:", initialDestBalance);
        console.log("Sending transaction with sponsor option...");

        const result = await signAndSendTransaction({
          transaction,
          wallet: selectedWallet,
          chain: `solana:${SOLANA_CLUSTER}`,
          options: {
            sponsor: true,
          },
        });

        console.log("Transaction result:", result);
        console.log(
          "Signature:",
          Buffer.from(result.signature).toString("base64"),
        );

        // Wait a bit for confirmation
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const finalDestBalances = await getAllTokenBalances(
          destPublicKey,
          connection,
        );

        const finalDestBalance =
          coin === "SOL"
            ? finalDestBalances.find((b) => b.token === "SOL")?.balance || 0
            : finalDestBalances.find((b) => b.mint === USDC_TOKEN_MINT)
                ?.balance || 0;

        console.log("Final destination balance:", finalDestBalance);
        console.log("Balance change:", finalDestBalance - initialDestBalance);
      } catch (error: any) {
        setError(error?.message ?? "Transfer failed");
        console.error("Transfer failed:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [wallets, signAndSendTransaction, connection],
  );

  return {
    executeTransfer,
    executeTransferLoading: loading,
    error,
  };
}
