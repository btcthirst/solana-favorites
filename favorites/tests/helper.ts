import { type Connection, Keypair, LAMPORTS_PER_SOL, type PublicKey } from "@solana/web3.js";

const requestAndConfirmAirdrop = async (
    connection: Connection,
    publicKey: PublicKey,
    amount: number,
  ) => {
    const airdropTransactionSignature = await connection.requestAirdrop(
      publicKey,
      amount,
    );
    // Wait for airdrop confirmation
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
      {
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: airdropTransactionSignature,
      },
      // "finalized" is slow but we must be absolutely sure
      // the airdrop has gone through
      "finalized",
    );
    return connection.getBalance(publicKey, "finalized");
  };
  
  export const airdropIfRequired = async (
    connection: Connection,
    publicKey: PublicKey,
    airdropAmount: number,
    minimumBalance: number,
  ): Promise<number> => {
    const balance = await connection.getBalance(publicKey, "confirmed");
    if (balance < minimumBalance) {
      return requestAndConfirmAirdrop(connection, publicKey, airdropAmount);
    }
    return balance;
  };