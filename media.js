import { greatestCommonDivisor } from './number.js'

/**
 * MEDIA FUNCTIONS =============================================================
 * =============================================================================
 */

/**
 * Get the lowest common aspect ratio from given width and height dimensions.
 *
 * @param {number|string} width - dimension
 * @param {number|string} height - dimension
 * @returns {string} aspect ratio - example '16:9'
 */
export function aspectRatio (width, height) {
  const divisor = greatestCommonDivisor(width, height)
  return `${width / divisor}:${height / divisor}`
}

/**
 * Get normalized Aspect Ratio if given Width and Height are in the List of supported aspect ratios.
 *
 * @param {number|string} width - dimension to check
 * @param {number|string} height - dimension to check
 * @param {string[]} supportedAspectRatios - example ['4:3','16:9']
 * @returns {string|void} aspect ratio - or void, if unsupported
 */
export function aspectRatioAllowed (width, height, supportedAspectRatios) {
  // Example: 32:18 converts to 16:9
  const ratio = aspectRatio(width, height)
  if (supportedAspectRatios.map(ratio => aspectRatio(...ratio.split(':'))).includes(ratio))
    return ratio
}

/**
 * Compute width for given resolution limit from original width/height dimensions, retaining aspect ratio.
 * @example:
 *  width: 10   height: 20   resolution: 200
 *      w: 5?        h: 10?         res: 50
 *  >>> w = sqrt(res/resolution) * width
 *        = sqrt(50/200)*10
 *        = 5
 *
 * @param {number} res - resolution limit to compute width for
 * @param {number} width - original dimension
 * @param {number} height - original dimension
 * @returns {number} width - for given `res`
 */
export function widthScaled (res, width, height) {
  return Math.round(Math.sqrt(res / width / height) * width)
}
