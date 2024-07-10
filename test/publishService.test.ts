import { describe, it, expect } from "./deps.ts";
import publishService from "../src/publishService.ts";
import newServices from "../src/newServices.ts";

describe("publishService", () => {
  it("should track single service with a specific cardinality", async () => {
    const services = newServices();
    type Editor = {
      name: string;
    };
    type File = {
      path: string;
    };
    type FileComparatorParams = {
      editor: Editor[];
      activeFile: File[];
    };
    type FileComparator = {
      id: number;
      params: FileComparatorParams;
    };
    let providedInstances: FileComparator[] = [];
    let prevInstance: FileComparator | undefined;
    let currentInstance: FileComparator | undefined;
    let deletedInstance: FileComparator | undefined;
    let idCounter = 0;
    const newId = () => idCounter++;
    const clean = publishService<FileComparatorParams, FileComparator>({
      key: "compareEditor",
      services,
      dependencies: {
        editor: [1, 1],
        activeFile: [2, 2],
      },
      activate: (params) => {
        return (currentInstance = {
          id: newId(),
          params,
        });
      },
      update: (instance, params) => {
        prevInstance = instance;
        return (currentInstance = {
          id: newId(),
          params,
        });
      },
      deactivate: (instance) => {
        deletedInstance = instance;
      },
    });
    const registrations: (() => void)[] = [];
    registrations.push(clean);

    const filesProvider1 = services.newProvider<File>("activeFile");
    registrations.push(filesProvider1.close);
    const filesProvider2 = services.newProvider<File>("activeFile");
    registrations.push(filesProvider2.close);

    const editorProvider = services.newProvider<Editor>("editor");
    registrations.push(editorProvider.close);

    const consumer = services.newConsumer<FileComparator>(
      "compareEditor",
      (instances) => {
        providedInstances = instances;
      }
    );
    registrations.push(consumer.close);

    expect(providedInstances).toEqual([]);
    expect(prevInstance).toBe(undefined);
    expect(currentInstance).toBe(undefined);
    expect(deletedInstance).toBe(undefined);

    // ---------------------------------------
    // Provide the first file.
    // Nothing happens: not all dependencies are resolved
    filesProvider1({ path: "file1" });
    expect(providedInstances).toEqual([]);
    expect(prevInstance).toBe(undefined);
    expect(currentInstance).toBe(undefined);
    expect(deletedInstance).toBe(undefined);

    // ---------------------------------------
    // Provide the second file.
    // Nothing happens: editor is missing
    filesProvider2({ path: "file2" });
    expect(providedInstances).toEqual([]);
    expect(prevInstance).toBe(undefined);
    expect(currentInstance).toBe(undefined);
    expect(deletedInstance).toBe(undefined);

    // ---------------------------------------
    // Provide the editor.
    // Dependencies should be resolved and a new instance
    // should appear in the system.
    editorProvider({ name: "Text Editor" });
    expect(currentInstance).toEqual({
      id: 0,
      params: {
        editor: [{ name: "Text Editor" }],
        activeFile: [
          {
            path: "file1",
          },
          {
            path: "file2",
          },
        ],
      },
    });
    expect(providedInstances).toEqual([currentInstance]);
    expect(prevInstance).toBe(undefined);
    expect(deletedInstance).toBe(undefined);

    // Update the first file provider
    filesProvider1({ path: "file1.1" });
    expect(currentInstance).toEqual({
      id: 1,
      params: {
        editor: [{ name: "Text Editor" }],
        activeFile: [
          {
            path: "file1.1",
          },
          {
            path: "file2",
          },
        ],
      },
    });
    expect(providedInstances).toEqual([currentInstance]);
    expect(prevInstance).toEqual({
      id: 0,
      params: {
        editor: [{ name: "Text Editor" }],
        activeFile: [
          {
            path: "file1",
          },
          {
            path: "file2",
          },
        ],
      },
    });
    expect(deletedInstance).toBe(undefined);

    prevInstance = undefined;
    currentInstance = undefined;
    // Close the first file provider - the service should be removed
    filesProvider1.close();
    expect(providedInstances).toEqual([]);
    expect(prevInstance).toBe(undefined);
    expect(currentInstance).toBe(undefined);
    expect(deletedInstance).toEqual({
      id: 1,
      params: {
        editor: [{ name: "Text Editor" }],
        activeFile: [
          {
            path: "file1.1",
          },
          {
            path: "file2",
          },
        ],
      },
    });

    registrations.forEach((r) => r());
  });
});
