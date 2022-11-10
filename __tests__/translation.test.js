import { Active } from '../_envs.js'
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
  const activeLang = cloneDeep(Active.LANGUAGE)
  const activeDefault = cloneDeep(Active.DEFAULT)
  afterAll(() => {
    Active.LANGUAGE = activeLang
    Active.DEFAULT = activeDefault
  })

  /* Tests must run in correct order */
  test(`returns "Untranslated '{key}'" for undefined string`, () => {
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual(`Untranslated 'TEST_VARIABLE_MESSAGE_TYPE'`)
  })
  test(`returns correct translation for active language`, () => {
    translate(TRANSLATION)
    Active.LANGUAGE = LANGUAGE.ENGLISH
    expect(_.TEST_VARIABLE_MESSAGE_TYPE).toEqual(english)
  })
  test(`fallbacks to Active.DEFAULT.LANG if active language has no translation`, () => {
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
    translate(TRANSLATION)
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
