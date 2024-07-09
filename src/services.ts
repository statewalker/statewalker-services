import ns from "./ns.ts";
import newServices  from "./newServices.ts";
export const services = newServices();
ns.services = ns.services || services;
export default ns.services;