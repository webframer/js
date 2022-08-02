import { Active } from '../_envs.js'
import { l, LANGUAGE } from '../constants.js'
import { localiseTranslation } from '../definitions.js'
import { cloneDeep } from '../object.js'
import { interpolateString } from '../string.js'
import { _ } from '../translations.js'

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
  const activeLang = cloneDeep(Active.LANGUAGE)
  const activeDefault = cloneDeep(Active.DEFAULT)
  afterAll(() => {
    Active.LANGUAGE = activeLang
    Active.DEFAULT = activeDefault
  })

  /* Tests must run in correct order */
  test(`returns 'Untranslated' for undefined string`, () => {
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual('Untranslated')
  })
  test(`returns correct translation for active language`, () => {
    localiseTranslation(TRANSLATION)
    Active.LANGUAGE = LANGUAGE.ENGLISH
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual(english)
  })
  test(`fallbacks to Active.DEFAULT.LANGUAGE if active language has no translation`, () => {
    Active.LANGUAGE = LANGUAGE.RUSSIAN
    Active.DEFAULT.LANG = LANGUAGE.ENGLISH._
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual(english)
  })
  test(`returns translation key if fallback does not exist`, () => {
    Active.LANGUAGE = LANGUAGE.RUSSIAN
    Active.DEFAULT.LANG = LANGUAGE.SPANISH._
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual('TEST_VARIABLE_MESSAGE_TYPE')
  })
  test(`can redefine the same translation key repeatedly to add translations`, () => {
    const TRANSLATION = {
      TEST_VARIABLE_MESSAGE_TYPE: {
        [l.RUSSIAN]: russian,
      },
    }
    localiseTranslation(TRANSLATION)
    Active.LANGUAGE = LANGUAGE.RUSSIAN
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual(russian)
    Active.LANGUAGE = LANGUAGE.ENGLISH
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual(english)
  })
  test(`works with string interpolation`, () => {
    Active.LANGUAGE = LANGUAGE.ENGLISH
    expect(interpolateString(_.TEST_VARIABLE_MESSAGE_TYPE, {variable, type})).toEqual(englishInterpolated)
    Active.LANGUAGE = LANGUAGE.RUSSIAN
    expect(interpolateString(_.TEST_VARIABLE_MESSAGE_TYPE, {variable, type})).toEqual(russianInterpolated)
  })
})
