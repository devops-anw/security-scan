import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "istanbul",
      exclude: [
        ".next",
        "src/scripts/**",
        "src/workers/**",
        "src/app/api-docs/**",
        "src/app/download/**",
        "src/hooks/**",
      ],
      include: ["src/**", "**/*.{test,spec}.{ts,tsx}"],
      reporter: ["text", "text-summary", "json", "html", "cobertura", "lcov"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
