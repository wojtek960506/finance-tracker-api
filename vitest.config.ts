import { defineConfig } from "vitest/config";
import tsConfigPaths from "vite-tsconfig-paths";


export default defineConfig({
  plugins: [tsConfigPaths()],
  test: {
    globals: true,
    environment: "node",
    includeSource: ["src/**/*.ts"],
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
      exclude: [
        'src/**/*.test.ts',
        'src/**/test-utils/**',
        'src/**/index.ts',
        'src/**/*types*.ts',
      ]
    }
  },
});
