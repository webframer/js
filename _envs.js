import { LANGUAGE, SERVICE } from './constants.js'

/**
 * Environment Variables
 * @example:
 *   // For Next.js, explicitly set variable on initialisation like so:
 *   import { ENV } from '@webframer/js'
 *   import config from 'next/config.js'
 *
 *   Object.assign(ENV, config().publicRuntimeConfig)
 */
export const ENV = (typeof process !== 'undefined' && process.env) || {}
export const NODE_ENV = ENV.NODE_ENV // @Note: Next.js does not automatically add NODE_ENV, set inside next.config.js
export const __PROD__ = NODE_ENV === 'production'
export const __STAGE__ = NODE_ENV === 'stage'
export const __TEST__ = NODE_ENV === 'test'
export const __DEV__ = NODE_ENV === 'development'
export const __CLIENT__ = typeof window !== 'undefined'
export const __BACKEND__ = !__CLIENT__
export const __IOS__ = !!ENV.__IOS__
export const _INIT_ = __BACKEND__ && (__PROD__ || __STAGE__)
export const _SHOULD_SHOW_TEST_ = __DEV__
// Directory path relative to the root `index.js`
export const _WORK_DIR_ = typeof process !== 'undefined' ? process.cwd() : '.'

/* Globally Accessible Objects */
export const Active = {
  // Will be overridden at runtime, used for avoiding circular import and env-dependent libraries
  DEFAULT: {LANG: LANGUAGE.ENGLISH._},
  // The currently used language definition
  LANGUAGE: LANGUAGE.ENGLISH,
  // The current process name prefix
  SERVICE: ENV.SERVICE || (__CLIENT__ ? SERVICE.CLIENT : SERVICE.SERVER),
  // User settings
  SETTINGS: {HAS_SOUND: false},
  // Redux state
  state: {},
  // Redux store
  store: {},
  // Cross Platform API for local storage in Browser, Node.js, React Native, etc.
  Storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
  // Cross Platform WebSocket API for Browser, Node.js, React Native, etc.
  WebSocket: typeof WebSocket !== 'undefined' ? WebSocket : undefined,
  // Cross Platform route history object
  history: {},
  // CSS className for `<Icon />`
  iconClass: '',
  // CSS className prefix for `<Icon />`
  iconClassPrefix: 'icon-',
  // Apollo client
  client: undefined,
  // GraphQL Pubsub module
  pubsub: undefined,
  // Backend console logger
  log: undefined,
  // The current user object, for quick access to user info, such as auth
  user: {},
  // For storing temporary info, like user.lastOnline
  usersById: {},

  /**
   * Password Strength Calculator
   * @example: <script async src="/static/zxcvbn.js"/>
   *    - Frontend uses async script in <head/> section to load static zxcvbn.js for faster page load.
   *    - Backend should override this prop with `Active.passwordCheck = require('zxcvbn')`
   * @returns {zxcvbn|(function(): {score: number})|*}
   */
  get passwordCheck () {
    // When not loaded, skip password validation in frontend
    if (typeof window !== 'undefined') return window.zxcvbn || (() => ({score: Infinity}))
    return this.zxcvbn
  },
  set passwordCheck (zxcvbn) {
    this.zxcvbn = zxcvbn
  }
}
