import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "src/tests/",
        "**/*.test.ts",
        "**/*.spec.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@routes": path.resolve(__dirname, "./src/routes"),
      "@middleware": path.resolve(__dirname, "./src/middleware"),
      "@hedera": path.resolve(__dirname, "./src/hedera"),
      "@blockchain": path.resolve(__dirname, "./src/blockchain"),
      "@zg": path.resolve(__dirname, "./src/zg"),
      "@queues": path.resolve(__dirname, "./src/queues"),
    },
  },
});
