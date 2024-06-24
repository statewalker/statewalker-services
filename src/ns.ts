const g : any =
  typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
      ? global
      : {};
export default g["statewalker"] = g["statewalker"] || {};
