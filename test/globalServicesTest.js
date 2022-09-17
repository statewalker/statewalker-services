import { default as expect } from 'expect.js';
import { services } from '../src/index.js';

describe('global "services" variable', () => {

  it(`should be available in the global namespace`, async () => {
    expect(services).to.be(globalThis.statewalker.services);
  })
  
})
