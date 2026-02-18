import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  outDir: "dist",
  format: ["esm"],
  dts: true, // Generate .d.ts files
  sourcemap: true,
  clean: true,
  minify: false,
});