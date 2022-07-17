import { isList, toList } from './array.js'
import { isMacLike, KEY, l } from './constants.js'
import { localiseTranslation } from './definitions.js'
import { isFunction } from './function.js'
import { swapKeyWithValue } from './object.js'
import { ips } from './string.js'
import { _ } from './translations.js'
import { subscribeTo, unsubscribeFrom } from './utility'

/**
 * KEYBOARD EVENTS TRACKER ----------------------------------------------------
 * Global KeyboardEvent observable instance to listen to key press events.
 * Keyboard Event listeners get activated upon import on client side,
 * but can be paused/reactivated at any time.
 *
 * @example:
 *    import keyboard from '@webframer/utils/keyboard.js'
 *    keyboard.addShortcut(callback, [KEY.Ctrl, KEY.i], groupId?) // all keydown events
 *    keyboard.onTap.addShortcut(callback, KEY.i, groupId?) // keydown followed by keyup events
 *    keyboard.onHold.addShortcut(callback, KEY.ArrowUp, groupId?) // all keydown events
 *    keyboard.onRelease.addShortcut(callback, KEY.Alt, groupId?) // keyup event
 *    keyboard.unsubscribe() // pause Keyboard Event subscription
 *    keyboard.subscribe() // resume Keyboard Event subscription
 *    keyboard.pressed.Shift >>> true // if Shift key is currently pressed
 *    keyboard.keyCode[16] >>> true // if Shift key is currently pressed
 *    keyboard.keyCode[16] >>> undefined // if Shift key is released/not pressed
 *
 * -----------------------------------------------------------------------------
 */
class Keyboard {
  // Map of KEY.code as `key` and boolean true/undefined as value for currently pressed keys
  pressed = KEY // assigned KEY is purely for IDE intellisense, this gets reset to `{}`

  // Map of KEY's keyCode as `key` and boolean true/undefined as value for currently pressed keys
  keyCode = {}

  // Keyboard Event sources to ignore
  ignoreEventsFrom = {
    'input': true,
    'textarea': true,
  }

  // Map of Ctrl keyCode conversions from Windows/macOS to a consistent internal KEY.Ctrl
  #ctrlKeyCode = isMacLike
    ? {
      [KEY.MetaLeft]: KEY.Ctrl,
      [KEY.MetaRight]: KEY.Ctrl,
    } : {
      [KEY.Control]: KEY.Ctrl,
    }

  // Map of Event.keyCode as `key` and Event.code/key as `value`
  #keyByCode = swapKeyWithValue(KEY)

  // Shortcut keyCodes array as `key` and {id, callback} as `value`
  #shortcuts = {}

