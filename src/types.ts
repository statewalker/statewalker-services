/**
 * Service interface exposes functions to provide and consume services
 * of a specific type.
 */
export type Service<T> = {
  /**
   * This method returns a provider function allowing to re-define service.
   * The returned function contains a `close()` (see {@link #ServiceClosable}) method used to remove this provider.
   * @param value optional initial value exposed by this provider to all consumers
   * @returns a provider function allowing to re-define service value
   */
  newProvider: (value?: T) => ServiceProvider<T>;
  /**
   * Returns a service consumer. The provided listener is notified each time
   * when one of the services changes its value. The returned consumer contains
   * a `close()` (see {@link #ServiceClosable}) function allowing to unsubscribe from notifications.
   * @param listener the listener notified each time when one of provided
   * services change its value.
   * @returns a consumer function allowing to get the current set of provided
   * services and unsubscribe from notificationse
   */
  newConsumer: (listener: (values: T[]) => unknown) => ServiceConsumer<T>;
} & ServiceClosable & // The `close()` method allows to unregister all service providers and consumers.
  // The service itself allows to get the current exposed service objects.
  (() => T[]);

/**
 * Service provider is a function allowing to push a specific service object to all
 * registered listeners. It contains a `close()` (see {@link #ServiceClosable}) method
 * finalizing this service stream.
 */
export type ServiceProvider<T> = ((value: T) => ServiceProvider<T>) & {
  value: T;
} & ServiceClosable;

/**
 * Consumer function allow to get the current values exposed
 * by all registered providers.
 * It contains a `close()` (see {@link #ServiceClosable}) method finalizing
 * the service subscription.
 */
export type ServiceConsumer<T> = (() => T[]) & ServiceClosable;

export type ServiceClosable = {
  closed: boolean;
  close: () => void;
};

export type Services = {
  getService<T>(key: string): Service<T>;

  newConsumer<T>(
    serviceKey: string,
    action: (values: T[]) => unknown
  ): ServiceConsumer<T>;

  newProvider<T>(serviceKey: string, initial?: T): ServiceProvider<T>;

  index: Record<string, Service<any>>;
} & ServiceClosable;

export type Cardinality = [min: number, max: number];
