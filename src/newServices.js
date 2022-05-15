import newService from "./newService.js"

export default function newServices({ services = {}, index = {} } = {}) {
  function getService(key, create = true) {
    let service = index[key];
    if (!service && create) { service = index[key] = newService(); }
    return service;
  }
  function newConsumer(serviceKey, action) {
    const Service = getService(serviceKey);
    return Service.newConsumer((list) => action(list));
  }
  function newProvider(serviceKey, initial) {
    const Service = getService(serviceKey);
    return Service.newProvider(initial);
  }
  function close() {
    for (const service of Object.values(index)) {
      service.close();
    }
  }
  services.index = index;
  services.getService = getService;
  services.newService = newService;
  services.newConsumer = newConsumer;
  services.newProvider = newProvider;
  services.close = close;
  return services;
}
