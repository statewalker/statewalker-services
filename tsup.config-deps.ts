import { defineConfig, type Options } from "tsup";
import defaultOptions from "./tsup.config-options.ts";

export default defineConfig((options: Options) => ({
  ...defaultOptions,
  ...options,
  entryPoints: [
    "src/index.deps.ts",
  ]
}));
