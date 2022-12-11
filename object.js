import flatten from 'flat'
import {
  clone,
  cloneDeep,
  get,
  isEmpty,
  isEqual,
  isMap,
  isNil,
  isObjectLike,
  isPlainObject,
  matches,
  merge as _merge,
  omitBy,
  property,
  setWith as set,
  unset,
} from 'lodash-es'
import qs from 'querystring'
import { hasListValue, isCollection, isList, sortDescending } from './array.js'

/**
 * OBJECT FUNCTIONS ============================================================
 * =============================================================================
 */

/**
 * Get The List of Class Instance Method Names
 * @param {Class} Class - to get methods names from
 * @returns {String[]} list - of all instance methods, including async (but excludes properties, and static methods)
 */
export function classInstanceMethodNames (Class) {
  const [_, ...methodNames] = Object.getOwnPropertyNames(Class.prototype)
  return methodNames
}

/**
 * Clone Object/Collection/Class
 */
export function cloneFast (obj) {
  return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj)
}

/**
 * Extract Object keys starting with `#` (or `prefix` character) into a new object by mutation
 * @example:
 *    const props = {'#tag': 'Row', _id: 'Id'}
 *    const privateObj = extractPrivateProps(props)
 *    >>> privateObj == {'tag': 'Row'}
 *    >>> props == {_id: 'Id'}
 *
 * @param {object|array} obj - object with mixed of private and standard properties
 * @param {string} [prefix] - private property prefix
 * @returns {object} privateProps - with `#` (or `prefix` character) removed from keys
 */
export function extractPrivateProps (obj, prefix = '#') {
  if (isList(obj)) return obj
  const result = {}
  for (const key in obj) {
    if (key.indexOf(prefix) === 0) {
      result[key.replace(prefix, '')] = obj[key]
      delete obj[key]
    }
  }
  return result
}

/**
 * Delete Nested Property of an Object by given Key Path
 * @param {Object} obj - to delete property from
 * @param {String|*} path - key path to nested property for deletion
 * @returns {Boolean} return value of the `delete` keyword
 */
export function deleteProp (obj, path) {
  if (!obj || !path) return false
  if (typeof path === 'string') path = path.split('.')
  for (let i = 0; i < path.length - 1; i++) {
    obj = obj[path[i]]
    if (typeof obj === 'undefined') return false
  }
  return delete obj[path.pop()]
}

/**
 * Check if value provided is an Object with at least one attribute
 *
 * @param {*} obj - value to check
 * @returns {boolean} - true if value is an Object with value
 */
export function hasObjectValue (obj) {
  return isObject(obj) && Object.keys(obj).length > 0
}

/**
 * Checks if value is the language type of Object
 *
 * @uses lodash
 * @see https://lodash.com/docs/4.17.21#isPlainObject
 *
 * @param {*} value - any value to check
 * @return {boolean}
 */
export function isObject (value) {
  return isPlainObject(value)
}

/**
 * List the keys and values of an object for iteration.
 * @Note: use for convenience only because it takes 0.5 microseconds per loop, which is:
 *    - x2-3 times longer than looping with `for (const key in obj) {...}` (0.2 microseconds),
 *    - x4-5 times longer than `forEach` or `for i++` loop using array (0.1 microseconds).
 *    => For performance, best to store list as array.
 *
 * @uses generator
 * @uses lodash
 * @see https://lodash.com/docs/#isObjectLike
 *
 * @example:
 for (const [key, value] of listProps(obj)) {
   console.log(key, value);
 }
 *
 * @param {Object} obj - the object to list
 * @return {Object} generator's yielded value
 */
export function * listProps (obj) {
  if (!isObjectLike(obj)) {
    return []
  }

  for (const key of Object.keys(obj)) {
    yield [key, obj[key]]
  }
}

/**
 * Creates a new object that merges properties from all given objects. Properties from the right take precedence
 * over properties on the left
 * @Note: use update() for faster performance of x5 times (without cloneDeep) and x3 times (with cloneDeep)
 *
 * @param {Array|Object} objects - Objects to merge
 * @return {Object} - A new object
 */
