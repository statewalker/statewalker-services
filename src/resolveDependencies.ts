import { resolver } from "./resolver.ts";
import type { Cardinality, ServiceClosable, Services } from "./types.ts";
import { addCloseMethod } from "./addCloseMethod.ts";

export default resolveDependencies;
export function resolveDependencies<
  T extends Record<string, any>,
  I = unknown,
>({
  services,
  dependencies,
  activate,
  deactivate,
  update,
}: {
  services: Services;
  dependencies?: Record<keyof T, Cardinality>;
  activate: (values: T) => I;
  update?: (values: T) => I;
  deactivate?: (values: Partial<T>) => unknown;
}): (() => void) & ServiceClosable {
  const close = resolver<T>({
    dependencies,
    subscribe: (key: keyof T, callback: (values: any[]) => void) =>
      services.newConsumer(key as string, callback).close,
    activate,
    deactivate,
    update,
  });
  return addCloseMethod(close, close);
}
