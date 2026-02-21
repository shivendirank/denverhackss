/**
 * Generate a new wallet for relayer operations
 * Usage: npx ts-node scripts/generate-wallet.ts
 */

import { Wallet } from "ethers";
import { writeFileSync, readFileSync } from "fs";
import { resolve } from "path";

function main() {
  console.log("\n🔐 Generating new wallet...\n");

  // Generate random wallet
  const wallet = Wallet.createRandom();

  console.log("✅ Wallet generated successfully!\n");
  console.log("═══════════════════════════════════════════════════");
  console.log("Address:     ", wallet.address);
  console.log("Private Key: ", wallet.privateKey);
  console.log("═══════════════════════════════════════════════════");

  console.log("\n⚠️  IMPORTANT: Save this private key securely!\n");

  // Offer to update .env
  console.log("📝 To use this wallet:\n");
  console.log("1. Copy the private key above");
  console.log("2. Edit your .env file:");
  console.log(`   RELAYER_PRIVATE_KEY=${wallet.privateKey}`);
  console.log("\n3. Get testnet tokens:");
  console.log(`   0G Faucet: https://faucet.0g.ai`);
  console.log(`   Enter address: ${wallet.address}`);
  console.log("\n4. Deploy contract:");
  console.log("   npm run 0g:deploy\n");

  // Save to temporary file (not committed)
  const walletsDir = resolve("wallets");
  try {
    const fs = require("fs");
    if (!fs.existsSync(walletsDir)) {
      fs.mkdirSync(walletsDir);
    }

    const walletFile = resolve(walletsDir, `wallet-${Date.now()}.json`);
    writeFileSync(
      walletFile,
      JSON.stringify(
        {
          address: wallet.address,
          privateKey: wallet.privateKey,
          mnemonic: wallet.mnemonic?.phrase || "",
          createdAt: new Date().toISOString(),
        },
        null,
        2
      )
    );

    console.log(`💾 Wallet saved to: ${walletFile}`);
    console.log("   (This file is .gitignored for security)\n");
  } catch (err) {
    console.log("⚠️  Could not save wallet file (this is okay)\n");
  }
}

main();
