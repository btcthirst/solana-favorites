import * as anchor from "@coral-xyz/anchor";
import { Favorites } from "../target/types/favorites";
import { airdropIfRequired } from "./helper";

describe("favorites", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  console.log(
    "Using provider: ",
    anchor.AnchorProvider.env().connection.rpcEndpoint
  );
  it("Writes our favorites to the blockchain!", async () => {
    // Add your test here.
    const user = anchor.web3.Keypair.generate();
    const program = anchor.workspace.Favorites as anchor.Program<Favorites>;
    
    // airdrop some SOL to the user
    await airdropIfRequired(
      anchor.getProvider().connection,
      user.publicKey,
      0.5 * anchor.web3.LAMPORTS_PER_SOL,
      1 * anchor.web3.LAMPORTS_PER_SOL
    );

    const favoriteNumber = new anchor.BN(42);
    const favoriteColor = "blue";
    const favoriteHobbies = ["reading", "gaming"];

    let tx: string | null = null;

    try {
      tx = await program.methods
        .setFavorites(
          favoriteNumber,
          favoriteColor,
          favoriteHobbies
        )
        .accounts({
          user: user.publicKey,
        })
        .signers([user])
        .rpc();
      console.log("Your transaction signature", tx);
    } catch (err) {
      const rawError = err as anchor.AnchorError;
      throw new Error(
        `Transaction failed with error: ${rawError.error?.toString()}`
      );
    }

    const [ favoritesPDA, _favoritesBump ] = await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("favorites"),
        user.publicKey.toBuffer(),
      ],
      program.programId
    );
    const favoritesAccount = await program.account.favorites.fetch(
      favoritesPDA
    );

    // Check that the account was created
    expect(favoritesAccount).toBeDefined();
    // Check that the favorite number is correct
    expect(favoritesAccount.number.toString()).toEqual(
      favoriteNumber.toString()
    );
    // Check that the favorite color is correct
    expect(favoritesAccount.color).toEqual(favoriteColor);
    // Check that the favorite hobbies are correct
    expect(favoritesAccount.hobbies.length).toEqual(favoriteHobbies.length);
    expect(favoritesAccount.hobbies[0]).toEqual(favoriteHobbies[0]);
    expect(favoritesAccount.hobbies[1]).toEqual(favoriteHobbies[1]);
  });
});
