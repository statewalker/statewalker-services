import { describe, it, expect } from "./deps.ts";
import newServices from '../src/newServices.ts';

describe('newServices', () => {

  it(`providers from one extension can notify
    consumers with the same key from another extension`, async () => {
    let key = 'xx', index = {};
    const ext1 = newServices({ index });
    const ext2 = newServices({ index });

    let values;
    const consumer = ext1.newConsumer(key, (v) => values = v);
    const provider = ext2.newProvider(key);

    expect(values).toEqual([]);
    expect(consumer()).toEqual([]);

    provider('one');
    expect(values).toEqual(['one']);
    expect(consumer()).toEqual(['one']);

    provider('two');
    expect(values).toEqual(['two']);
    expect(consumer()).toEqual(['two']);

    await ext1.close();
    await ext2.close();
  })
  
})
