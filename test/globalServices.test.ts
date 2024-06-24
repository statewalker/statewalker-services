import { describe, it, expect } from "./deps.ts";
import { services } from "../src/index.ts";

describe('global "services" variable', () => {
  it("should be available in the global namespace", async () => {
    expect(services).toBe((globalThis as any)["statewalker"].services);
  });
});
