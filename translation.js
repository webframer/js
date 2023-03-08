import { Current } from './_envs.js'
import { l, LANGUAGE } from './constants.js'
import { ips } from './string.js'

/**
 * LOCALISED TRANSLATIONS (i18n) ===============================================
 * =============================================================================
 */

/**
 * Prepare definitions for localisation, so they can be accessed via .name property
 * without needing to specify the language code explicitly.
 *
 * @example:
 *    localise(LANGUAGE)
 *    console.log(LANGUAGE.ENGLISH.name)
 *    >>> English
 *
 * @param {Object|Object<Object>|Object[]} DEFINITION - key/value pairs of variable name with its _ value
 *    Multiple definitions can be nested unlimited times inside a single object.
 */
export function localise (DEFINITION) {
  for (const index in DEFINITION) {
    const definition = DEFINITION[index]
    const {_, name} = definition
    if (name == null && _ != null) {
      Object.defineProperty(DEFINITION[index], 'name', {
        get () {
          return this[Current.LANGUAGE._] != null
            ? this[Current.LANGUAGE._]
            : (this[LANGUAGE.ENGLISH._] != null ? this[LANGUAGE.ENGLISH._] : String(_))
        },
      })
    } else {
      if (definition.constructor === Object) localise(definition) // recursively process nested definitions
    }
  }
}

/**
 * Prepare translations for localisation by mutation, so they can be accessed directly via .TEXT property
 * @Note: can be applied repeatedly to add new translations or languages after requests from API
 *
 * @example:
 *    translate({
 *      SEARCH: { // use this for key `Search`.replace(/[^a-zA-Z\d]/g, '_').toUpperCase()
 *        [l.ENGLISH]: `Search`,
 *        [l.RUSSIAN]: `Поиск`,
 *      }
 *    })
 *    log(_.SEARCH)
 *    # if active language is English
 *    >>> 'Search'
 *    # if active language is Russian
 *    >>> 'Поиск'
 *
 * Add language:
 *    _.SEARCH = {
 *      ..., // previous definitions
 *      [l.CHINESE]: '搜索', // language addition
 *    }
 *    log(_.SEARCH)
 *    # if active language is Chinese
 *    >>> 搜索
 *
 * @param {Object} TRANSLATION - key/value pairs of variable name with its localised (translated) values
 * @returns {Object} translations - with all definitions as javascript getters returning currently active language,
 *  (falls back to English if definition not found for active language, or empty string).
 */
export function translate (TRANSLATION) {
  for (const KEY in TRANSLATION) {
    const _data = TRANSLATION[KEY]
    // Update existing translations
    if (KEY in translate.instance) {
      translate.instance[KEY] = _data
    } else {
      // Define translations for the first time
      const _key = '~' + KEY
      Object.defineProperty(translate.instance, KEY, {
        get () {
          // initially cannot use setter to define translations, thus fallback to _data
          const data = translate.instance[_key] || (translate.instance[_key] = _data)
          return data[Current.LANGUAGE._] || data[Current.DEFAULT.LANG] || KEY || ''
        },
        set (data) {
          // merge new translations with existing
          translate.instance[_key] = {...translate.instance[_key], ...data}
        },
      })
    }
  }
  return translate.instance
}

translate.instance = {}
translate.queriedById = {}

// @Note: only english is provided in the bundle definition
// All other languages are to be loaded on the fly as static assets,
// so that they can be cached by the browser.
translate({
  // Default messaged for undefined strings
  UNTRANSLATED___key__: {
    [l.ENGLISH]: `Untranslated '{key}'`,
  },
})

/**
 * Localised String Object (can be extended by adding new terms or languages)
 * @note: follow the example to ensure only one instance of translation exists.
 * @example:
 *    import { _, l, translate } from '@webframer/js'
 *
 *    // Add or update localised term(s)
 *    translate({
 *      NEW_PHRASE: {
 *        [l.ENGLISH]: 'New Phrase',
 *      },
 *    })
 *
 *    // Usage:
 *    log(_.NEW_PHRASE)
 *    >>> 'New Phrase'
 *
 *    // Add or update localised term(s)
 *    translate({
 *      NEW_PHRASE: {
 *        [l.RUSSIAN]: 'Новая Фраза',
 *      },
 *      MORE_PHRASES: {
 *        [l.ENGLISH]: 'More Phrases',
 *      },
 *    })
 *
 *    // Existing translations remain
 *    log(_.NEW_PHRASE)
 *    >>> 'New Phrase'
 *
 *    // Set the current language.
 *    Current.LANGUAGE = LANGUAGE.RUSSIAN
 *    log(_.NEW_PHRASE)
 *    >>> 'Новая Фраза'
 *
 * @returns {Object} localised string - that returns localised 'Untranslated' string if no translation found
 */
export const _ = new Proxy(translate.instance, {
  get (target, key) {
    return translate.queriedById[key] = (target[key] || ips(target.UNTRANSLATED___key__, {key}))
  },
})

/**
 * Convert single/multiple Definition values into localised human-readable String(s)
 *
 * @param {String|Number|Array} values - definition's underscore value/s
 * @param {Object} definitionByValue - example: definitionByValue(LANGUAGE)
 * @param {*} [output] - one of types (i.e. String, Array, etc.)
 * @returns {String|Array<String>} string/s - for human consumption
 */
export function valueToName (values, definitionByValue, output = String) {
  const items = ((values && values.constructor === Array) ? values : [values]).map(code => (definitionByValue[code] || {}).name)
  switch (output) {
    case Array:
      return items
    case String:
    default:
      return items.join(' ' + _.OR + ' ')
  }
}
