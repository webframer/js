import { l } from './constants.js'
import { localiseTranslation } from './definitions.js'
import { ips } from './string.js'

/**
 * LOCALISED TRANSLATIONS (i18n) ===============================================
 * =============================================================================
 */

/**
 * Localised String Object (can be extended by adding new terms or languages)
 * @note: follow the example to ensure only one instance of translation exists.
 * @example:
 *    import { _, l, localiseTranslation } from '@webframer/js'
 *
 *    localiseTranslation({
 *      NEW_PHRASE: {
 *        [l.ENGLISH]: 'New Phrase',
 *        [l.RUSSIAN]: 'Новая Фраза',
 *      },
 *    })
 *
 * // Usage:
 *    console.log(_.NEW_PHRASE)
 *    >>> 'New Phrase'
 *
 *    Active.LANGUAGE = LANGUAGE.RUSSIAN
 *    console.log(_.NEW_PHRASE)
 *    >>> 'Новая Фраза'
 *
 * @returns {Object} localised string - that returns localised 'Untranslated' string if no translation found
 */
export const _ = new Proxy(localiseTranslation.instance, {
  get (target, key) {
    return localiseTranslation.queriedById[key] = (target[key] || ips(target.UNTRANSLATED___key__, {key}))
  },
})

// @Note: only english is provided in the bundle definition
// All other languages are to be loaded on the fly as static assets,
// so that they can be cached by the browser.
localiseTranslation({
  // Default messaged for undefined strings
  UNTRANSLATED___key__: {
    [l.ENGLISH]: `Untranslated '{key}'`,
  },
})
