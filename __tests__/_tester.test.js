import tester from '../_tester.js'

describe(`${tester.name || '_tester'}()`, () => {
  const testCases = [
    {
      args: [
        '',
      ],
      result: '',
    },
  ]

  // Run tests
  for (const {args, result} of testCases) {
    test(`${args} => ${result}`, () => {
      expect(tester(...args)).toEqual(result)
    })
  }
})
