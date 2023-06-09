import { isList, toList } from './array.js'
import { isMacLike, KEY, l, TIME_DURATION_INSTANT } from './constants.js'
import { isFunction } from './function.js'
import { swapKeyWithValue } from './object.js'
import { ips } from './string.js'
import { _, translate } from './translation.js'
import { subscribeTo, unsubscribeFrom } from './utility.js'

/**
 * KEYBOARD EVENTS TRACKER ----------------------------------------------------
 * Global KeyboardEvent observable instance to listen to key press events.
 * Keyboard Event listeners get activated upon import on client side,
 * but can be paused/reactivated at any time.
 *
 * @example:
 *    import keyboard from '@webframer/js/keyboard.js'
 *    keyboard.addShortcut(callback, [KEY.Ctrl, KEY.i], groupId?) // all keydown events
 *    keyboard.onTap.addShortcut(callback, KEY.i, groupId?) // keydown followed by keyup events
 *    keyboard.onHold.addShortcut(callback, KEY.ArrowUp, groupId?) // all keydown events
 *    keyboard.onRelease.addShortcut(callback, KEY.Alt, groupId?) // keyup event
 *    keyboard.unsubscribe() // pause Keyboard Event subscription
 *    keyboard.subscribe() // resume Keyboard Event subscription
 *    keyboard.pressed.Shift >>> true // if Shift key is currently pressed
 *    keyboard.pressedKeyCode[16] >>> true // if Shift key is currently pressed
 *    keyboard.pressedKeyCode[16] >>> undefined // if Shift key is released/not pressed
 *
 * -----------------------------------------------------------------------------
 */
class Keyboard {
  /**
   * Check if given keyCode is currently pressed
   * @example:
   *    keyboard.hasKeyPress(KEY.Space)
   *    >>> false
   *
   * @param {number} keyCode
   * @returns {boolean} true is it is pressed
   */
  hasKeyPress = (keyCode) => {
    return !!this.pressedKeyCode[keyCode]
  }

  // Map of Event.code as `key` and boolean true/undefined as value for currently pressed keys
  pressed = KEY // assigned KEY is purely for IDE intellisense, this gets reset to `{}`

  // Map of Event.keyCode as `key` and boolean true/undefined as value for currently pressed keys
  pressedKeyCode = {}

  // Keyboard Event sources to ignore
  ignoreEventsFrom = {
    'input': true,
    'textarea': true,
  }

  // @archive: Map of Event.code string as `key` and boolean as value that should not clear after shortcut fires
  // pressedKeyToKeepAfterShortcut = {
  //   Ctrl: true,
  //   Alt: true, AltLeft: true, AltRight: true,
  //   Control: true, ControlLeft: true, ControlRight: true,
  //   Meta: true, MetaLeft: true, MetaRight: true,
  //   Shift: true, ShiftLeft: true, ShiftRight: true,
  // }

  // Map of Ctrl keyCode conversions from Windows/macOS to a consistent internal KEY.Ctrl
  _ctrlKeyCode = isMacLike
    ? {
      [KEY.MetaLeft]: KEY.Ctrl,
      [KEY.MetaRight]: KEY.Ctrl,
    } : {
      [KEY.Control]: KEY.Ctrl,
    }

  // Map of Event.keyCode as `key` and Event.code/key as `value`
  _keyByCode = swapKeyWithValue(KEY)

  // Shortcut keyCodes array as `key` and {id, callback} as `value`
  _shortcuts = {}

  /**
   * Add Keyboard Observable for key press(es).
   * To prevent duplicate error when using the same shortcut key(s), assign a unique id.
   *
   * @example:
   *    class PenTool extend PureComponent {
   *      setup = () => keyboard.addShortcut(this.enable, [KEY.Ctrl, KEY.p], 'PenTool')
   *      remove = () => keyboard.removeShortcut(this.enable)
   *    }
   * @param {function} callback - will get `KeyboardEvent` as argument
   * @param {number|number[]} keyCodes - KeyboardEvent.keyCode/s
   * @param {string|number} [id] - unique group id to remove all shortcuts on unmount
   * @returns {function} callback - to be used for removing the shortcut
   */
  addShortcut = (callback, keyCodes, id) => {
    const keys = [...toList(keyCodes)].sort().join()
    const keysId = `${keys}_${id}`

    // Check for duplicates
    if (this._shortcuts[keysId]) {
      const {id, callback} = this._shortcuts[keysId]
      const value = toList(keyCodes).map(keyCode => this._keyByCode[keyCode]).join(' + ')
      throw new Error(
        ips(_.KEYBOARD_SHORTCUT___value___IS_TAKEN_BY_COMPONENT__id_, {value, id: id || callback}),
      )
    }

    // Add shortcut when no duplicates found
    this._shortcuts[keysId] = {callback, keys, id}
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
    for (const keysId in this._shortcuts) {
      if (callback === this._shortcuts[keysId].callback) delete this._shortcuts[keysId]
    }
  }

