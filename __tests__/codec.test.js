import { toText } from '../codec.js'

describe(`${toText.name}()`, () => {
  it('converts data types correctly', () => {
    // noinspection JSPrimitiveTypeWrapperUsage
    expect(toText([
      'a', 5, Symbol('s'), Symbol.for('s'), new String('a'), new Number(8), [9], {key: 'val'},
      0.0,
      1e10,
      1e-10,
      Infinity,
      -Infinity,
      NaN,
      '',
      {},
      null,
      undefined,
      function () {}, // arrow function will cause hydration mismatch, because browser always outputs function
      new Date(100000000000),
    ])).toEqual(`["a",5,Symbol("s"),Symbol.for("s"),new String("a"),new Number(8),[9],{key:"val"},` +
      `0,10000000000,1e-10,Infinity,-Infinity,NaN,"",{},null,undefined,function () {},"1973-03-03T09:46:40.000Z"]`)
  })
  it('converts nested object correctly', () => {
    expect(toText({a: 3, b: 4, c: {a: 9}, d: null, ar: [1, 3, 5]}))
      .toEqual(`{a:3,b:4,c:{a:9},d:null,ar:[1,3,5]}`)
  })
})
