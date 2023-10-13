// Microservice Prefixes
export const SERVICE = {
  API: 'API',
  BOT: 'BOT',
  CLIENT: 'CLIENT',
  DESKTOP: 'DESKTOP',
  MOBILE: 'MOBILE',
  SERVER: 'SERVER',
  WEB: 'WEB',
}

/**
 * COMMON ACTION CONSTANTS =====================================================
 * =============================================================================
 */
export const SEPARATOR = ' -> '         // ACTION type separator string
export const RESULT_SEPARATOR = '_'     // RESULT type separator string
export const SYSTEM = 'SYSTEM'          // Internal app action subject

/* CRUD Actions */
export const GET = 'GET'             		// Retrieving data
export const CREATE = 'CREATE'          // Posting new data to backend
export const UPDATE = 'UPDATE'          // For saving remote API data (e.g. syncing with backend)
export const DELETE = 'DELETE'          // Destroying data from backend
export const LIST = 'LIST'            	// Retrieving list of data

/* State Only Actions */
export const SET = 'SET'             		// For saving non-API data in state
export const RESET = 'RESET'
export const REFRESH = 'REFRESH'
export const HYDRATE = 'HYDRATE'        // For Hydrating Redux Store
export const LOGIN = 'LOGIN'
export const LOGOUT = 'LOGOUT'
export const LOAD = 'LOAD'
export const ALERT = 'ALERT'           	// For broadcasting a resource
export const SAVE = 'SAVE'            	// For triggering persistence of a resource
export const EDIT = 'EDIT'
export const OPEN = 'OPEN'
export const CLOSE = 'CLOSE'
export const SEARCH = 'SEARCH'          // For searching for a resource
export const SUBMIT = 'SUBMIT'          // For triggering submission of a resource
export const ADD = 'ADD'             		// For adding a resource
export const APPLY = 'APPLY'            // For administering a resource
export const CHANGE = 'CHANGE'          // For changing state
export const COPY = 'COPY'             	// For duplicating a resource
export const REMOVE = 'REMOVE'          // For removing state
export const REPORT = 'REPORT'       		// For broadcasting a resource
export const PREFETCH = 'PREFETCH'      // For preloading a resource
export const PRESET = 'PRESET'					// For preparing a resource
export const PRE_ADD = 'PRE_ADD'				// For preparing a resource
export const PRE_REMOVE = 'PRE_REMOVE'	// For preparing a resource
export const SELECT = 'SELECT'      		// For picking a resource
export const TOGGLE = 'TOGGLE'      		// For switching between states

/* App Specific Actions */

/* Action Result Types */
export const START = 'START'
export const CANCEL = 'CANCEL'
export const FINISH = 'FINISH'
export const RECEIVED = 'RECEIVED'
export const VOID = 'VOID'            	// No response at all

/* Socket Actions */
export const SEND = 'SEND'
export const SUBSCRIBE = 'SUBSCRIBE'
export const UNSUBSCRIBE = 'UNSUBSCRIBE'

/* Socket Network Action Result Types */
export const CONNECTED = 'CONNECTED'
export const DISCONNECTED = 'DISCONNECTED'
export const MESSAGE = 'MESSAGE'

/* API Network Action Result Types */
export const REQUEST = 'REQUEST'
export const SUCCESS = 'SUCCESS'
export const ERROR = 'ERROR'
export const TIMEOUT = 'TIMEOUT'

export const ALL_ACTIONS = [
  GET,
  CREATE,
  UPDATE,
  DELETE,
  LIST,
  SET,
  RESET,
  REFRESH,
  HYDRATE,
  EDIT,
  LOGIN,
  LOGOUT,
  LOAD,
  SAVE,
  CLOSE,
  OPEN,
  SUBMIT,
  SEARCH,
  ADD,
  APPLY,
  ALERT,
  CHANGE,
  COPY,
  REMOVE,
  REPORT,
  PREFETCH,
  PRESET,
  PRE_ADD,
  PRE_REMOVE,
  SELECT,
  TOGGLE,
]

