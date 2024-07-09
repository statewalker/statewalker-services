import resolveDependencies from "./resolveDependencies.ts";
import type { Cardinality, ServiceProvider, Services } from "./types.ts";

export default function publishService<T, I = unknown>({
  services,
  dependencies,
  key,
  serviceKey,
  activate,
  deactivate,
  update,
  ...options
}: {
  key?: string;
  serviceKey?: string;
  services: Services;
  dependencies?: Record<keyof T, Cardinality>;
  activate: (values: T) => I;
  update?: (values: T) => I;
  deactivate?: (values: Partial<T>) => unknown;
} & Record<string, any>) {
  serviceKey = serviceKey || key;
  if (!serviceKey) {
    throw new Error('"serviceKey" is not defined');
  }

  const service = services.getService(serviceKey);
  let provider: ServiceProvider<any>, instance: I | undefined;
  const call = async (
    method: (...args: any[]) => unknown | Promise<unknown>,
    ...args: any[]
  ) => {
    return (method && (await method.call(instance, ...args))) as undefined | I;
  };
  return resolveDependencies({
    services,
    dependencies,
    activate: async (deps) => {
      instance = await call(activate, deps, options);
      provider = service.newProvider();
      provider(instance);
    },
    update: async (deps) => {
      const newInstance = await call(
        options.updateService || options.update,
        instance,
        deps,
        options
      );
      provider((instance = newInstance || instance));
    },
    deactivate: async (deps) => {
      await call(
        options.deactivateService || options.deactivate,
        instance,
        deps,
        options
      );
      provider.close();
      instance = undefined;
    },
  });
}
