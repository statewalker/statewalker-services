import type { ServiceClosable } from "./types.ts";

export function addCloseMethod<T>(
  object: T,
  closeAction: () => void
): T & ServiceClosable {
  const result: T & ServiceClosable = object as T & ServiceClosable;
  let closed = false;
  Object.defineProperties(result, {
    closed: { get: () => closed },
    close: {
      get: () => () => {
        closed = true;
        closeAction();
      },
    },
  });
  return result;
}
