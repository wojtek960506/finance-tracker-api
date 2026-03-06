import tsConfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsConfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    includeSource: ['src/**/*.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/testing/**',
        'src/**/index.ts',
        'src/**/*types*.ts',
      ],
    },
  },
});