export function merge (...objects) {
  return _merge({}, ...objects)
}

/**
 * Compare Original Object vs. Changed Object and keep only changed values
 * @note: deleted props will output as `null` value
 *
 * @param {Object|Undefined|Null} original - to compare against
 * @param {Object|Undefined|Null} changed - object to keep changes
 * @param {Object} [options] - ignoreDeleted?: boolean - whether to disable `null` for deleted props
 * @returns {Object|Undefined|Null} changedOnly - new object with only changed values kept, or undefined if no changes
 */
export function objChanges (original, changed, {ignoreDeleted} = {}) {
  // clone so we can delete keys while iterating
  original = {...original}
  changed = {...changed}
  for (const field in changed) {
    if (isEqual(original[field], changed[field])) {
      delete changed[field]
    } else {
      // Recursively check for nested field changes
      if (hasObjectValue(original[field]) && hasObjectValue(changed[field]))
        changed[field] = objChanges(original[field], changed[field])
    }
    delete original[field]
  }
  if (!ignoreDeleted) {
    for (const deleted in original) {
      changed[deleted] = null
    }
  }
  return isEmpty(changed) ? undefined : changed
}

/**
 * Set Object to be given Payload recursively, by Mutation
 *
 * @example:
 reset({user: {name: 'Chris'}}, {user: {sign: 'scorpion'}})
 >>> {user: {sign: 'scorpion'}}
 *
 * @param {Object|Array} collection - collection to be reset
 * @param {Object} payload - the nested Object to update with
 * @return {Object|Array} - mutated collection that has properties of payload
 */
export function reset (collection, payload) {
  for (const key in payload) {
    const value = payload[key]
    if (isObject(value)) {
      collection[key] = collection[key] ? reset(collection[key], value) : value
    } else {
      collection[key] = value
    }
  }

  for (const key in collection) {
    if (!payload[key]) delete collection[key]
  }

  return collection
}

/**
 * Update Collection with nested props (Array/Object), keeping other attributes in the Collection.
 *
 * @example:
 *    update({user: {name: 'Chris'}}, {user: {sign: 'scorpion'}})
 *    >>> {user: {name: 'Chris', sign: 'scorpion'}}
 *
 * @param {Object|Array} state - collection to be updated
 * @param {Object|Array} payload - the nested props to update with, can be empty (ie. no updates)
 * @param {{clone?: boolean, removeNull?: boolean, arrayHoles?: boolean}} [options]
 *    [clone] - whether to return new Object instead of mutating it
 *    [removeNull] - whether to remove `null` props instead of updating them as `null`
 *    [arrayHoles] - whether to allow holes in array after update
 * @return {Object|Array} - mutated/cloned Object with nested update
 */
export function update (state, payload, {clone = false, removeNull = false, arrayHoles = false} = {}) {
  if (clone) state = cloneDeep(state)

  // Array with empty elements do not have `key` defined, so this will skip it
  let indicesToDelete = [], changed, value
  for (const key in payload) {
    value = payload[key]
    if (value === null && removeNull) {
      if (isList(state)) indicesToDelete.unshift(+key) // array deletion must be reversed
      else delete state[key]
    } else if (
      isCollection(value) &&
      isCollection(state[key]) &&
      value.Constructor === state[key].Constructor &&
      !isEmpty(value) // simply override if nested object or array is empty
    ) { // must be the same data type to update recursively,
      state[key] = update(state[key], value, {removeNull, arrayHoles})
    } else { // else override
      // Sanitize newly added array
      if (!arrayHoles && hasListValue(value) && value.length !== Object.values(value).length)
        value = Object.values(value)
      state[key] = value
    }
    changed = true
  }

  // Remove elements from array, starting from the end
  if (indicesToDelete.length) { // sort to ensure correct order, because payload can be an object
    indicesToDelete.sort(sortDescending) // default native sort does not work with numbers
    for (const index of indicesToDelete) if (!Number.isNaN(index)) state.splice(index, 1)
  }

  // Remove array holes
  if (changed && !arrayHoles && hasListValue(state) && state.length !== Object.values(state).length) {
    changed = Object.values(state)
    changed.forEach((v, i) => state[i] = v)
    state.length = changed.length
  }

  // if the top level `payload` is empty, return the original state without modification,
  // because this function is for updating nested props, not resetting, or Object.assign.
  return state
}

