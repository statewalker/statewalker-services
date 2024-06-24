import services from "./services.ts";

export default function resolveDependencies(options) {
  let values = {};
  let registry = [];
  let active = false;
  const entries = Object.entries(options.dependencies || {});
  const notify = (values) => {
    if (values && Object.keys(values).length === entries.length) {
      if (active) { options.update && options.update(values); }
      else { active = true; options.activate && options.activate(values); }
    } else if (active) {
      active = false;
      options.deactivate && options.deactivate(values || {});
    }
  }
  if (!entries.length) notify({});
  else {
    for (let [key, num] of entries) {
      let min = 0, max = +Infinity;
      if (Array.isArray(num)) { min = num[0] || 0, max = num[1] || Infinity; }
      else if (!isNaN(num)) min = num;
      ((key, min, max) => {
        registry.push(services.newConsumer(key, (list) => {
          if (list.length >= min && list.length <= max) {
            values[key] = list;
          } else delete values[key];
          notify(values = { ...values });
        }));
      })(key, min, max);
    }
  }
  return {
    close: () => {
      registry.forEach(r => r.close());
      registry = [];
      notify(null);
    }
  };
}