"use strict";

const firebaseServer = require("firebase");

const firebase = require("../db");
const firestore = firebase.firestore();

const solanaWeb3 = require("@solana/web3.js");
const { SOLANA_RPC_API } = require("../variables");
const { NOOMEA_TOKEN_WALLET_SECRET } = require("../config");
const {
  getOrCreateAssociatedTokenAccount,
  mintTo,
} = require("@solana/spl-token");

const redeemTokens = async (req, res, next) => {
  const walletAddress = req.body.walletAddress;

  if (!walletAddress) return res.send("No wallet params");

  try {
    const docRef = await firestore.collection("user").doc(walletAddress);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      return res.json({
        code: 400,
        type: "error",
        result: "Wallet does not exist",
      });
    }

    const docData = await docSnapshot.data();

    if (!docData.drops) {
      return res.json({
        code: 400,
        type: "error",
        result: "No drop found",
      });
    }

    const redeemableTokens =
      Math.round(
        (docData?.drops?.reduce((total, drop) => {
          if (drop.redeemed) return total;

          return (total += drop.amount);
        }, 0) || 0) * 10
      ) / 10;

    const initialDrops = await docData.drops.filter(
      (drop) => drop.redeemed === false
    );

    if (redeemableTokens === 0 || !initialDrops) {
      return res.json({
        code: 200,
        type: "success",
        result: "Nothing to claim here",
        amount: redeemableTokens,
      });
    }

    const newDrops = await initialDrops.map((drop) => {
      return { ...drop, redeemed: true };
    });

    const noomAmount = redeemableTokens * 1000000000;

    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl(SOLANA_RPC_API.name, "confirmed")
    );

    const fromWallet = solanaWeb3.Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(NOOMEA_TOKEN_WALLET_SECRET))
    );

    const mintPublicKey = new solanaWeb3.PublicKey(SOLANA_RPC_API.tokenId);
    const toPublicKey = new solanaWeb3.PublicKey(walletAddress);

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mintPublicKey,
      toPublicKey
    );

    const signature = await mintTo(
      connection,
      fromWallet,
      mintPublicKey,
      toTokenAccount.address,
      fromWallet.publicKey,
      noomAmount
    );

    await docRef.update({
      drops: newDrops,
      lastRedeem: firebaseServer.firestore.FieldValue.serverTimestamp(),
      transactions: firebaseServer.firestore.FieldValue.arrayUnion(signature),
    });

    res.json({
      code: 200,
      type: "success",
      result: "Token successfully redeemed",
      redeemableTokens,
      signature,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

module.exports = {
  redeemTokens,
};
