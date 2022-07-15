import { toJSON, toText } from '../codec.js'

describe(`${toJSON.name}()`, () => {
  it('converts nested object correctly', () => {
    expect(toText({a: 3, b: 4, c: {a: 9}, d: null, ar: [1, 3, 5]}))
      .toEqual(`{a:3,b:4,c:{a:9},d:null,ar:[1,3,5]}`)
  })
  it('converts circular object reference correctly', () => {
    expect(toText({a: 3, b: 4, c: {a: 9}, d: null, ar: [1, 3, 5]}))
      .toEqual(`{a:3,b:4,c:{a:9},d:null,ar:[1,3,5]}`)
  })
})

describe(`${toText.name}()`, () => {
  it('converts nested object correctly', () => {
    expect(toText({a: 3, b: 4, c: {a: 9}, d: null, ar: [1, 3, 5]}))
      .toEqual(`{a:3,b:4,c:{a:9},d:null,ar:[1,3,5]}`)
  })
})
