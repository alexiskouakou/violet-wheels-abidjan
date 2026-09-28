import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  preset: "vercel",
  srcDir: "src",
  serverDir: "src/server",
  outputDir: ".output",
  buildDir: ".nitro",
  compatibilityDate: "2025-01-01",
  sourceMap: true,
  minify: false,
  analyze: false,
  moduleSideEffects: ["**/*.css"],
});
