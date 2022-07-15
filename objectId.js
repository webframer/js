import ObjectId from 'bson-objectid' // adds 1 KB to bundle size gzipped

export {ObjectId}

/**
 * Create 12 bits Hex string ID compatible with MongoDB ID
 *
 * @return {string} ID
 */
export function MongoId () {
  return new ObjectId().toString()
}
