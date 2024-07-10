import { services as globalServices } from "./services.ts";
import { resolver } from "./resolver.ts";
import type { Cardinality, ServiceProvider, Services } from "./types.ts";

export default publishService;
export function publishService<
  T extends Record<string, any>,
  I = unknown,
>({
  key,
  services = globalServices,
  dependencies,
  activate,
  deactivate,
  update,
}: {
  key: string;
  services?: Services;
  dependencies?: Record<keyof T, Cardinality>;
  activate: (values: T) => undefined | I;
  update?: (instance: I, values: T) => undefined | I;
  deactivate?: (instance: I) => unknown;
}): () => void {
  let provider: ServiceProvider<I> | undefined;
  let instance: I | undefined;
  const doActivate = (values: T) => {
    provider = services.newProvider(key);
    instance = activate(values);
    instance !== undefined && provider(instance);
  }
  const doDeactivate = () => {
    if (provider) {
      instance !== undefined && deactivate?.(instance);
      instance = undefined;
      provider.close();
      provider = undefined;
    }
  }
  return resolver<T>({
    dependencies,
    subscribe: (key: keyof T, callback: (values: any[]) => void) => {
      return services.newConsumer(key as string, (values) => {
        return callback(values);
      }).close
    },
    activate: doActivate,
    deactivate: doDeactivate,
    update: (values: T) => {
      if (!provider || instance === undefined) return;
      if (update) {
        instance = update?.(instance as I, values) || instance;
        provider(instance);
      } else {
        doDeactivate();
        doActivate(values);
      }
    },
  });
}