export const ALL_RESULTS = [
  START,
  CANCEL,
  FINISH,
  REQUEST,
  SUCCESS,
  ERROR,
  TIMEOUT,
  CONNECTED,
  DISCONNECTED,
  MESSAGE,
  RECEIVED,
  VOID,
]

export const isMacLike = typeof navigator !== 'undefined' && /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)

/**
 * Map of Event.code as `key` ad Event.keyCode as `value`, followed by Event.key as comment.
 *
 * @notes:
 *  - ignore recommendation from MDN to use .code instead .keyCode (as said to be deprecated),
 *    because .code is poorly supported while .keyCode is on all browsers atm of writing.
 *    https://caniuse.com/keyboardevent-code
 *    https://caniuse.com/mdn-api_keyboardevent_keycode
 */
export const KEY = {
  // PointerEvent.button - these have no names, `code`, `key` and `keyCode` are undefined
  UNDEFINED: -1,
  LEFT_CLICK: 0,
  MIDDLE_CLICK: 1,
  RIGHT_CLICK: 2,

  /**
   * Use the non-existing event.code 'Ctrl' when creating keyboard shortcuts, instead of KEY.Control
   * because of inconsistent behaviors for Ctrl/Control keys on Windows/macOS:
   *   - Ctrl: `event.ctrlKey === true`, `event.metaKey === false`, `keyCode === 17` in Windows
   *   - ⌘: `event.ctrlKey === false`, `event.metaKey === true`, `keyCode === (91 || 93)` in macOS
   *  - `-17` is a non-existing `keyCode` value for internal logic check.
   * @see: `./keyboard.js` for reference of internal logic implementation.
   */
  Ctrl: -17,

  // @reference: https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/
  // @see: https://github.com/kabirbaidhya/keycode-js/blob/master/dist/keycode.cjs.js
  // key = KeyboardEvent.code
  Cancel: 3, // Cancel?
  Help: 6, // Help?
  Backspace: 8, // Backspace
  Tab: 9, // Tab
  Clear: 12, // Clear?
  Enter: 13, // Enter
  ShiftLeft: 16, // Shift
  ShiftRight: 16, // Shift
  Shift: 16, // Shift (defined the last for swapKeyWithValue() to work)
  ControlLeft: 17, // Control
  ControlRight: 17, // Control
  Control: 17, // Control (⌃ in macOS, and Ctrl in Windows) -> do not use for shortcuts, see above
  AltLeft: 18, // Alt
  AltRight: 18, // Alt
  Alt: 18, // Alt
  Pause: 19, // Pause
  CapsLock: 20, // CapsLock
  Escape: 27, // Escape
  Space: 32, //
  PageUp: 33, // PageUp?
  PageDown: 34, // PageDown?
  End: 35, // End?
  Home: 36, // Home?
  ArrowLeft: 37, // ArrowLeft
  ArrowUp: 38, // ArrowUp
  ArrowRight: 39, // ArrowRight
  ArrowDown: 40, // ArrowDown
  PrintScreen: 44, // PrintScreen?
  Insert: 45, // Insert?
  Delete: 46, // Delete?
  Equal: 187, // =
  Minus: 189, // -
  /**
   *  @note: Meta key is unreliable, it depends on the keyboard. For example, most online sources
   *  report 92 as MetaRight, but when tested on MacBook Pro 16", it is 93.
   */
  MetaLeft: 91, // Meta (left command ⌘ in macOS, or left window in Windows)
  MetaRight: 93, // Meta (right command ⌘ in macOS, or right window in Windows?)

  // for developer convenience
  _0: 48,
  _1: 49,
  _2: 50,
  _3: 51,
  _4: 52,
  _5: 53,
  _6: 54,
  _7: 55,
  _8: 56,
  _9: 57,

  // for `key` fallback
  [0]: 48,
  [1]: 49,
  [2]: 50,
  [3]: 51,
  [4]: 52,
  [5]: 53,
  [6]: 54,
  [7]: 55,
  [8]: 56,
  [9]: 57,

  // Actual Event.code for programmatic use
  Digit0: 48, // 0
  Digit1: 49, // 1
  Digit2: 50, // 2
  Digit3: 51, // 3
  Digit4: 52, // 4
  Digit5: 53, // 5
  Digit6: 54, // 6
  Digit7: 55, // 7
  Digit8: 56, // 8
  Digit9: 57, // 9

  // for developer convenience and for `key` fallback if `code` not found
  a: 65,
  b: 66,
  c: 67,
  d: 68,
  e: 69,
  f: 70,
  g: 71,
  h: 72,
  i: 73,
  j: 74,
  k: 75,
  l: 76,
  m: 77,
  n: 78,
  o: 79,
  p: 80,
  q: 81,
  r: 82,
  s: 83,
  t: 84,
  u: 85,
  v: 86,
  w: 87,
  x: 88,
  y: 89,
  z: 90,

  // Actual Event.code for programmatic use
  KeyA: 65, // a
  KeyB: 66, // b
  KeyC: 67, // c
  KeyD: 68, // d
  KeyE: 69, // e
  KeyF: 70, // f
  KeyG: 71, // g
  KeyH: 72, // h
  KeyI: 73, // i
  KeyJ: 74, // j
  KeyK: 75, // k
  KeyL: 76, // l
  KeyM: 77, // m
  KeyN: 78, // n
  KeyO: 79, // o
  KeyP: 80, // p
  KeyQ: 81, // q
  KeyR: 82, // r
  KeyS: 83, // s
  KeyT: 84, // t
  KeyU: 85, // u
  KeyV: 86, // v
  KeyW: 87, // w
  KeyX: 88, // x
  KeyY: 89, // y
  KeyZ: 90, // z
}

