import { fromRoman, toRoman } from '../formatter.js'

const numberToRomanTests = [
  [1, 'I'],
  [2, 'II'],
  [3, 'III'],
  [4, 'IV'],
  [5, 'V'],
  [6, 'VI'],
  [7, 'VII'],
  [8, 'VIII'],
  [9, 'IX'],
  [10, 'X'],
  [11, 'XI'],
  [12, 'XII'],
  [13, 'XIII'],
  [14, 'XIV'],
  [15, 'XV'],
  [16, 'XVI'],
  [17, 'XVII'],
  [18, 'XVIII'],
  [19, 'XIX'],
  [20, 'XX'],
  [27, 'XXVII'],
  [58, 'LVIII'],
  [1994, 'MCMXCIV'],
  [3999, 'MMMCMXCIX'],
]

describe(`${toRoman.name}()`, () => {
  for (const [number, letter] of numberToRomanTests) {
    test(`${number} : ${letter}`, () => expect(toRoman(number)).toEqual(letter))
  }
})

describe(`${fromRoman.name}()`, () => {
  for (const [number, letter] of numberToRomanTests) {
    test(`${letter} : ${number}`, () => expect(fromRoman(letter)).toEqual(number))
  }
})
