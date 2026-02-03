import { defineConfig } from "vitest/config";
import tsConfigPaths from "vite-tsconfig-paths";


export default defineConfig({
  plugins: [tsConfigPaths()],
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      exclude: [
        '**/test-utils/**',
        '**/index.ts',
        '**/types.ts',
      ]
    }
  },
});