/* Distance */
export const ONE_MM = 1
export const ONE_CM = 10 * ONE_MM
export const ONE_METER = 1000 * ONE_MM
export const ONE_KM = 1000 * ONE_METER
export const ONE_INCH = 25.4 * ONE_MM
export const ONE_FOOT = 304.8 * ONE_MM
export const ONE_YARD = 914.4 * ONE_MM
export const ONE_MILE = 1609344 * ONE_MM

/* Formats */
export const FORMAT_TIME = 'YYYY-MM-DD hh:mm:ss'
export const FORMAT_TIME_FOR_HUMAN = 'ddd, D MMM - hh:mm a'
export const FORMAT_DATE = 'DD.MM.YYYY'
export const FORMAT_DATE_ISO = 'YYYY-MM-DD'
export const FORMAT_HH_MM = 'HH[:]mm'
export const FORMAT_DD_MMM = 'D MMM'
export const FORMAT_DD_MMM_YYYY = 'D MMM, YYYY'
export const FORMAT_MMM_YYYY = 'MMM YYYY'
export const FORMAT_TIME_FOR_CLI_OPTS = {
  shorten: true, round: false, largest: 2, units: ['y', 'mo', 'w', 'd', 'h', 'm', 's', 'ms'],
}

/* Placeholders */
export const ID = '{ID}'

/* Size */
export const SIZE_KB = 1024
export const SIZE_MB = SIZE_KB * 1024
export const SIZE_MB_2 = SIZE_MB * 2
export const SIZE_MB_4 = SIZE_MB * 4
export const SIZE_MB_5 = SIZE_MB * 5
export const SIZE_MB_6 = SIZE_MB * 6
export const SIZE_MB_8 = SIZE_MB * 8
export const SIZE_MB_10 = SIZE_MB * 10
export const SIZE_MB_16 = SIZE_MB * 16

/* Storage Keys */
export const UI_STATE = 'UI_STATE'

