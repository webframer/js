import tester from '../_tester.js'

describe(`${tester.name || '_tester'}()`, () => {
  const args = [
    '',
  ]
  test(`${args}`, () => {
    expect(tester(...args)).toEqual('')
  })
})
