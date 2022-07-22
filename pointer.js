import { l } from './constants.js'
import { localiseTranslation } from './definitions.js'
import { isFunction } from './function.js'
import { ips } from './string.js'
import { _ } from './translations.js'
import { subscribeTo, unsubscribeFrom } from './utility'

/**
 * POINTER EVENTS TRACKER ------------------------------------------------------
 * Global PointerEvent observable instance for mouse, pen and touch events.
 *
 * @example:
 *    import pointer from '@webframer/utils/pointer.js'
 *    pointer.addDragBehavior( // attach drag behavior to targetNode
 *      {onDrag, onDragStart, onDragEnd}, targetNode, groupId?
 *    )
 *    pointer.removeDragBehavior(callbackOrNodeOrId)
 *    pointer.unsubscribe() // pause Pointer Event subscription
 *    pointer.subscribe() // resume Pointer Event subscription
 *
 * -----------------------------------------------------------------------------
 */
class Pointer {
  // Pointer Event sources to ignore
  ignoreEventsFrom = {
    'html': true,
    'body': true,
  }

  // Drag element node as `key` and {id, callback} as `value`
  #dragNodes = new Map()

  /**
   * Add Pointer Observable for node element
   * @example:
   *    class PenTool extend PureComponent {
   *      setup = () => pointer.addDrag(this.enable, this.containerElement, 'PenTool')
   *      remove = () => pointer.removeDrag(this.enable)
   *    }
   * @param {function} callback - will get `PointerEvent` as argument
   * @param {object|HTMLElement} node - element to listen for pointer events
   * @param {string|number} [id] - group id to remove all drags on unmount
   * @returns {function} callback - to be used for removing the drag
   */
  addDragBehavior = (callback, node, id) => {

    // Check for duplicates
    if (this.#dragNodes[node]) {
      const {id, callback} = this.#dragNodes[node]
      throw new Error(
        ips(_.POINTER_DRAG_OF___node___IS_TAKEN_BY__id_, {node, id: id || callback}),
      )
    }

    // Add drag when no duplicates found
    this.#dragNodes[node] = {callback, id}
    return callback
  }

  /**
   * Remove Pointer Observable for all drags by `callback` or group `id` or `element`
   * @example:
   *    // Initial setup
   *    const observable = pointer.addDrag(this.enable, KEY.p, 'PenTool')
   *    // Remove all drags by callback
   *    pointer.removeDrag(observable)
   *    // Same as above
   *    pointer.removeDrag(this.enable)
   *    // Remove all drags by group id
   *    pointer.removeDrag('PenTool')
   *    // Remove all drags by keyCodes
   *    pointer.removeDrag([KEY.p])
   *
   * @param {function|string|number|object|HTMLElement} callbackOrIdOrNode
   */
  removeDrag = (callbackOrIdOrNode) => {
    // Remove all drags for a particular function
    if (isFunction(callbackOrIdOrNode)) {
      this.removeDragByCallback(callbackOrIdOrNode)
    } else if (typeof callbackOrIdOrNode === 'object') {
      this.removeDragByNode(callbackOrIdOrNode)
    } else {
      this.removeDragById(callbackOrIdOrNode)
    }
  }

  /**
   * @param {function} callback
   */
  removeDragByCallback = (callback) => {
    for (const node in this.#dragNodes) {
      if (callback === this.#dragNodes[node].callback) delete this.#dragNodes[node]
    }
  }

  /**
   * @param {object|HTMLElement} node
   */
  removeDragByNode = (node) => {
    delete this.#dragNodes[node]
  }

  /**
   * @param {string|number}id
   */
  removeDragById = (id) => {
    for (const node in this.#dragNodes) {
      if (id === this.#dragNodes[node].id) delete this.#dragNodes[node]
    }
  }

  constructor ({ignoreEventsFrom} = {}) {
    if (typeof window === 'undefined') return this
    if (ignoreEventsFrom) this.ignoreEventsFrom = ignoreEventsFrom
    this.subscribe()
    return this
  }

  // Subscribe to Pointer Events
  subscribe = () => {
    subscribeTo('pointerdown', this.#onPointerDown)
    subscribeTo('pointerup', this.#onPointerUp)
  }

  // Unsubscribe from Pointer Events
  unsubscribe = () => {
    unsubscribeFrom('pointerdown', this.#onPointerDown)
    unsubscribeFrom('pointerup', this.#onPointerUp)
  }

  #onPointerDown = (event) => {
    if (this.ignoreEventsFrom[event.target.localName]) return
    let node = event.target
    // Traverse up the DOM tree, until a container node found for registered drag events
    while (node.parentElement) {
      console.warn('--->', node)
      if (this.#dragNodes[node]) {
        this.#dragNodes[node].callback(event)
        break
      }
      node = node.parentElement
    }
  }

  #onPointerUp = (event) => {
    if (this.ignoreEventsFrom[event.target.localName]) return

  }
}

export default new Pointer()

/**
 * Check whether pressed PointerEvent matches given `keyCode` and has Ctrl/Cmd modifier key pressed
 * @param {PointerEvent} event
 * @param {number} keyCode
 * @returns {boolean} true - if everything matches
 */
export function isCtrlKeyPress (event, keyCode) {
  return (event.ctrlKey || event.metaKey) && event.keyCode === keyCode
}

/**
 * Check whether pressed PointerEvent is without key modifiers, such as: Ctrl, Alt, Shift
 * @param {PointerEvent} event
 * @returns {boolean} true - if no modifier keys pressed
 */
export function isPureKeyPress (event) {
  return !(event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
}

localiseTranslation({
  POINTER_DRAG_OF___node___IS_TAKEN_BY__id_: {
    [l.ENGLISH]: 'Pointer.drag of ({node}) is taken by {id}',
  },
})
