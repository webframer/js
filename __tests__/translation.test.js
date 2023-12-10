import { current } from '../_envs.js'
import { l, LANGUAGE } from '../constants.js'
import { cloneDeep } from '../object.js'
import { interpolateString } from '../string.js'
import { _, translate } from '../translation.js'

describe(`i18n translation`, () => {
  const variable = 'Hello'
  const type = '!'
  const english = 'Test {variable} Message{type}'
  const englishInterpolated = `Test ${variable} Message${type}`
  const russian = '{type}Тэст {variable} Сообщение'
  const russianInterpolated = `${type}Тэст ${variable} Сообщение`
  const TRANSLATION = {
    TEST_VARIABLE_MESSAGE_TYPE: {
      [l.ENGLISH]: english,
    },
  }
  const activeLang = cloneDeep(current.LANGUAGE)
  const activeDefault = cloneDeep(current.DEFAULT)
  afterAll(() => {
    current.LANGUAGE = activeLang
    current.DEFAULT = activeDefault
  })

  /* Tests must run in correct order */
  test(`returns "Untranslated '{key}'" for undefined string`, () => {
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual(`Untranslated 'TEST_VARIABLE_MESSAGE_TYPE'`)
  })
  test(`returns correct translation for active language`, () => {
    translate(TRANSLATION)
    current.LANGUAGE = LANGUAGE.ENGLISH
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual(english)
  })
  test(`fallbacks to Current.DEFAULT.LANG if active language has no translation`, () => {
    current.LANGUAGE = LANGUAGE.RUSSIAN
    current.DEFAULT.LANG = LANGUAGE.ENGLISH._
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual(english)
  })
  test(`returns translation key if fallback does not exist`, () => {
    current.LANGUAGE = LANGUAGE.RUSSIAN
    current.DEFAULT.LANG = LANGUAGE.SPANISH._
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual('TEST_VARIABLE_MESSAGE_TYPE')
  })
  test(`can redefine the same translation key repeatedly to add translations`, () => {
    const TRANSLATION = {
      TEST_VARIABLE_MESSAGE_TYPE: {
        [l.RUSSIAN]: russian,
      },
    }
    translate(TRANSLATION)
    current.LANGUAGE = LANGUAGE.RUSSIAN
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual(russian)
    current.LANGUAGE = LANGUAGE.ENGLISH
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual(english)
  })
  test(`works with string interpolation`, () => {
    current.LANGUAGE = LANGUAGE.ENGLISH
    expect(interpolateString(_.TEST_VARIABLE_MESSAGE_TYPE, {variable, type})).toEqual(englishInterpolated)
    current.LANGUAGE = LANGUAGE.RUSSIAN
    expect(interpolateString(_.TEST_VARIABLE_MESSAGE_TYPE, {variable, type})).toEqual(russianInterpolated)
  })
})
