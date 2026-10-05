import { defineConfig } from "vitest/config";

// The simulations play whole levels, which takes a few seconds on a slow runner: give each test room.
export default defineConfig({ test: { testTimeout: 30000 } });
