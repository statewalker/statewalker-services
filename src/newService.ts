import type { Service, ServiceConsumer, ServiceProvider } from "./types.ts";

export default newService;
/**
 * Creates and returns a new service allowing to provide and consume
 * service objects.
 * @returns a new service object
 */
export function newService<T = any>(): Service<T> {
  let values: T[] | null = null;
  let providers: (ServiceProvider<T> & { value: T })[] = [];
  let consumers: (ServiceConsumer<T> & {
    listener: (values: T[]) => unknown;
  })[] = [];
  const service: Service<T> = function () {
    if (!values) {
      values = providers.map((_) => _.value).filter((v) => v !== undefined);
    }
    return values;
  };
  function notify() {
    const v = service();
    consumers.forEach((c) => c.listener && c.listener(v));
  }
  service.closed = false;

  service.close = function close() {
    service.closed = true;
    values = null;
    service.newProvider = service.newConsumer = () => {
      throw new Error("Service is closed");
    };
    providers.forEach((p) => p.close());
    consumers.forEach((c) => c.close());
    providers = consumers = [];
  };

  service.newProvider = function newProvider(initial) {
    const provider: ServiceProvider<T> = ((value: T) => {
      values = null;
      provider.value = value;
      notify();
      return provider;
    }) as ServiceProvider<T>;
    provider.close = () => {
      provider.closed = true;
      providers = providers.filter((p) => provider !== p);
      values = null;
      notify();
    };
    providers.push(provider);
    if (initial !== undefined) provider(initial);
    return provider;
  };

  service.newConsumer = function newConsumer(
    listener: (values: T[]) => unknown
  ) {
    const consumer = (() => service()) as ServiceConsumer<T> & {
      listener: (values: T[]) => unknown;
    };
    consumer.listener = listener;
    consumer.close = () => {
      consumer.closed = true;
      consumers = consumers.filter((c) => consumer !== c);
    };
    consumers.push(consumer);
    consumer.listener && consumer.listener(service());
    return consumer;
  };

  return service;
}