/**
 * Check Recursively for Matching Object within Nested Object or Collection.
 *
 * @example:
 *   hasObjMatch([[[1, -1], [2, -2]]], [1, -1]);
 *   >>> true
 *
 * @param {*} obj - the collection to search for matching object
 * @param {*} searchObj - the matching object to find
 * @returns {boolean} - true if a match found.
 */
export function hasObjMatch (obj, searchObj) {
  for (const key in obj) {
    if (!{}.hasOwnProperty.call(obj, key)) return
    const value = obj[key]

    if (matches(searchObj)(value)) {
      return true
    } else if (isObjectLike(value)) {
      const nestedMatch = hasObjMatch(value, searchObj)
      if (nestedMatch) return true
    }
  }

  return false
}

/**
 * Check if an Object has Provided Key Paths and Values.
 *
 * @example:
 *  const obj = {
 *    properties: {
 *      id: 7
 *    },
 *    type: 'DRAFT',
 *    coords: [[[1, -1], [2, -2]]]
 *  }
 *  hasObjKeys(obj, { 'properties.id': 7, 'coords': [1, -1] }, 'include');
 *  >>> true
 *
 * @param {*} obj - the object to check
 * @param {object} keys - key paths and values to match, e.g. { 'properties.id': 7, type: 'DRAFT' }
 * @param {String} match - one of comparison types ['deep', 'shallow', 'include'], default is `shallow`
 * @returns {boolean} - true if a match found.
 */
export function hasObjKeys (obj, keys = {}, match = 'deep') {
  for (const key in keys) {
    const value = keys[key]
    const searchValue = get(obj, key)

    // Deep comparison
    if (match === 'deep') {
      if (searchValue !== value) return false
    } // eslint-disable-line

    // Shallow comparison
    else if (match === 'shallow') {
      if ((isObjectLike(searchValue) && !matches(value)(searchValue)) || searchValue != value) {
        // eslint-disable-line eqeqeq
        return false
      }
    } // eslint-disable-line

    // Include comparison
    else if (match === 'include') {
      if (searchValue !== value && !isObjectLike(searchValue)) {
        return false
      }

      if (!matches(value)(searchValue)) {
        if (isObjectLike(searchValue)) return hasObjMatch(searchValue, value)

        return false
      }
    }
  }

  return true
}

/**
 * Check if given object has `key` property defined as any value
 * @param {any} obj
 * @param {string} key
 * @returns {boolean} true - if the `key` property is defined
 */
export function hasProp (obj, key) {
  return Object.hasOwnProperty.call(obj, key)
}

/**
 * Get Reference to Object with Provided Key Paths and Values within Nested Object or Collection.
 *
 * @example:
 *  const obj = {
 *    id: 7,
 *    items: [
 *      {
 *        type: 'polygon',
 *        geoJSON: {
 *          properties: {
 *            id: 7
 *          },
 *          type: 'DRAFT',
 *          coords: [[[1, -1], [2, -2]]]
 *        }
 *      }
 *    ]
 *  }
 *  findObjByKeys(obj, { 'properties.id': 7, 'coords': [1, -1] }, 'include');
 *  >>> Object: {
 *    properties: {
 *      id: 7
 *    },
 *    type: 'DRAFT',
 *    coords: [[[1, -1], [2, -2]]]
 *  }
 *
 * @param {*} obj - the collection to search for matching object
 * @param {Object} keys - object with key paths and values to match, e.g. { 'properties.id': 7, type: 'DRAFT' }
 * @param {String} match - one of comparison types ['deep', 'shallow', 'include']
 * @returns {Object} - the matching object.
 */
