import { default as ns } from "@statewalker/ns";
import * as lib from "./src/index.js"
// Expose the "services" and other methods in the global namespace.
// Methods are assigned to the namespace only if it are not defined yet.
if (!ns.services) { Object.assign(ns, lib);  }
export const {
    newService,
    newServices,
    publishService,
    resolveDependencies,
    services
} = ns;