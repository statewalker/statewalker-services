import ns from "@statewalker/ns";
import newServices  from "./newServices.js";
ns.services = ns.services || newServices();
export default ns.services;