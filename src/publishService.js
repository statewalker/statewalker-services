import services from "./services.js";
import resolveDependencies from "./resolveDependencies.js";

export default function publishService(options) {
  if (!options.serviceKey) { throw new Error('"serviceKey" is not defined'); }
  if (typeof (options.activateService || options.activate) !== 'function') {
    throw new Error('A mandatory "activateService" method is not defined');
  }

  const service = services.getService(options.serviceKey, true);
  let provider, instance;
  const call = async (method, ...args) => {
    return (method && await method.call(options, ...args));
  }
  return resolveDependencies({
    dependencies: options.dependencies,
    activate: async (deps) => {
      instance = await call((options.activateService || options.activate), deps, options);
      provider = service.newProvider();
      await provider(instance);
    },
    update: async (deps) => {
      const newInstance = await call((options.updateService || options.update), instance, deps, options);
      await provider(instance = newInstance || instance);
    },
    deactivate: async (deps) => {
      await call((options.deactivateService || options.deactivate), instance, deps, options);
      await provider.close();
      instance = null;
    }
  });
}