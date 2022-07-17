import { isAsyncFunction, isFunction, isGeneratorFunction } from '../function.js'

const NON_OBJECT_VALUES = [
  100,
  NaN,
  null,
  undefined,
  'foo',
  '',
  []
]
const NON_FUNCTION_VALUES = [
  ...NON_OBJECT_VALUES
]

test(`${isFunction.name}() returns true for normal, async and generator functions`, () => {
  NON_FUNCTION_VALUES.forEach(val => {
    expect(isFunction(val)).toBe(false)
  })
  expect(isFunction(() => {})).toBe(true)
  expect(isFunction(async () => {})).toBe(true)
  expect(isFunction(function * () {})).toBe(true)
})

test(`${isAsyncFunction.name}() returns true for async functions only`, () => {
  expect(isAsyncFunction(() => {})).toBe(false)
  expect(isAsyncFunction(async () => {})).toBe(true)
  expect(isAsyncFunction(function * () {})).toBe(false)
})

test(`${isGeneratorFunction.name}() returns true for generator functions only`, () => {
  expect(isGeneratorFunction(() => {})).toBe(false)
  expect(isGeneratorFunction(async () => {})).toBe(false)
  expect(isGeneratorFunction(function * () {})).toBe(true)
})