export function findObjByKeys (obj, keys = {}, match = 'deep') {
  for (const key in obj) {
    if (!Object.hasOwnProperty.call(obj, key)) return
    const value = obj[key]

    if (!isObjectLike(value)) continue

    if (hasObjKeys(value, keys, match)) return value

    const foundObj = findObjByKeys(value, keys, match)
    if (foundObj) return foundObj
  }
}

/**
 * Find all the objects which matches the keys in the object.
 * @see findObjByKeys on usage details.
 * @param obj
 * @param keys
 * @param match
 * @returns {Array}
 */
export function findAllObjsByKeys (obj, keys = {}, match = 'deep') {
  const result = []
  _findAllObjsByKeys(result, obj, keys, match)
  return result
}

/**
 * Get the first direct parent object/array containing given `value`
 * @param {object|array} collection - to search from
 * @param {any} value - to find parent for
 * @returns {object|array|void} parent - containing given `value`
 */
export function findParent (collection, value) {
  let parent
  for (const key in collection) {
    if (!Object.hasOwnProperty.call(collection, key)) return
    if (collection[key] === value) return collection

    if (!isCollection(collection[key])) continue
    parent = findParent(collection[key], value)
    if (parent !== void 0) return parent
  }
}

/**
 * Find all the objects with matching keys-values pairs in the Object or Collection.
 * @see findObjByKeys (which only returns a single matched object) on usage details.
 * The only usage difference from findObjByKeys is that the found objects are not in the return value.
 * This method populates the argument array 'foundObjs' with the found objects. This method has no return value.
 *
 * @param {Array} result - this is the return array. Pass in an empty array and it will be populated with the found objects
 * @param {Object} obj - Object or Collection to search from
 * @param {Object} keys - object with key paths and values to match, e.g. { 'properties.id': 7, type: 'DRAFT' }
 * @param {String} match - one of comparison types ['deep', 'shallow', 'include']
 */
function _findAllObjsByKeys (result, obj, keys = {}, match = 'deep') {
  for (const key in obj) {
    if (!Object.hasOwnProperty.call(obj, key)) return
    const value = obj[key]

    if (!isObjectLike(value)) continue

    if (hasObjKeys(value, keys, match)) result.push(value)

    _findAllObjsByKeys(result, value, keys, match)
  }
}

/**
 * Flatten/Unflatten Nested Object Keys into Single Object with Dot Separated Keys
 */
export const toFlatObj = flatten
export const fromFlatObj = flatten.unflatten

/**
 * Extract the value safely from an object via the keyPath and returns the value.
 * Removes that value's key from the passed object.
 *
 * @uses lodash
 * @see https://lodash.com/docs/4.17.1#get
 * @param {Object} obj - the object to get from and mutate
 * @param {string|Array} keyPath - the path to the desired value
 * @param {*} [fallback] - optional fallback value to return
 * @return {*}
 */
export function pop (obj, keyPath, fallback) {
  const value = get(obj, keyPath) || null
  if (value) unset(obj, keyPath)
  return value || fallback
}

/**
 * Delete Object property without mutating it, returning new Object without the deleted property
 *
 * @param {Object} obj - the Object to remove property from
 * @param {string} key - Object property to delete
 * @return {Object} - without the deleted key property
 */
export function removeKey (obj, key) {
  const {[key]: _, ...rest} = obj // eslint-disable-line
  return rest
}

/**
 * Recursively remove given list of keys from object or collection
 * @param {Object|Array} obj - or collection to remove keys from
 * @param {String[]} keys - list of keys to remove
 * @param {Boolean} [clone] - whether to return new object, defaults to mutating existing
 * @param {Boolean} [recursive] - whether to parse given obj recursively
 */
export function removeKeys (obj, keys, {clone = false, recursive = false} = {}) {
  const data = clone ? cloneDeep(obj) : obj
  for (const key in data) {
    if (keys.indexOf(key) >= 0) {
      delete data[key]
    } else if (recursive && isCollection(data[key])) {
      data[key] = removeKeys(data[key], keys, {recursive})
    }
  }
  return data
}

