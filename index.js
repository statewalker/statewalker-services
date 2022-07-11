import { default as ns } from "@statewalker/ns";
import * as services from "./src/index.js"
if (!ns.services) { Object.assign(ns, services); }
export * from './src/index.js';