  /**
   * Add Keyboard Observable for key press/es
   * @example:
   *    class PenTool extend PureComponent {
   *      setup = () => keyboard.addShortcut(this.enable, [KEY.Ctrl, KEY.p], 'PenTool')
   *      remove = () => keyboard.removeShortcut(this.enable)
   *    }
   * @param {function} callback - will get `KeyboardEvent` as argument
   * @param {number|number[]} keyCodes - KeyboardEvent.keyCode/s
   * @param {string|number} [id] - group id to remove all shortcuts on unmount
   * @returns {function} callback - to be used for removing the shortcut
   */
  addShortcut = (callback, keyCodes, id) => {
    const _keyCodes = toList(keyCodes).sort().join()

    // Check for duplicates
    if (this.#shortcuts[_keyCodes]) {
      const {id, callback} = this.#shortcuts[_keyCodes]
      const value = keyCodes.map(keyCode => this.#keyByCode[keyCode]).join(' + ')
      throw new Error(
        ips(_.KEYBOARD_SHORTCUT___value___IS_TAKEN_BY_COMPONENT__id_, {value, id: id || callback}),
      )
    }

    // Add shortcut when no duplicates found
    this.#shortcuts[_keyCodes] = {callback, id}
    return callback
  }

  /**
   * Remove Keyboard Observable for all shortcuts by `callback`, group `id` or `keyCodes`
   * @example:
   *    // Initial setup
   *    const observable = keyboard.addShortcut(this.enable, KEY.p, 'PenTool')
   *    // Remove all shortcuts by callback
   *    keyboard.removeShortcut(observable)
   *    // Same as above
   *    keyboard.removeShortcut(this.enable)
   *    // Remove all shortcuts by keyCodes
   *    keyboard.removeShortcut([KEY.p])
   *    // Remove all shortcuts by group id
   *    keyboard.removeShortcut('PenTool')
   *
   * @param {function|number[]|string|number} callbackOrKeyCodesOrId
   */
  removeShortcut = (callbackOrKeyCodesOrId) => {
    // Remove all shortcuts for a particular function
    if (isFunction(callbackOrKeyCodesOrId)) {
      this.removeShortcutByCallback(callbackOrKeyCodesOrId)
    } else if (isList(callbackOrKeyCodesOrId)) {
      this.removeShortcutByKeyCodes(...callbackOrKeyCodesOrId)
    } else {
      this.removeShortcutById(callbackOrKeyCodesOrId)
    }
  }

  /**
   * @param {function} callback
   */
  removeShortcutByCallback = (callback) => {
    for (const keyCodes in this.#shortcuts) {
      if (callback === this.#shortcuts[keyCodes].callback) delete this.#shortcuts[keyCodes]
    }
  }

  /**
   * @param {number} keyCodes
   */
  removeShortcutByKeyCodes = (...keyCodes) => {
    const _keyCodes = keyCodes.sort().join()
    delete this.#shortcuts[_keyCodes]
  }

  /**
   * @param {string|number} id
   */
  removeShortcutById = (id) => {
    for (const keyCodes in this.#shortcuts) {
      if (id === this.#shortcuts[keyCodes].id) delete this.#shortcuts[keyCodes]
    }
  }

  constructor ({ignoreEventsFrom} = {}) {
    this.pressed = {} // reset default, which was only used for IDE intellisense
    if (typeof window === 'undefined') return this
    if (ignoreEventsFrom) this.ignoreEventsFrom = ignoreEventsFrom
    this.subscribe()
    return this
  }

  onTap = {
    addShortcut: this.addShortcut, // todo
    removeShortcut: this.removeShortcut, // todo
  }
  onHold = {
    addShortcut: this.addShortcut,
    removeShortcut: this.removeShortcut,
  }
  onRelease = {
    addShortcut: this.addShortcut, // todo
    removeShortcut: this.removeShortcut, // todo
  }

  // Subscribe to Keyboard Events
  subscribe = () => {
    subscribeTo('keydown', this.#onPress)
    subscribeTo('keyup', this.#onRelease)
  }

  // Unsubscribe from Keyboard Events
  unsubscribe = () => {
    unsubscribeFrom('keydown', this.#onPress)
    unsubscribeFrom('keyup', this.#onRelease)
  }

  #onPress = (event) => {
    if (this.ignoreEventsFrom[event.target.localName]) return
    // Unify inconsistent behavior from OSes, by converting 'Control' and 'Meta' keys to KEY.Ctrl
    const keyCode = this.#ctrlKeyCode[event.keyCode] || event.keyCode
    this.pressed[this.#keyByCode[keyCode]] = this.keyCode[keyCode] = true
    const keyCodes = Object.keys(this.keyCode).sort().join()
    if (this.#shortcuts[keyCodes]) this.#shortcuts[keyCodes].callback(event)
  }

  #onRelease = (event) => {
    /**
     * In Mac browsers, `keyup` event does not fire when `Meta` (Cmd) is held - this is OS level bug.
     * => When Meta key is released on macOS, clear all pressed keys.
     */
    if (event.key === 'Meta' && isMacLike) {
      this.pressed = {}
      this.keyCode = {}
    } else {
      // delete to improve performance for #onPress
      const keyCode = this.#ctrlKeyCode[event.keyCode] || event.keyCode
      delete this.pressed[this.#keyByCode[keyCode]]
      delete this.keyCode[keyCode]
    }
  }
}

export default new Keyboard()

/**
 * Check whether pressed KeyboardEvent matches given `keyCode` and has Ctrl/Cmd modifier key pressed
 * @param {KeyboardEvent} event
 * @param {number} keyCode
 * @returns {boolean} true - if everything matches
 */
export function isCtrlKeyPress (event, keyCode) {
  return (event.ctrlKey || event.metaKey) && event.keyCode === keyCode
}

/**
 * Check whether pressed KeyboardEvent is without key modifiers, such as: Ctrl, Alt, Shift
 * @param {KeyboardEvent} event
 * @returns {boolean} true - if no modifier keys pressed
 */
export function isPureKeyPress (event) {
  return !(event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
}

localiseTranslation({
  KEYBOARD_SHORTCUT___value___IS_TAKEN_BY_COMPONENT__id_: {
    [l.ENGLISH]: 'Keyboard.shortcut ({value}) is taken by component {id}',
  },
})