/* Time */
// A delay in milliseconds that is perceived to be instant to humans
export const TIME_DURATION_INSTANT = 200
export const ONE_MILLISECOND = 1
export const HALF_SECOND = 500
export const HALF_MINUTE = HALF_SECOND * 60
export const HALF_HOUR = HALF_MINUTE * 60
export const ONE_SECOND = 1000
export const ONE_MINUTE = ONE_SECOND * 60
export const ONE_HALF_SECONDS = 1500
export const ONE_HOUR = ONE_MINUTE * 60
export const ONE_DAY = ONE_HOUR * 24
export const ONE_WEEK = ONE_DAY * 7
export const ONE_MONTH = ONE_DAY * 30
export const ONE_YEAR = ONE_DAY * 365
export const TWO_SECONDS = ONE_SECOND * 2
export const TWO_MINUTES = ONE_MINUTE * 2
export const TWO_DAYS = ONE_DAY * 2
export const TWO_WEEKS = ONE_WEEK * 2
export const TWO_MONTHS = ONE_MONTH * 2
export const THREE_SECONDS = ONE_SECOND * 3
export const THREE_MINUTES = ONE_MINUTE * 3
export const FIVE_SECONDS = ONE_SECOND * 5
export const FIVE_MINUTES = ONE_MINUTE * 5
export const FIVE_HOURS = ONE_HOUR * 5
export const SEVEN_SECONDS = ONE_SECOND * 7
export const SEVEN_MINUTES = ONE_MINUTE * 7
export const TEN_SECONDS = ONE_SECOND * 10
export const TEN_MINUTES = ONE_MINUTE * 10
export const THIRTY_SECONDS = ONE_SECOND * 30
export const THIRTY_MINUTES = ONE_MINUTE * 30
export const FIFTEEN_MINUTES = ONE_MINUTE * 15
export const FORTY_SECONDS = ONE_SECOND * 40
export const HUNDRED_SECONDS = ONE_SECOND * 100
export const HUNDRED_MINUTES = ONE_MINUTE * 100

/* Mappings */
export const CRYPTO = {         // mapped for cryptoSign() and cryptoHash()
  HMAC_SHA256: 'sha256',
  HMAC_SHA384: 'sha384',
  HMAC_SHA512: 'sha512',
  MD5: 'md5',
}

/**
 * Language Definition
 * @see: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @note: sync with Google standard https://developers.google.com/maps/faq#languagesupport
 *    - Correct syntax for <html lang="zh-CN"> uses hyphen, including Google API,
 *    however, GraphQL name, database tables and many backends only accept undersacore.
 *    => Use _ for better compatibility between systems.
 */
export const LANGUAGE = {
  ENGLISH: {_: 'en', lang: 'English', 'en': 'English'},
  RUSSIAN: {_: 'ru', lang: 'Русский', 'en': 'Russian'},
  CHINESE: {_: 'zh_CN', lang: '中文 (中国)', 'en': 'Chinese (Simplified)'},
  CHINESE_HK: {_: 'zh_HK', lang: '中文 (香港)', 'en': 'Chinese (Hong Kong)'},
  CHINESE_TW: {_: 'zh_TW', lang: '中文 (台灣)', 'en': 'Chinese (Traditional)'},
  GERMAN: {_: 'de', lang: 'Deutsch', 'en': 'German'},
  SPANISH: {_: 'es', lang: 'Español', 'en': 'Spanish'},
  ITALIAN: {_: 'it', lang: 'Italiano', 'en': 'Italian'},
  PORTUGUESE: {_: 'pt', lang: 'Português', 'en': 'Portuguese'},
  DUTCH: {_: 'nl', lang: 'Nederlands', 'en': 'Dutch'},
  FRENCH: {_: 'fr', lang: 'Français', 'en': 'French'},
  SWEDISH: {_: 'sv', lang: 'Svenska', 'en': 'Swedish'},
  FINNISH: {_: 'fi', lang: 'Suomi', 'en': 'Finnish'},
  GREEK: {_: 'el', lang: 'Ελληνικά', 'en': 'Greek'},
  KOREAN: {_: 'ko', lang: '한국어', 'en': 'Korean'},
  JAPANESE: {_: 'ja', lang: '日本語', 'en': 'Japanese'},
  HEBREW: {_: 'he', lang: 'עִבְרִית', 'en': 'Hebrew'},
  PERSIAN: {_: 'fa', lang: 'فارسی', 'en': 'Persian'},
  YIDDISH: {_: 'yi', lang: 'ייִדיש', 'en': 'Yiddish'},
  ARABIC: {_: 'ar', lang: 'العَرَبِيَّة‎', 'en': 'Arabic'},
  AFRIKAANS: {_: 'af', lang: 'Afrikaans', 'en': 'Afrikaans'},
}

