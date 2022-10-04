import CircularJSON from 'circular-json-es6' // do not change to `flatted` package,
// because it does not comply to JSON standard, and outputs a flat index of objects.
// Example:
//  - flatted.stringify({a:1}) >>> [{a:1}]
//  - flatted.toJSON({a:1}) >>> [{a:1}]
// => better to use 'circular-json-es6' because it's about two times faster than 'circular-json'

/**
 * DATA FORMAT FUNCTIONS =======================================================
 * =============================================================================
 */

export {
  CircularJSON,
}

/**
 * Compare if two values are the same by converting them to JSON strings
 * @example:
 *    React.memo(func, isEqualJSON)
 *
 * @param {any} oldVal - to compare
 * @param {any} newVal - to compare
 * @returns {Boolean} true - if JSON string of given values are the same
 */
export function isEqualJSON (oldVal, newVal) {
  return toJSON(oldVal) === toJSON(newVal)
}

/**
 * Converts given value to a JSON string if necessary
 *
 * @param {any} data - to convert
 * @param {any} args - additional options
 * @return {string}
 */
export function toJSON (data, ...args) {
  return (typeof data === 'object') ? CircularJSON.stringify(data, ...args) : String(data)
}

/**
 * Attempts to parse a JSON string.
 *
 * @param {string} data - the string to be parsed
 * @return {Object|Null} - a JavaScript object if parsed successfully, null if not
 */
export function fromJSON (data) {
  try {
    return CircularJSON.parse(data)
  } catch (e) {
    return data
  }
}

/**
 * Checks to see if the data passed is valid JSON.
 *
 * @param {string} data - the json to parse.
 * @return {boolean}
 */
export function isJSON (data) {
  let isJson = true

  try {
    JSON.parse(data)
  } catch (e) {
    isJson = false
  }

  return isJson
}

/**
 * Convert Javascript object to text
 *
 * @param {*} value - to convert to text
 * @return {string}
 */
export function toText (value) {
  if (value == null) return String(value)
  switch (typeof value) {
    case 'symbol':
    case 'number':
      return String(value)
  }

  const string = []

  /* Array */
  if (value.constructor === Array) {
    for (const prop in value) {
      string.push(toText(value[prop]))
    }
    return '[' + string.join(',') + ']'
  }

  /* Object */
  if (value.constructor === Object) {
    for (const prop in value) {
      string.push(prop + ':' + toText(value[prop]))
    }
    return '{' + string.join(',') + '}'
  }

  /* Function */
  if (value.constructor === Function) {
    // note: fat arrow function will always convert to `function() {}` in browser,
    // but in the server it converts as fat arrow function `()=>{}`
    return value.toString()
  }

  /* Other Values */
  return JSON.stringify(value)
}

/**
 * JSON Encoder and Decoder
 */
export const Json = {
  encode: toJSON,
  decode: fromJSON,
}
