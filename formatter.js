/**
 * FORMAT HELPERS ==============================================================
 * =============================================================================
 */

/**
 * Convert Roman numerals string to Integer
 * @example:
 *   fromRoman('XXVII')
 *   >>> 27
 *
 * @param {string} numerals
 * @returns {number} integer
 */
export function fromRoman (numerals) {
  // Walk through characters to accumulate total
  let total = 0
  let list = numerals.split('')
  let key, val, v
  for (let i = 0; i < numerals.length;) {
    key = list[i]
    // If the succeeding character can be subtracted, increment loop index, and use subtracted value
    if (i < numerals.length - 1 && (v = romanPrefixNum[key] && romanPrefixNum[key][list[i + 1]])) {
      val = v
      i += 2
    } else { // Else increment loop index by one
      val = romanLetterToNum[key]
      i++
    }
    total += val
  }
  return total
}

/**
 * Convert Integer to Roman numerals
 * @example:
 *    toRoman(58)
 *    >>> 'LVIII'
 *
 * @param {number} number - an integer with constraints `1 <= number <= 3999`
 * @returns {string} roman numerals representation
 */
export function toRoman (number) {
  // Because the constraints is within max Roman numeral range, no need to break down the number
  // => simply iterate from start to end, one character at a time
  let s = String(number).split('')
  let n, suffix, r = '', char
  while (s.length) {
    n = s.shift()
    suffix = s.length ? romanPadString.substring(0, s.length) : ''
    char = romanNumToLetter[n + suffix]

    // Number matches predefined Roman letters: 1, 4, 5, and 9
    if (char) r += char

    // Number does not match definition
    else {
      n = +n
      switch (n) {
        // Roman numbers 2 and 3 are repeated letters
        case 2:
        case 3:
          r += repeatRomanLetter(n, suffix)
          break
        // Roman numbers 6, 7, 8 are letter combos
        case 6:
          r += romanNumToLetter[5 + suffix] + romanNumToLetter[1 + suffix]
          break
        case 7:
          r += romanNumToLetter[5 + suffix] + repeatRomanLetter(2, suffix)
          break
        case 8:
          r += romanNumToLetter[5 + suffix] + repeatRomanLetter(3, suffix)
          break
      }
    }
  }

  return r
}

// HELPERS -----------------------------------------------------------------------------------------

/**
 * Get the same Roman letter multiple times
 * @param {number} n
 * @param {string} suffix
 * @returns {string}
 */
function repeatRomanLetter (n, suffix) {
  let char = romanNumToLetter[1 + suffix]
  if (n === 1) return char
  return Array(n).fill(char).join('')
}

const romanPadString = '0000'
const romanNumToLetter = {
  1: 'I',
  4: 'IV',
  5: 'V',
  9: 'IX',
  10: 'X',
  40: 'XL',
  50: 'L',
  90: 'XC',
  100: 'C',
  400: 'CD',
  500: 'D',
  900: 'CM',
  1000: 'M',
}
const romanLetterToNum = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
}
const romanPrefixNum = {
  I: {
    V: 4,
    X: 9,
  },
  X: {
    L: 40,
    C: 90,
  },
  C: {
    D: 400,
    M: 900,
  },
}