/**
 * Remove Empty String value keys from given Collection by mutation
 * (For Array, Falsey values will be removed)
 *
 * @param {Object|Array} collection - to remove empty values
 * @param {Boolean} [recursive] - whether to remove empty values recursively
 * @return {Object|Array} - without empty strings
 */
export function removeEmptyValues (collection, {recursive = true} = {}) {
  for (const key in collection) {
    if (collection[key] === '') {
      delete collection[key]
    } else if (recursive && typeof (collection[key] || '') === 'object') {
      collection[key] = removeEmptyValues(collection[key], {recursive})
    }
  }

  return collection.constructor === Array ? collection.filter(v => v) : collection
}

/**
 * Remove Null/Undefined value keys from given Collection by mutation
 * (For Array, Falsey values will be removed)
 *
 * @param {Object|Array} collection - to remove nil values
 * @param {Boolean} [recursive] - whether to remove nil values recursively
 * @return {Object|Array} - without null or undefined keys
 */
export function removeNilValues (collection, {recursive = true} = {}) {
  for (const key in collection) {
    if (collection[key] == null) {
      delete collection[key]
    } else if (recursive && typeof collection[key] === 'object') {
      collection[key] = removeNilValues(collection[key], {recursive})
    }
  }

  return collection.constructor === Array ? collection.filter(v => v) : collection
}

/**
 * Remove items with truthy 'delete' properties from given Collection by mutation
 * (For Array, Falsey values will be removed)
 *
 * @param {Object|Array} collection - to remove deleted items from
 * @return {Object|Array} - without items with .delete keys
 */
export function removeDeletedItems (collection) {
  for (const key in collection) {
    // Null is of type 'object' according to stupid JS specs
    if (typeof (collection[key] || '') !== 'object') continue

    if (collection[key].delete) {
      delete collection[key]
    } else {
      collection[key] = removeDeletedItems(collection[key])
    }
  }

  return collection.constructor === Array ? collection.filter(v => v) : collection
}

/**
 * Remove GraphQL Tags and Null values from given Collection
 *  - Nullable values will be removed from Array
 *  - Commonly uneditable attributes listed in `tags` are deleted, see `GQL_HIDDEN_FIELDS` for example
 *
 * @param {Object|Array} collection - to remove graphql tags from
 * @param {Array} [tags] - list of tags to remove
 * @param {Boolean} [clone] - whether to clone the object before mutating
 * @return {Object|Array} - without graphql tags
 */
export function sanitizeResponse (collection, {tags = ['__typename'], clone = false} = {}) {
  const result = clone ? cloneDeep(collection) : collection

  for (const key in result) {
    if (tags.includes(key)) {
      delete result[key]
    } else if (result[key] == null) {
      delete result[key]
    } else if (typeof result[key] === 'object') {
      result[key] = sanitizeResponse(result[key])
    }
  }

  return result.constructor === Array ? result.filter(v => v != null) : result
}

/**
 * Sort Object Keys by given order, returning new Object with Keys sorted
 *
 * @param {Object} obj - to sort key attributes for
 * @param {String} order - enum, one of ['asc', 'desc']
 * @return {Object} - sorted by key attributes
 */
export function sortObjKeys (obj, order = 'asc') {
  const result = {}
  Object.keys(obj)
    .sort(order === 'desc' ? sortObjKeys.descending : undefined)
    .forEach(key => {
      result[key] = obj[key]
    })
  return result
}

sortObjKeys.descending = (a, b) => {
  if (a < b) return 1
  if (a > b) return -1
  return 0
}

/**
 * Swap Object's Keys with its Values
 *
 * @example:
 *    swapKeyWithValue({id: 1, name: Tom})
 *    >>> {1: 'id', 'Tom': name}
 *
 * @param {Object} obj - to swap keys with values
 * @returns {Object} - with key and values swapped
 */
export function swapKeyWithValue (obj) {
  const result = {}
  for (const key in obj) {
    result[obj[key]] = key
  }
  return result
}