  /**
   * @param {number} keyCodes
   */
  removeShortcutByKeyCodes = (...keyCodes) => {
    const keys = keyCodes.sort().join()
    for (const keysId in this._shortcuts) {
      if (keys === this._shortcuts[keysId].keys) delete this._shortcuts[keysId]
    }
  }

  /**
   * @param {string|number} id
   */
  removeShortcutById = (id) => {
    for (const keysId in this._shortcuts) {
      if (id === this._shortcuts[keysId].id) delete this._shortcuts[keysId]
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
    subscribeTo('keydown', this._onPress)
    subscribeTo('keyup', this._onRelease)
  }

  // Unsubscribe from Keyboard Events
  unsubscribe = () => {
    unsubscribeFrom('keydown', this._onPress)
    unsubscribeFrom('keyup', this._onRelease)
  }

  _onPress = (event) => {
    if (this.ignoreEventsFrom[event.target.localName]) return
    // Unify inconsistent behavior from OSes, by converting 'Control' and 'Meta' keys to KEY.Ctrl
    const keyCode = this._ctrlKeyCode[event.keyCode] || event.keyCode
    this.pressed[this._keyByCode[keyCode]] = this.pressedKeyCode[keyCode] = true
    const keyCodes = Object.keys(this.pressedKeyCode).sort().join()

    const callbacks = []
    for (const keysId in this._shortcuts) {
      const {keys, callback} = this._shortcuts[keysId]
      if (keys === keyCodes) callbacks.push(callback)
    }
    if (callbacks.length) {
      // Note: if shortcut commands call native browser alert(),
      // all code after the shortcut callback will freeze and only resume when the alert is closed.
      // Browser alert() also prevents all subsequent `keyup` events from being fired,
      // so we need to clear all keys when such thing happens (ie. code freeze),
      // while also support repeated commands, such as paste.
      const now = Date.now()
      callbacks.forEach(callback => callback.call(this, event))
      // event.preventDefault() // let implementation decide what to do with the event
      if (Date.now() - now > TIME_DURATION_INSTANT) {
        this.pressed = {}
        this.pressedKeyCode = {}
      }

      // @archive: below approach did not work, because Meta keys persist without ever getting keyup
      //           causing other single key presses, like `Escape`, to never match with shortcuts
      // // `keyup` events do not fire when alert pops up,
      // // so manually clear all non-meta keys once a shortcut is fired,
      // // because it's not possible to prevent event default after firing shortcuts on `keyup`,
      // // since browsers fire their own shortcuts on `keydown`.
      // // Do not clear meta keys, like Ctrl, to allow repeated commands, like pasting.
      // // see https://stackoverflow.com/questions/13593270/keyup-not-firing-when-keydown-opens-an-alert
      // for (const code in this.pressed) {
      //   if (this.pressedKeyToKeepAfterShortcut[code]) continue
      //   delete this.pressed[code]
      // }
      // for (const keyCode in this.pressedKeyCode) {
      //   if (this.pressedKeyToKeepAfterShortcut[this._keyByCode[keyCode]]) continue
      //   delete this.pressedKeyCode[keyCode]
      // }
    }
  }

  _onRelease = (event) => {
    if (this.ignoreEventsFrom[event.target.localName]) return
    /**
     * In Mac browsers, `keyup` event does not fire when `Meta` (Cmd) is held - this is OS level bug.
     * => When Meta key is released on macOS, clear all pressed keys.
     * This also means that user can not press Cmd + C, then Cmd + V while still holding Cmd,
     * because C keyup does not fire in between key presses.
     * => There is no fix for this behavior, because users may want to hold C, so we cannot clear it
     * after matching a shortcut on keydown.
     */
    if (event.key === 'Meta' && isMacLike) {
      this.pressed = {}
      this.pressedKeyCode = {}
    } else {
      // delete to improve performance for _onPress
      const keyCode = this._ctrlKeyCode[event.keyCode] || event.keyCode
      delete this.pressed[this._keyByCode[keyCode]]
      delete this.pressedKeyCode[keyCode]
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

translate({
  KEYBOARD_SHORTCUT___value___IS_TAKEN_BY_COMPONENT__id_: {
    [l.ENGLISH]: 'Keyboard.shortcut ({value}) is taken by component {id}',
  },
})
