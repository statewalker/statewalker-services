import { services as globalServices } from "./services.ts";
import { resolver } from "./resolver.ts";
import type { Cardinality, Services } from "./types.ts";
import publishService from "./publishService.ts";

export default resolveDependencies;
export function resolveDependencies<
  T extends Record<string, any>,
  I = unknown,
>({
  services = globalServices,
  dependencies,
  activate,
  deactivate,
  update,
}: {
  services?: Services;
  dependencies?: Record<keyof T, Cardinality>;
  activate: (values: T) => I;
  update?: (values: T) => I;
  deactivate?: (values: Partial<T>) => unknown;
}): () => void {
  return resolver<T, I>({
    dependencies,
    subscribe: (key: keyof T, callback: (values: any[]) => void) =>
      services.newConsumer(key as string, callback).close,
    activate,
    deactivate,
    update,
  });
}
