export default function newService() {
  let values;
  let providers = []
  let consumers = [];
  const service = function () {
    if (!values) { values = providers.map(_ => _.value).filter(v => v !== undefined); }
    return values
  };
  function notify() { const v = service(); consumers.forEach(c => c.listener && c.listener(v)); }
  service.closed = false;

  service.close = function close() {
    service.closed = true;
    values = null;
    service.newProvider = service.newConsumer = () => { throw new Error('Service is closed'); };
    providers.forEach(p => p.close());
    consumers.forEach(c => c.close());
    providers = consumers = [];
  }

  service.newProvider = function newProvider(initial) {
    const provider = (value) => (values = null, provider.value = value, notify(), provider);
    provider.close = () => {
      provider.closed = true;
      providers = providers.filter(p => provider !== p);
      values = null;
      notify();
    };
    providers.push(provider);
    if (initial !== undefined) provider(initial);
    return provider;
  }

  service.newConsumer = function newConsumer(listener) {
    const consumer = () => service();
    consumer.listener = listener;
    consumer.close = () => {
      consumer.closed = true;
      consumers = consumers.filter(c => consumer !== c);
    };
    consumers.push(consumer);
    consumer.listener && consumer.listener(service());
    return consumer;
  }

  return service;
}
