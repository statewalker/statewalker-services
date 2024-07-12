import { type Options } from "tsup";

export default {
  entryPoints: ["src/index.ts"],
  clean: false,
  dts: true,
  treeshake: true,
  noExternal: [],
  format: ["esm"],
  esbuildOptions(options, context) {
    options.target = "es2020";
  },
} as Options;
