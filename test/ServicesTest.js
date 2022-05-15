import { default as expect } from 'expect.js';
import newServices from '../src/newServices.js';

describe('newServices', () => {

  it(`providers from one extension can notify
    consumers with the same key from another extension`, async () => {
    let key = 'xx', index = {};
    const ext1 = newServices({ index });
    const ext2 = newServices({ index });

    let values;
    const consumer = ext1.newConsumer(key, (v) => values = v);
    const provider = ext2.newProvider(key);

    expect(values).to.eql([]);
    expect(consumer()).to.eql([]);

    provider('one');
    expect(values).to.eql(['one']);
    expect(consumer()).to.eql(['one']);

    provider('two');
    expect(values).to.eql(['two']);
    expect(consumer()).to.eql(['two']);

    await ext1.close();
    await ext2.close();
  })
  
})
