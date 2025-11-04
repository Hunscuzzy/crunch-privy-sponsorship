import {
  Address,
  appendTransactionMessageInstructions,
  compileTransaction,
  createTransactionMessage,
  getTransactionEncoder,
  Instruction,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from "@solana/kit";

export type Lifetime = Parameters<
  typeof setTransactionMessageLifetimeUsingBlockhash
>[0];

export const toLifetime = (raw: {
  blockhash: string;
  lastValidBlockHeight: number | bigint;
}): Lifetime =>
  ({
    blockhash: raw.blockhash,
    lastValidBlockHeight:
      typeof raw.lastValidBlockHeight === "bigint"
        ? raw.lastValidBlockHeight
        : BigInt(raw.lastValidBlockHeight),
  }) as Lifetime;

export function buildSerializedTx(params: {
  instructions: Instruction[];
  feePayer: Address;
  lifetime: Lifetime;
}) {
  const { instructions, feePayer, lifetime } = params;

  const bytes = pipe(
    createTransactionMessage({ version: 0 }),
    tx => setTransactionMessageFeePayer(feePayer, tx),
    tx => setTransactionMessageLifetimeUsingBlockhash(lifetime, tx),
    tx => appendTransactionMessageInstructions(instructions, tx),
    tx => compileTransaction(tx),
    tx => new Uint8Array(getTransactionEncoder().encode(tx))
  );

  return bytes;
}