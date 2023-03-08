import { Current } from './_envs.js'
import { LANGUAGE } from './constants.js'

/**
 * PROJECT DEFINITIONS =========================================================
 * =============================================================================
 */

/**
 * Define Getters and Setters for Definition Object to avoid duplicate definitions by mistake
 *
 * @example:
 *    const FIELD = definitionSetup('TYPE', 'ID')
 *    FIELD.TYPE = {
 *      EXPAND: 'Expand',
 *      COLLAPSE: 'Expand', // throws error because of duplicate value 'Expand'
 *    }
 *    ....
 *    FIELD.TYPE = {
 *      EXPAND: 'Expand' // throws error the second time because of duplicate key 'EXPAND'
 *    }
 *
 * @param {String} props - list of definition keys
 * @returns {Object} DEFINITION - new object with getters and setters defined for given `props`
 */
export function definitionSetup (...props) {
  const DEFINITION = {}
  props.forEach(prop => {
    const _key = `_${prop}`
    Object.defineProperty(DEFINITION, prop, {
      get () {
        return this[_key]
      },
      set (def) {
        if (!this[_key]) this[_key] = {}
        const data = this[_key]
        for (const key in def) {
          if (data[key] != null)
            throw new Error(`Duplicate ${prop}[${key}] definition ${JSON.stringify(def, null, 2)}`)
          const value = def[key]
          for (const i in data) {
            if (data[i] === value)
              throw new Error(`Duplicate ${prop}[${key}] definition value "${value}" ${JSON.stringify(def, null, 2)}`)
          }
          data[key] = value
        }
        return data
      },
    })
  })
  return DEFINITION
}

/**
 * Map Object Definition by its Underscore Value
 *
 * @example:
 *  definitionByValue(LANGUAGE)
 *  >>> {
 *        'en': {
 *          _: 'en',
 *          'en': 'English'
 *          ...
 *        },
 *        ...
 *      }
 *
 * @param {Object|Object[]} DEFINITION - key/value pairs of variable name with its underscore value
 * @return {Object} definition - grouped by its underscore value
 */
export function definitionByValue (DEFINITION) {
  const result = {}
  for (const index in DEFINITION) {
    const def = DEFINITION[index]
    result[def._] = def
  }
  return result
}

/**
 * Generate Enumerable List of Values from given Object Definition
 *
 * @example:
 *  enumFrom(LANGUAGE)
 *  >>> ['en', 'fr'...]
 *
 * @param {Object|Object[]} DEFINITION - key/value pairs of variable name with its underscore value
 * @returns {Array<String>} enums - list of enumerable values
 */
export function enumFrom (DEFINITION) {
  const list = []
  for (const index in DEFINITION) {
    list.push(DEFINITION[index]._)
  }
  return list
}

/*
 * Extract Dropdown Options by Language for Given Object Definition
 *
 * @example:
 *    const options = optionsFrom(LANGUAGE)
 *    <Dropdown options={options.items} .../> // options for currently active language can be accessed via `items`,
 *    <Dropdown options={options[LANGUAGE.ENGLISH._]} .../> // or directly via language _
 *
 * @param {{[p: string]: {_: any}}|array} DEFINITION - key/value pairs of variable name with its underscore value
 * @returns {{items, lang: Array<{text, value}}} options - grouped by language underscore value, with .items pointing to active lang
 */
export function optionsFrom (DEFINITION) {
  const options = {
    get items () {
      return this[Current.LANGUAGE._] || this[LANGUAGE.ENGLISH._] || []
    }
  }
  for (const index in DEFINITION) {
    const {_: value, ...langs} = DEFINITION[index]
    for (const lang in langs) {
      const text = langs[lang]
      // Dropdown `value` cannot be an array because of shallow match
      options[lang] = (options[lang] || []).concat({text, value: value.constructor === Array ? value.join(',') : value})
    }
  }
  return options
}

/**
 * Create Initial Values for given Object Definition
 *
 * @example:
 *  initValuesFor(LANGUAGE, LANGUAGE_LEVEL.BASIC._)
 *  >>> {'en': 1, 'fr': 1, ...}
 *
 * @param {Object} DEFINITION - key/value pairs of variable name with its underscore value
 * @param {Number} initValue - the initial value to use for each option
 * @return {Object} initial values - to use with redux form, for example
 */
export function initValuesFor (DEFINITION, initValue = 1) {
  const initValues = {}
  for (const key in DEFINITION) {
    initValues[DEFINITION[key]._] = initValue
  }
  return initValues
}
