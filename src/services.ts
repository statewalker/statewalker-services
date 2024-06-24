import ns from "./ns.ts";
import newServices  from "./newServices.ts";
ns.services = ns.services || newServices();
export default ns.services;