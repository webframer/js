import { KEY, l } from './constants.js'
import { isFunction } from './function.js'
import { ips } from './string.js'
import { _, translate } from './translation.js'
import { subscribeTo, unsubscribeFrom } from './utility'

/**
 * POINTER EVENTS TRACKER ------------------------------------------------------
 * Global PointerEvent observable instance for mouse, pen and touch events.
 *
 * @example:
 *    import pointer from '@webframer/js/pointer.js'
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

  // Drag element node as `key` and {id, onDrag, onDragStart, onDragEnd, ...} as `value`
  _dragNodes = new Map()

  /**
   * Add Pointer Observable for node element
   * @example:
   *    class PenTool extend PureComponent {
   *      setup = () => pointer.addDrag({onDrag: this.enable}, this.containerElement, 'PenTool')
   *      remove = () => pointer.removeDrag(this.containerElement)
   *    }
   * @param {{
   *    onDrag?: function,
   *    onDragStart?: function,
   *    onDragEnd?: function,
   *    onDragDown?: function,
   *    onDragUp?: function,
   *  }} event handlers - will get `PointerEvent` as argument
   * @param {Element} node - element to listen for pointer events
   * @param {string|number} [id] - group id to remove all drags on unmount
   * @returns {Element} node - to be used for removing the drag
   */
  addDragBehavior = ({onDrag, onDragStart, onDragEnd, onDragDown, onDragUp}, node, id) => {

    // Check for duplicates
    if (this._dragNodes.get(node)) {
      const {id, onDrag, onDragStart, onDragEnd} = this._dragNodes.get(node)
      throw new Error(
        ips(_.POINTER_DRAG_OF___node___IS_TAKEN_BY__id_, {
          node, id: id || onDrag || onDragStart || onDragEnd,
        }),
      )
    }

    // Add drag when no duplicates found
    this._dragNodes.set(node, {id, onDrag, onDragStart, onDragEnd, onDragDown, onDragUp})
    return node
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
   * @param {function|Element|string|number} callbackOrNodeOrId
   */
  removeDragBehavior = (callbackOrNodeOrId) => {
    // Remove all drags for a particular function
    if (isFunction(callbackOrNodeOrId)) {
      this.removeDragByCallback(callbackOrNodeOrId)
    } else if (typeof callbackOrNodeOrId === 'object') {
      this.removeDragByNode(callbackOrNodeOrId)
    } else {
      this.removeDragById(callbackOrNodeOrId)
    }
  }

  /**
   * @param {function} callback
   */
  removeDragByCallback = (callback) => {
    for (const [node, {onDrag, onDragStart, onDragEnd}] of this._dragNodes) {
      if (callback === onDrag || callback === onDragStart || callback === onDragEnd)
        this._dragNodes.delete(node)
    }
  }

  /**
   * @param {Element} node
   */
  removeDragByNode = (node) => {
    this._dragNodes.delete(node)
  }

  /**
   * @param {string|number} id
   */
  removeDragById = (id) => {
    for (const [node, value] of this._dragNodes) {
      if (id === value.id) this._dragNodes.delete(node)
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
    subscribeTo('pointerdown', this._onPointerDown)
    subscribeTo('pointerup', this._onPointerUp)
  }

  // Unsubscribe from Pointer Events
  unsubscribe = () => {
    unsubscribeFrom('pointerdown', this._onPointerDown)
    unsubscribeFrom('pointerup', this._onPointerUp)
  }

  subscribeToMove = () => {
    subscribeTo('pointermove', this._onPointerMove)
  }

  unsubscribeFromMove = () => {
    unsubscribeFrom('pointermove', this._onPointerMove)
  }

  // event.button === 0 (for left mouse)
  _onPointerDown = (event) => {
    if (event.button !== KEY.LEFT_CLICK) return
    if (this.ignoreEventsFrom[event.target.localName]) return
    let node = event.target, handlers
    // Traverse up the DOM tree, until a container node found for registered drag events
    while (node.parentElement) {
      if ((handlers = this._dragNodes.get(node))) {
        // Event must have preventDefault to work in Firefox, otherwise it selects surrounding text
        // event.preventDefault() // unfortunately, this also disables focus when clicking elements,
        // and makes Expandable hook collapse element immediately in Chrome.
        // => pass down custom event behavior as a custom callback option per registered node.
        if (handlers.onDragDown) handlers.onDragDown.call(this, event)

        // Only register the event, without firing onDragStart, until dragging actually begins.
        // This avoids false positive for tap events
        this.pointerDownEvent = event
        this.pointerMoveCount = 0
        this.subscribeToMove()
        this.subscribedNode = node
        break
      }
      node = node.parentElement
    }
  }

  // To avoid firing drag events on accidental click, skip the first move event
  // event.button === -1 (for left mouse)
  _onPointerMove = (event) => {
    event.preventDefault()
    if (!this.pointerMoveCount) {
      this.pointerMoveCount = 1
      return
    }

    const {onDragStart, onDrag} = this._dragNodes.get(this.subscribedNode)

    // Call onDragStart first, if defined
    if (this.pointerDownEvent) {
      if (onDragStart) onDragStart(this.pointerDownEvent)
      this.pointerDownEvent = null
      this.hadDrag = true
    }

    // Then fire onDrag events
    if (onDrag) onDrag(event)
  }

  // event.button === 0 (for left mouse)
  _onPointerUp = (event) => {
    if (this.subscribedNode) {
      const {onDragEnd, onDragUp} = this._dragNodes.get(this.subscribedNode)
      this.unsubscribeFromMove()
      this.subscribedNode = null
      if (this.hadDrag) {
        this.hadDrag = null
        if (onDragEnd) onDragEnd(event)
      }
      if (onDragUp) onDragUp.call(this, event) // usually call event.preventDefault()
    }
  }
}

export default new Pointer()

translate({
  POINTER_DRAG_OF___node___IS_TAKEN_BY__id_: {
    [l.ENGLISH]: 'Pointer.drag of ({node}) is taken by {id}',
  },
})
