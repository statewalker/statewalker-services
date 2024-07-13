import type { Cardinality } from "./types.ts";

export default resolver;
export function resolver<T = Record<string, any>>({
  subscribe,
  dependencies,
  activate,
  deactivate,
  update,
}: {
  subscribe: (
    key: keyof T,
    callback: (list: T[keyof T][]) => void
  ) => () => unknown;
  dependencies?: Record<keyof T, Cardinality>;
  activate: (values: T) => unknown;
  update?: (values: T) => unknown;
  deactivate?: (values: Partial<T>) => unknown;
}): () => void {
  let values: Record<string, any> = {};
  let registry: (() => unknown)[] = [];
  update = update || activate;
  let active = false;
  const entries = Object.entries(dependencies || {}) as [
    keyof T,
    Cardinality,
  ][];
  const notify = (values: Partial<T>) => {
    values = { ...values };
    if (values && Object.keys(values).length === entries.length) {
      if (active) {
        update?.(values as T);
      } else {
        active = true;
        activate?.(values as T);
      }
    } else if (active) {
      active = false;
      deactivate?.(values || {});
    }
  };
  if (!entries.length) notify({});
  else {
    for (let [key, num] of entries) {
      let min = 0,
        max = +Infinity;
      if (Array.isArray(num)) {
        (min = num[0] || 0), (max = num[1] || Infinity);
      } else if (!isNaN(num)) min = num;
      ((key, min, max) => {
        registry.push(
          subscribe(key as keyof T, (list) => {
            if (list.length >= min && list.length <= max) {
              values[key] = list;
            } else delete values[key];
            notify((values = { ...values } as Partial<T>));
          })
        );
      })(String(key), min, max);
    }
  }
  return () => {
    registry.forEach((r) => r());
    registry = [];
    if (active) {
      active = false;
      deactivate?.({});
    }
  };
}
