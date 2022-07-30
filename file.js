import { Active, ENV } from './_envs.js'
import { isList } from './array.js'
import { warn } from './log.js'
import { fileFormatNormalized, fileNameWithoutExt, mimeTypeFromDataUrl } from './string.js'

/**
 * FILE VARIABLES ==============================================================
 * =============================================================================
 */

export const CDN_URL = ENV.REACT_APP_CDN_URL || ''

export const FILE = {
  PATH_IMAGES: `${CDN_URL}/static/images/`,
  PATH_SOUNDS: `${CDN_URL}/static/sounds/`,
  CDN_URL,
  EXT: {
    CSV: 'csv',
    GIF: 'gif',
    JSON: 'json',
    JPG: 'jpg',
    JPEG: 'jpeg',
    MP3: 'mp3',
    MP4: 'mp4',
    PNG: 'png',
    SVG: 'svg',
    WEBP: 'webp',
  },
  MIME_TYPE: {
    BIN: 'application/octet-stream',
    CSV: 'text/csv',
    GIF: 'image/gif',
    JSON: 'application/json',
    JPG: 'image/jpeg',
    MP3: 'audio/mpeg',
    MP4: 'video/mp4',
    PNG: 'image/png',
    SVG: 'image/svg+xml',
    WEBP: 'image/webp',
  },
  // File Uploads
  TYPE: {
    JSON: 'json',
    IMAGE: 'image',
    SOUND: 'sound',
    VIDEO: 'video',
  },
}

FILE.FORMAT_BY_MIME_TYPE = {
  [FILE.MIME_TYPE.BIN]: 'bin',
  [FILE.MIME_TYPE.CSV]: 'csv',
  [FILE.MIME_TYPE.GIF]: 'gif',
  [FILE.MIME_TYPE.JSON]: 'json',
  [FILE.MIME_TYPE.JPG]: 'jpg',
  [FILE.MIME_TYPE.MP3]: 'mp3',
  [FILE.MIME_TYPE.MP4]: 'mp4',
  [FILE.MIME_TYPE.PNG]: 'png',
  [FILE.MIME_TYPE.SVG]: 'svg',
  [FILE.MIME_TYPE.WEBP]: 'webp',
}

// Sounds Files
export const SOUND = {
  // ALERT: soundFile('alert.mp3'),
  // INCREASE: soundFile('increase.mp3'),
  // DECREASE: soundFile('decrease.mp3'),
  // PRESS: soundFile('press.mp3'),
  // PROGRESS: soundFile('progress.mp3'),
  TOUCH: soundFile('touch.mp3'),
  // SWOOSH: soundFile('swoosh.mp3'),
  // SLIDE: soundFile('slide.mp3'),
}

/**
 * HELPER FUNCTIONS ------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * Create JS File Object from given URL
 * @param {String} url - to fetch file, can be Base64 string, http url, dataURL, blobURL, etc...
 * @param {String} filename - to use
 * @param {FilePropertyBag|undefined} [options] - attributes to pass to new File()
 * @returns {Promise<File>} file object if resolved
 */
export function fileFromUrl (url, filename, options) {
  return fetch(url)
    .then((res) => res.arrayBuffer())
    .then((buf) => new File([buf], filename, options))
}

/**
 * Get File Format Extension from Data URL String
 * @param {String} dataUrl - see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * @returns {String} format - example: 'png'
 */
export function fileFormatFromDataUrl (dataUrl) {
  return FILE.FORMAT_BY_MIME_TYPE[mimeTypeFromDataUrl(dataUrl)]
}

/**
 * Compute Unique File ID for given FileInput props.
 * File can have different versions with the same `id`, thus need to combine other props as primary key.
 * @see `fileName()` for arguments and return value
 */
export function fileId ({name, ext, ...fileInput}) {
  return fileName(fileInput)
}

/**
 * Create File Name (with optional ID folder) from FileInput object in this format:
 * `{id}/{kind}_{i}.{ext}` - for use in File `src` string for frontend and backend.
 *
 * @example: possible outputs
 *    const file = {id: 'test', kind: 'public', i: 'thumb', ext: 'jpg'}
 *    >>> 'test/public_thumb.jpg'
 *    const file = {id: 'test', kind: 'public', ext: 'jpg'}
 *    >>> 'test/public.jpg'
 *    const file = {id: 'test', i: 'thumb'}
 *    >>> 'test/thumb'
 *    const file = {id: 'test', ext: 'jpg'}
 *    >>> 'test.jpg'
 *    const file = {ext: 'jpg'}
 *    >>> '.jpg'
 *
 * @param {FileInput|Object<id, kind, i, name>} fileInput - FileInput object (ex. from GraphQL)
 * @returns {string} filename - including optional ID folder
 */
export function fileName (fileInput) {
  let {id, kind, i, name} = fileInput
  id = id != null ? String(id) : ''
  kind = kind != null ? String(kind) : ''
  i = i != null ? String(i) : ''
  const ext = name != null ? fileFormatNormalized(name) : ''
  const slash = id && (kind || i) && '/'
  const _ = kind && i && '_'
  const dot = ext && '.'
  return `${id}${slash}${kind}${_}${i}${dot}${ext}`
}

/**
 * Compute File Name with given Size label
 *
 * @param {String} filename - with extension, result of `fileName()`
 * @param {String} size - for given `filename`
 * @returns {String} filename with size added to the name.
 */
export function fileNameSized (filename, size) {
  if (!size) return filename
  const name = fileNameWithoutExt(filename)
  const ext = fileFormatNormalized(filename)
  const extension = ext ? `.${ext}` : ''
  return `${name}_${size}${extension}`
}

/**
 * Parse <UploadGridField/> onChange(files) values to match Backend API
 * @param {FileInput[]|FileInput|object|object[]} files - single or list of FileInputs to parse
 * @returns {Object[]|Object|void} {file, kind, i, remove}[] - single or list of FileInputs for backend
 */
export function fileParser (files) {
  if (isList(files)) {
    const list = files.map(fileParser).filter(v => v)
    if (list.length) return list
  } else {
    const {file, kind, i, remove} = files
    if (file) return {file, kind, i}
    if (remove) return {kind, i, remove}
  }
}

/**
 * Parse <UploadGridField/> onChange(files) values to have `kind` as given
 * @param {FileInput|object} fileInput
 * @param {String} kind - to use
 * @returns {{kind: string, remove: boolean}|{kind: string, file: object}}
 *   fileInput for backend with kind inserted
 */
export function fileKindParser (fileInput, kind) {
  const {file, remove} = fileInput
  if (file) return {kind, file}
  if (remove) return {kind, remove}
}

/**
 * Create File Upload Folder from given Mongoose Document Instance
 * @param {Document} instance - Mongoose doc
 * @returns {String} folder - in this format `{ModelName}/{id}`
 */
export function folderFrom (instance) {
  const {id, constructor: {modelName}} = instance
  return `/${modelName}/${id}`
}

/**
 * Load Image file
 *
 * @param {String} src - full image file path
 * @return {Promise<Image|Error>} promise - resolves to loaded Image file or error
 */
export function loadImage (src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Create a Lazy-Loaded Audio File object with safe .play() method that is muted when sound is off
 *
 * @param {String} name - sound file name
 * @returns {Object<{play()}>} - object with .play() method
 */
function soundFile (name) {
  let file
  return {
    play () {
      // IE 11 does not support Audio()
      if (!file) try {
        file = new Audio(FILE.PATH_SOUNDS + name)
      } catch (err) {
        warn(err)
      }
      if (Active.SETTINGS.HAS_SOUND && file) file.play().catch()
    },
  }
}
