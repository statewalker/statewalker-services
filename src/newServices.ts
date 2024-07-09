import type { Service, Services } from "./types.ts";
import { newService } from "./newService.ts";

export default newServices;

export function newServices({
  index = {},
}: {
  index?: Record<string, Service<any>>;
} = {}): Services {
  function getService<T>(key: string): Service<T> {
    let service: undefined | Service<T> = index[key] as Service<T>;
    if (!service) {
      index[key] = service = newService<T>();
    }
    return service;
  }
  function newConsumer<T>(
    serviceKey: string,
    action: (values: T[]) => unknown
  ) {
    const Service = getService<T>(serviceKey) as Service<T>;
    return Service.newConsumer((values) => action(values));
  }
  function newProvider<T>(serviceKey: string, initial?: T) {
    const Service = getService<T>(serviceKey) as Service<T>;
    return Service.newProvider(initial);
  }
  let closed = false;
  function close() {
    closed = true;
    for (const service of Object.values(index)) {
      service.close();
    }
  }
  return {
    index,
    getService,
    newConsumer,
    newProvider,
    close,
    get closed() {
      return closed;
    },
  };
}