/**
 * Compute the Total Number from Object Values
 * @example:
 *    toObjValuesTotal({'a': 1, 'b': 2})
 *    >>> 3
 *
 * @param {Object} obj - with nested values to calculate total for
 * @returns {number} total - value of object values
 */
export function toObjValuesTotal (obj) {
  let sum = 0
  for (const key in obj) {
    sum += obj[key]
  }
  return sum
}

/**
 * Compute the Total Number from Object Values given Key Property
 * @example:
 *    toObjValuesKeyTotal({'a': {'count': 1}, 'b': {'count': 2}}, 'count')
 *    >>> 3
 *
 * @param {Object} obj - with nested values to calculate total for
 * @param {String} [key] - nested obj value key to extract amount for calculation
 * @returns {number} total - value of object values for given key property
 */
export function toObjValuesKeyTotal (obj, key = 'value') {
  let sum = 0
  for (const val in obj) {
    sum += obj[val][key]
  }
  return sum
}

/**
 * Converts object properties to a query string
 *
 * @example
 toParams({ids: [1, 2]});
 >>> 'ids=1&ids=2'
 *
 * @param {Object} obj - the object to turn into a query string
 * @return {string}
 */
export function queryString (obj) {
  return qs.stringify(obj)
}

// LODASH CLONES
// -----------------------------------------------------------------------------

export {
  clone,
  cloneDeep,
  /**
   * Search an object safely for a value via the keyPath and returns the value.
   *
   * @NOTE: this method is x10 times slower than Object property direct access
   *    - try and catch block is even slower
   *    - Object destructuring is much faster (more noticeable on big objects)
   *    => best to use Object destructuring with default fallback
   *
   * @uses lodash
   * @see https://lodash.com/docs/4.17.1#get
   * @param {Object} obj - the object to get the value from
   * @param {string|Array} keyPath - the path to the desired value
   * @param {*} [defaultValue] - The value returned for `undefined` resolved values
   * @return {*} the value at the keyPath
   */
  get,

  /**
   * Check if two Objects are Equal
   * @example:
   *    const a = [{ code: 'en' }, { code: 'ru' }]
   *    const b = [{ code: 'en' }, { code: 'ru' }]
   *    >>> isEqual(a, b)
   *    >>> true
   *
   * @uses lodash
   * @see https://lodash.com/docs/4.17.21#isEqual
   *
   * @param {Object} object - the object to compare against
   * @param {Object} object2 - the object to compare with
   * @return {boolean} - true or false
   */
    isEqual,

  /**
   * Checks if value is an empty object, collection, map or set
   *
   * @param {*} value - The value to check
   * @return {boolean} - Returns true if value is empty, else false
   */
    isEmpty,

  isMap,
  isObjectLike,
  isNil,
  omitBy,

  /**
   * Creates a function that returns the value at path of a given object
   *
   * @example
   *  [{ name: 'Neo', ... }, { name: 'Morpheus', ... }].map(property('name'))
   *  >>> ['Neo', 'Morpheus']
   *
   * @uses lodash
   * @see {@link https://lodash.com/docs/4.17.21#property} for further information
   *
   * @param {Array|string} path - The path of the property to get
   * @returns {Function} - Returns the new accessor function
   */
    property,

  /**
   * Sets the Property at Path of Collection by Mutation
   *
   * @uses lodash
   * @see https://lodash.com/docs/4.17.21#setWith
   *
   * @param {object|array} collection - to set property of
   * @param {string|array} path - of the property to set.
   * @param {function} [customizer] - the function to customize assigned values.
   *    Can be used to create objects instead of arrays for numeric keys.
   * @return {object|array} collection - mutated collection
   */
  set,

  /**
   * Removes the Property at Path of Object by Mutation
   *
   * @uses lodash
   * @see https://lodash.com/docs/4.17.21#unset
   *
   * @param {Object} object - to remove property from
   * @param {String|Array} path - of the property to unset.
   * @return {boolean} - whether the value was removed from object
   */
    unset,
}
