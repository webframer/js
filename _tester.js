// TEMPORARY TEST FILE =============================================================================
/**
 * @param {string} s
 * @return {string}
 */
export default function _tester (s) {
  return s
}

// HELPERS -----------------------------------------------------------------------------------------

// Often used in leetcode.com tests
function ListNode (val, next) {
  this.val = (val === undefined ? 0 : val)
  this.next = (next === undefined ? null : next)
}

/**
 * Construct a ListNode instance from array of numbers
 * @param {number[]} array
 * @param {boolean} [reverse] - whether to reverse the order of numbers
 * @returns {ListNode} listNode
 */
function createListNode (array, reverse = false) {
  let r, next
  if (!reverse) array.reverse()
  for (const n of array) {
    r = next = new ListNode(n, next)
  }
  return r
}

/**
 * Get ListNode values as array of numbers
 * @param {ListNode} listNode
 * @returns {number[]} array of numbers
 */
function getListNodeArray (listNode) {
  if (listNode.val == null) return []
  let r = [listNode.val]
  let list = listNode
  while (list.next) {
    r.push(list.next.val)
    list.next = list.next.next
  }
  return r
}