/**
 * Object mapping of language to their code
 */
export const l = {
  ...LANGUAGE, // enable IDE suggestion
}
for (const key in LANGUAGE) {
  l[key] = LANGUAGE[key]._
}

/**
 * Spoken Language Fluency Definition
 */
export const LANGUAGE_LEVEL = {
  UNKNOWN: {
    _: 0,
    [l.ENGLISH]: 'Unknown',
  },
  BASIC: {
    _: 1,
    [l.ENGLISH]: 'Beginner',
  },
  WORKING: {
    _: 2,
    [l.ENGLISH]: 'Working',
  },
  PROFICIENT: {
    _: 3,
    [l.ENGLISH]: 'Proficient',
  },
  FLUENT: {
    _: 4,
    [l.ENGLISH]: 'Fluent',
  },
  NATIVE: {
    _: 5,
    [l.ENGLISH]: 'Native',
  },
}

/* Mappings */
export const SORT_ORDER = {
  0: 'sort',
  1: 'asc',
  [-1]: 'desc',
}

/* Characters */
export const PLUS = '✛'
export const MINUS = '╍'
export const DOT = '•'
export const CROSS = '✕'
export const CROSSMARK = '❌'
export const CHECK = '✓'
export const CHECKBOX = '✅'
export const HEART = '♥'
export const HEART_EXCLAMATION = '❣'
export const CLOVER = '☘'
export const RECYCLE = '♻️'
export const SPARKLES = '✨'
export const THUNDER = '⚡'
export const FIREWORK = '💥'
export const FIRE = '🔥'
export const ROCKET = '🚀'
export const BLOCK = '🚷'
export const CHICKEN = '🐣'
export const SKULL = '☠'
export const SPHERE = '🔮'
export const UNICORN = '🦄'
export const ATOMS = '⚛️'
export const WARN = '✋'
export const WORKER = '👷'

/*
 * Special Characters Reference for Documentation Use
 * ┌───┬───────────────────────────────────────────────────────────────────────┐
 * │ 1 │     ╭ ─ ╮                                                             │
 * │   │     │ 5 │                                                             │
 * │ 2 │     ╰ ─ ╯                                                             │
 * ├───┼───────────────────────────────────────────────────────────────────────┤
 * │ 3 │                                                                       │
 * └───┴───────────────────────────────────────────────────────────────────────┘
 *     ├─┬─> A ⟶ B
 *     │ ├─> A ⟵ B
 *     │ └─> C ⟶ B
 *     │
 *     └─┬─> C ⟶ D
 *       └─> C ⟵ D
 *                               Time
 *                                │
 *    Start someFunctionName() -> ├───> Action A (start) ─────┐
 *                                ├───> Action B (start) ───────┐
 *                                │                           │ │
 *     Call someFunctionName() -> │╭ ──── Action A (end) ─────┘ │
 *     (dispatch new actions)     │╰ ─> Action C (start) ──────────┐
 *                                │                             │  │
 *                                │                             │  │
 *     Call someFunctionName() -> │╭ ── Action D <─ User Input  │  │
 *     (dispatch new actions)     │╰ ─> Action E (start) ─────────────┐
 *                                │                             │  │  │
 *                                │                             │  │  │
 *     Call someFunctionName() -> │  <─── Action B (end) ───────┘  │  │
 *   (no more actions, wait...)   │  <─── Action C (end) ──────────┘  │
 *                                │                                   │
 *      End someFunctionName() -> │  <─── Action E (end) ─────────────┘
 *                                │
*/
