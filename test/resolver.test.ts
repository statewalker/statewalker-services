import { describe, it, expect } from "./deps.ts";
import { resolver } from "../src/resolver.ts";
import newServices from "../src/newServices.ts";

describe("resolver", () => {
  it("should track single service with a specific cardinality", async () => {
    const services = newServices();
    const registrations: (() => unknown)[] = [];

    const filesProvider1 = services.newProvider("selectedFile");
    registrations.push(filesProvider1.close);
    const filesProvider2 = services.newProvider("selectedFile");
    registrations.push(filesProvider2.close);

    let activated: { selectedFile: string[] } | undefined;
    let deactivated: { selectedFile?: string[] } | undefined;
    let updated: { selectedFile: string[] } | undefined;
    const unsubscribe = resolver({
      subscribe: (key, callback) => services.newConsumer(key, callback),
      dependencies: {
        selectedFile: [2, 2],
      },
      activate: (values: { selectedFile: string[] }) => {
        activated = values;
      },
      deactivate: (values) => {
        deactivated = values;
      },
      update: (values: { selectedFile: string[] }) => {
        updated = values;
      },
    });
    registrations.push(unsubscribe);
    expect(activated).toBe(undefined);
    expect(deactivated).toBe(undefined);
    expect(updated).toBe(undefined);

    // ---------------------------------------
    // Provide the first value.
    // Nothing happens = required exactly two references
    filesProvider1("file1.1");
    expect(activated).toBe(undefined);
    expect(deactivated).toBe(undefined);
    expect(updated).toBe(undefined);

    // Provide the second value.
    // The dependencies should be activated.
    filesProvider2("file2.1");
    expect(activated).toEqual({
      selectedFile: ["file1.1", "file2.1"],
    });
    expect(deactivated).toBe(undefined);
    expect(updated).toBe(undefined);

    // Provides a new value using the second provider.
    // Dependencies are updated.
    filesProvider2("file2.2");
    expect(activated).toEqual({
      selectedFile: ["file1.1", "file2.1"],
    });
    expect(deactivated).toBe(undefined);
    expect(updated).toEqual({
      selectedFile: ["file1.1", "file2.2"],
    });

    // Provides a new value using the first provider.
    // Dependencies are updated.
    filesProvider1("file1.2");
    expect(activated).toEqual({
      selectedFile: ["file1.1", "file2.1"],
    });
    expect(deactivated).toBe(undefined);
    expect(updated).toEqual({
      selectedFile: ["file1.2", "file2.2"],
    });

    // --------------------------------------
    // Close the first provider.
    // Check dependencies invalidations.
    // Check that updates via a closed provider are not delivered to listeners.
    filesProvider1.close();
    filesProvider1("file1.3");

    expect(activated).toEqual({
      selectedFile: ["file1.1", "file2.1"],
    });
    expect(deactivated).toEqual({});
    expect(updated).toEqual({
      selectedFile: ["file1.2", "file2.2"],
    });

    // --------------------------------------
    // Add a new provider
    // Check new dependencies activations

    const filesProvider3 = services.newProvider("selectedFile");
    registrations.push(filesProvider3.close);
    filesProvider3("file3.1");

    expect(activated).toEqual({
      selectedFile: ["file2.2", "file3.1"],
    });
    expect(deactivated).toEqual({});
    expect(updated).toEqual({
      selectedFile: ["file1.2", "file2.2"],
    });

    registrations.forEach((r) => r());
  });
});
