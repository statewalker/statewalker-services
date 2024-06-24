import { describe, it, expect } from "./deps.ts";
import newService from '../src/newService.ts';

describe('newService', () => {

  it(`should be able to create a new extension with a specified index`, async () => {
    const ext = newService();
    expect(typeof ext.newConsumer).toBe('function');
    expect(typeof ext.newProvider).toBe('function');
    expect(typeof ext.close).toBe('function');
    return ext.close();
  })

  it(`providers should notify consumers about new data`, async () => {
    const ext = newService();

    let values;
    const consumer = ext.newConsumer((v) => values = v);
    const provider = ext.newProvider();

    expect(values).toEqual([]);
    expect(consumer()).toEqual([]);

    let p = provider('one');
    expect(p).toBe(provider); // The method returns itself
    expect(values).toEqual(['one']);
    expect(consumer()).toEqual(['one']);

    p = provider('two');
    expect(values).toEqual(['two']);
    expect(consumer()).toEqual(['two']);

    await ext.close();
  })


  it(`closing providers update data`, () => {
    const ext = newService();
    let values;
    const consumer = ext.newConsumer((v) => values = v);
    const provider = ext.newProvider();
    expect(values).toEqual([]);
    expect(consumer()).toEqual([]);
    provider('abc');
    expect(values).toEqual(['abc']);
    expect(consumer()).toEqual(values);
    provider.close();
    expect(values).toEqual([]);
    expect(consumer()).toEqual(values);
  });

  it(`consumers should get data from multiple providers`, async () => {
    const ext = newService();

    let values;
    const consumer = ext.newConsumer((v) => values = v);
    const p1 = ext.newProvider();
    const p2 = ext.newProvider();
    const p3 = ext.newProvider();

    expect(values).toEqual([]);
    expect(consumer()).toEqual([]);

    await Promise.all([
      p1('p1-a'),
      p2('p2-a'),
      p3('p3-a'),
    ])
    expect(values).toEqual(['p1-a', 'p2-a', 'p3-a']);
    expect(consumer()).toEqual(values);

    await p2('p2-b');
    expect(values).toEqual(['p1-a', 'p2-b', 'p3-a']);
    expect(consumer()).toEqual(values);

    await p3('p3-b');
    expect(values).toEqual(['p1-a', 'p2-b', 'p3-b']);
    expect(consumer()).toEqual(values);

    await Promise.all([
      p1('p1-c'),
      p2('p2-c'),
      p3('p3-c'),
    ])
    expect(values).toEqual(['p1-c', 'p2-c', 'p3-c']);
    expect(consumer()).toEqual(values);

    p2.close();
    expect(values).toEqual(['p1-c', 'p3-c']);
    expect(consumer()).toEqual(values);

    p1.close();
    expect(values).toEqual(['p3-c']);
    expect(consumer()).toEqual(values);

    p3.close();
    expect(values).toEqual([]);
    expect(consumer()).toEqual(values);
  })

  it(`the same provider can notify multiple consumers`, async () => {
    const ext = newService();
    let aValues, bValues, cValues;
    const a = ext.newConsumer((v) => aValues = v);
    const b = ext.newConsumer((v) => bValues = v);
    const c = ext.newConsumer((v) => cValues = v);
    const provider = ext.newProvider();
    expect(aValues).toEqual([]);
    expect(bValues).toEqual([]);
    expect(cValues).toEqual([]);
    await provider('abc');
    expect(aValues).toEqual(['abc']);
    expect(bValues).toEqual(['abc']);
    expect(cValues).toEqual(['abc']);
  });
})
