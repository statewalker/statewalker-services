import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
  entryPoints: [
    "src/index.ts",
  ],
  clean: true,
  dts: true,
  treeshake: true,
  noExternal: [],
  format: ["esm"],
  ...options,
  esbuildOptions(options, context) {
    options.target = "es2020";
  },
}));
