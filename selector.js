import now from 'performance-now' // adds almost zero KB to bundle size because browsers have window.performance.now()
import { createSelector } from 'reselect'
import { __CLIENT__, __DEV__, Current } from './_envs.js'
import { ONE_MILLISECOND } from './constants.js'
import { logSelector } from './log.js'
import { formatNumber } from './number.js'
import { hasProp } from './object.js'

export * from 'reselect'

/**
 * Check if given value is a memoized selector function
 * @param {any} func
 * @returns {boolean} true - if it was created with `createSelector` from 'reselect' library
 */
export function isSelector (func) {
  return hasProp(func, 'memoizedResultFunc')
}

/**
 * Selector Decorator to turn all class static property functions into Memoized Functions
 *
 * @see: `createSelector` in reselect library for docs
 * @note: make sure to avoid arrow function when reusing selectors
 *
 * @example:
 *   // selectors.js
 *  *@selector(NAME)
 *   export default class select {
 *
 *     // Shorthand declaration syntax (`this` is undefined)
 *     static activeRoute = () => [
 *       (state) => get(state, `${NAME}.location.pathname`),
 *       (pathname) => pathname
 *     ]
 *
 *     // Reusing selectors declaration syntax (`this` is the `select` class instance)
 *     static activeUri = function () {
 *        // noinspection JSPotentiallyInvalidUsageOfClassThis
 *        return [
 *          // Reusing selector defined above (order of declaration matters)
 *          this.activeRoute,
 *          // This function will execute every time the `state` object changes its reference,
 *          // but it does not execute if we mutate `state` object without changing reference.
 *          (state) => get(state, `${this.NAME}.location.id`),
 *          // The last function only executes when any of its arguments changes reference
 *          (route, id) => route.split('/').pop()
 *        ]
 *     }
 *   }
 * @param {String} NAME - module's namespace
 * @param {Number} [maxTime] - milliseconds, to be considered slow (highlights execution time as red), default is 5 ms
 * @returns {Function} decorator - that transforms given class' static properties
 */
export function selector (NAME, maxTime = 5 * ONE_MILLISECOND) {
  let start
  return function (constructor) {
    for (const key in constructor) {
      const selectors = constructor[key]()
      const lastFunc = selectors.pop()
      selectors.forEach((selector, i) => selector || console.error(`${lastFunc.name} is missing selector ${i + 1}!`))
      constructor[key] = createSelector(
        ...selectors,
        function () {
          __DEV__ && (start = now())
          const result = lastFunc(...arguments)
          if (__DEV__) {
            const duration = now() - start
            let time = `${formatNumber(duration, {decimals: 3})} ms`
            if (duration >= maxTime) {
              if (__CLIENT__ || (!Current.log || !Current.log.keyword)) {
                time = '%c' + time + '%c'
                logSelector(`${NAME} ${key} [${time}]`, result, 'color: Red', 'color: Orange')
              }
              // Chalk logger is available
              else {
                // Since chalk v5.0.0 there is no orange color, only yellow, and no chalk.keyword(), and only ESM import
                logSelector(`${NAME} ${key} [`, result, Current.log.keyword('red')(time), Current.log.keyword('orange')(']'))
              }
            } else {
              logSelector(`${NAME} ${key} [${time}]`, result)
            }
          }
          return result
        }
      )
    }
    constructor.NAME = NAME // can be accessed as instance `this.NAME` within selectors
    return constructor
  }
}

export default selector

