import { default as expect } from 'expect.js';
import newService from '../src/newService.js';

describe('newService', () => {

  it(`should be able to create a new extension with a specified index`, async () => {
    const ext = newService();
    expect(typeof ext.newConsumer).to.be('function');
    expect(typeof ext.newProvider).to.be('function');
    expect(typeof ext.close).to.be('function');
    return ext.close();
  })

  it(`providers should notify consumers about new data`, async () => {
    const ext = newService();

    let values;
    const consumer = ext.newConsumer((v) => values = v);
    const provider = ext.newProvider();

    expect(values).to.eql([]);
    expect(consumer()).to.eql([]);

    let p = provider('one');
    expect(p).to.be(provider); // The method returns itself
    expect(values).to.eql(['one']);
    expect(consumer()).to.eql(['one']);

    p = provider('two');
    expect(values).to.eql(['two']);
    expect(consumer()).to.eql(['two']);

    await ext.close();
  })


  it(`closing providers update data`, () => {
    const ext = newService();
    let values;
    const consumer = ext.newConsumer((v) => values = v);
    const provider = ext.newProvider();
    expect(values).to.eql([]);
    expect(consumer()).to.eql([]);
    provider('abc');
    expect(values).to.eql(['abc']);
    expect(consumer()).to.eql(values);
    provider.close();
    expect(values).to.eql([]);
    expect(consumer()).to.eql(values);
  });

  it(`consumers should get data from multiple providers`, async () => {
    const ext = newService();

    let values;
    const consumer = ext.newConsumer((v) => values = v);
    const p1 = ext.newProvider();
    const p2 = ext.newProvider();
    const p3 = ext.newProvider();

    expect(values).to.eql([]);
    expect(consumer()).to.eql([]);

    await Promise.all([
      p1('p1-a'),
      p2('p2-a'),
      p3('p3-a'),
    ])
    expect(values).to.eql(['p1-a', 'p2-a', 'p3-a']);
    expect(consumer()).to.eql(values);

    await p2('p2-b');
    expect(values).to.eql(['p1-a', 'p2-b', 'p3-a']);
    expect(consumer()).to.eql(values);

    await p3('p3-b');
    expect(values).to.eql(['p1-a', 'p2-b', 'p3-b']);
    expect(consumer()).to.eql(values);

    await Promise.all([
      p1('p1-c'),
      p2('p2-c'),
      p3('p3-c'),
    ])
    expect(values).to.eql(['p1-c', 'p2-c', 'p3-c']);
    expect(consumer()).to.eql(values);

    p2.close();
    expect(values).to.eql(['p1-c', 'p3-c']);
    expect(consumer()).to.eql(values);

    p1.close();
    expect(values).to.eql(['p3-c']);
    expect(consumer()).to.eql(values);

    p3.close();
    expect(values).to.eql([]);
    expect(consumer()).to.eql(values);
  })

  it(`the same provider can notify multiple consumers`, async () => {
    const ext = newService();
    let aValues, bValues, cValues;
    const a = ext.newConsumer((v) => aValues = v);
    const b = ext.newConsumer((v) => bValues = v);
    const c = ext.newConsumer((v) => cValues = v);
    const provider = ext.newProvider();
    expect(aValues).to.eql([]);
    expect(bValues).to.eql([]);
    expect(cValues).to.eql([]);
    await provider('abc');
    expect(aValues).to.eql(['abc']);
    expect(bValues).to.eql(['abc']);
    expect(cValues).to.eql(['abc']);
  });
})
