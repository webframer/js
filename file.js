import { _WORK_DIR_, current, ENV } from './_envs.js'
import { isList } from './array.js'
import { SIZE_MB_16 } from './constants.js'
import { warn } from './log.js'
import { fileFormatNormalized, fileNameWithoutExt, isFileSrc, mimeTypeFromDataUrl } from './string.js'

/**
 * FILE VARIABLES ==============================================================
 * =============================================================================
 */

export const CDN_URL = ENV.REACT_APP_CDN_URL || ''

// File definitions
export const FILE = {
  PATH_ICONS: `${CDN_URL}/static/icons/`,
  PATH_IMAGES: `${CDN_URL}/static/images/`,
  PATH_SOUNDS: `${CDN_URL}/static/sounds/`,
  CDN_URL,
  // File extension without the dot in lowercase
  FORMAT: {
    BIN: 'bin',
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
  // File grouping into common media types
  TYPE: {
    AUDIO: 'audio',
    JSON: 'json',
    IMAGE: 'image',
    TEXT: 'text',
    VIDEO: 'video',
  },
}

// File Extensions with dot prepended, for extension without dots, use FILE.FORMAT.*
FILE.EXT = {}
for (const key in FILE.FORMAT) {
  FILE.EXT[key] = `.${FILE.FORMAT[key]}`
}

FILE.FORMAT_BY_MIME_TYPE = {
  [FILE.MIME_TYPE.BIN]: FILE.FORMAT.BIN,
  [FILE.MIME_TYPE.CSV]: FILE.FORMAT.CSV,
  [FILE.MIME_TYPE.GIF]: FILE.FORMAT.GIF,
  [FILE.MIME_TYPE.JSON]: FILE.FORMAT.JSON,
  [FILE.MIME_TYPE.JPG]: FILE.FORMAT.JPG,
  [FILE.MIME_TYPE.MP3]: FILE.FORMAT.MP3,
  [FILE.MIME_TYPE.MP4]: FILE.FORMAT.MP4,
  [FILE.MIME_TYPE.PNG]: FILE.FORMAT.PNG,
  [FILE.MIME_TYPE.SVG]: FILE.FORMAT.SVG,
  [FILE.MIME_TYPE.WEBP]: FILE.FORMAT.WEBP,
}

// File MIME Type by File Extension
FILE.MIME_TYPE_BY_EXT = {
  [FILE.EXT.BIN]: FILE.MIME_TYPE.BIN,
  [FILE.EXT.CSV]: FILE.MIME_TYPE.CSV,
  [FILE.EXT.GIF]: FILE.MIME_TYPE.GIF,
  [FILE.EXT.JSON]: FILE.MIME_TYPE.JSON,
  [FILE.EXT.JPG]: FILE.MIME_TYPE.JPG,
  [FILE.EXT.JPEG]: FILE.MIME_TYPE.JPG,
  [FILE.EXT.MP3]: FILE.MIME_TYPE.MP3,
  [FILE.EXT.MP4]: FILE.MIME_TYPE.MP4,
  [FILE.EXT.PNG]: FILE.MIME_TYPE.PNG,
  [FILE.EXT.SVG]: FILE.MIME_TYPE.SVG,
  [FILE.EXT.WEBP]: FILE.MIME_TYPE.WEBP,
}

// Image File Definitions
export const IMAGE = {
  MAX_RES: SIZE_MB_16, // total Image width*height resolution limit (16 MB is about 4K image)
  EXTS: [FILE.EXT.JPG, FILE.EXT.JPEG, FILE.EXT.PNG, FILE.EXT.SVG, FILE.EXT.GIF, FILE.EXT.WEBP],
  MIME_TYPES: [FILE.MIME_TYPE.JPG, FILE.MIME_TYPE.PNG, FILE.MIME_TYPE.SVG, FILE.MIME_TYPE.GIF, FILE.MIME_TYPE.WEBP],
  SIZES: { // default sharp.resize() config for image uploads
    // @see: https://sharp.pixelplumbing.com/api-resize
    '': {res: SIZE_MB_16}, // max 4K resolution for the original file
    medium: {width: 1200, height: 1200, fit: 'inside'},
    thumb: {width: 150, height: 150, fit: 'cover'},
  },
}

// File Upload Definitions
export const UPLOAD = {
  DIR: `/uploads`, // relative to site's root for frontend, and _WORK_DIR_ for backend
  BY_ROUTE: {
    [FILE.TYPE.JSON]: {fileTypes: '.json', maxSize: SIZE_MB_16},
    [FILE.TYPE.IMAGE]: {fileTypes: IMAGE.EXTS.join(', '), maxSize: SIZE_MB_16},
    [FILE.TYPE.AUDIO]: {fileTypes: '.mp3', maxSize: SIZE_MB_16},
    [FILE.TYPE.VIDEO]: {fileTypes: '.mp4', maxSize: SIZE_MB_16},
  },
}

// Full Upload path
// @important: for backend, ensure .env file variables are loaded first, usually in `_init.js`
// Bucket name must be empty string so that backend can set bucket during runtime
UPLOAD.PATH = `${ENV.CDN_BUCKET_NAME ? '' : (ENV.UPLOAD_PATH || _WORK_DIR_)}${UPLOAD.DIR}`

// Sound File Definitions
export const SOUND = {
  FILE: {
    // ALERT: soundFile('alert.mp3'),
    // INCREASE: soundFile('increase.mp3'),
    // DECREASE: soundFile('decrease.mp3'),
    // PRESS: soundFile('press.mp3'),
    // PROGRESS: soundFile('progress.mp3'),
    TOUCH: soundFile('touch.mp3'),
    // SWOOSH: soundFile('swoosh.mp3'),
    // SLIDE: soundFile('slide.mp3'),
  },
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
      if (current.SETTINGS.HAS_SOUND && file) file.play().catch()
    },
  }
}

/**
 * HELPER FUNCTIONS ------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * Check if given File-like object has matching MIME type or file extension as defined by `accept`.
 * @see: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
 * @param {File|{name?, type?}} file - File object or object with file name and MIME type to check
 * @param {string} [accept] - native HTML comma-separated list of one or more file types allowed
 * @param {string[]} [accepts] - a list of precomputed `accept` values to make it faster
 * @returns {boolean|string|void} true - when accept not defined, else matched MIME type or extension
 */
export function canAccept ({name, type}, accept, accepts = canAcceptCache[accept]) {
  // To avoid bugs with missing definition for all possible file extensions,
  // derive file extension from file.name in addition to MIME file.type check
  if (!accepts) accepts = canAcceptCache[accept] = accept && accept.toLowerCase().split(',')
    .map(type => type.trim().replace(/\*$/, '')) // remove '*' wildcard for partial match
  if (!accepts) return true
  const ext = name && `.${name.split('.').pop().toLowerCase().trim()}`
  if (!type && ext) type = FILE.MIME_TYPE_BY_EXT[ext]
  return accepts.find(t => ext === t || (type && type.indexOf(t) > -1))
}

const canAcceptCache = {}

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
 * Compute Preview Image src from dynamic `preview` attribute
 * @param {String|Object} preview - type.UrlOrBase64OrPreview
 * @param {String} [size] - one of thumb/medium/large/etc.
 * @param {String} [prefix] - url prefix (defaults to CDN url, if set in .env variable REACT_APP_CDN_URL)
 * @returns {String|Object|any} preview src ready for consumption by Components
 */
export function previewSize (preview, size = 'thumb',
  prefix = ((typeof preview === 'string' && (preview.indexOf('blob:') === 0 || preview.indexOf('http') === 0)) ? '' : CDN_URL)) {
  // typeof DOMString/ObjectURL === 'string' and typeof new String() === 'object'
  return preview && (prefix + (typeof preview === 'object' ? (preview[size] || preview) : preview))
}

/**
 * Compute Image `preview` URL/pathname (can accept Base64 string) in different sizes for consumption by frontend:
 *  - `preview` matches original `src`
 *  - `preview.medium` matches medium size of `src`
 *  - `preview.thumb` matches thumbnail size of `src`
 *
 * => pass in `null` as the second parameter to disable default fallback to IMAGE.SIZES.
 *
 * @example:
 *    const preview = previewSizes(image)
 *    preview == image.src >>> true
 *    preview.medium >>> string
 *    preview.thumb >>> string
 *
 * Scenarios:
 *  1. Production file: use `src` suffixed with 'medium' for default size, else `src` as 'original'
 *  2. Local dev file: user `src` as base64 data if it is of base64 type, else same as point 1.
 * @param {Object} - FileInput with `src` and optional `sizes` attribute (ex. sizes: [{key: 'medium', val: 99}])
 * @param {String[]|Null} [resKeys] - use predefined image size keys when `FileInput.sizes` not available
 * @return {Object|Undefined} preview<medium, thumb...> - string object with sizes attached as props of `preview`
 */
export function previewSizes ({src, sizes}, resKeys = imgSizes) {
  if (!src) return
  if ((sizes || resKeys) && isFileSrc(src)) {
    // noinspection JSPrimitiveTypeWrapperUsage
    const preview = new String(src)
    if (sizes) {
      for (const size of sizes) {
        const {key} = size
        if (!key) continue
        preview[key] = fileNameSized(src, key)
      }
    } else {
      // fallback is needed to compute sizes for EntrySummary that likely doesn't query `sizes`,
      resKeys.forEach(key => key && (preview[key] = fileNameSized(src, key)))
    }
    return preview
  }
  return src
}

const imgSizes = Object.keys(IMAGE.SIZES)

/**
 * Standardizes how the absolute file path is computed
 * @param {String} [filename] - required if absolute `path` not given (ex. photo.jpg)
 * @param {String} [folder] - file directory path relative to `workDir`, if `dir` not given, must start with slash (ex. '/User')
 * @param {String} [workDir] - absolute working directory path, defaults to UPLOAD.PATH
 * @param {String} [dir] - absolute directory path, excluding file name (ex. `/root/uploads`), defaults to `workDir` + `folder`
 * @param {String} [path] - required if `filename` not given, absolute directory path, including file name (ex. `/root/uploads/old_image.jpg`)
 * @returns {Object} {dir, path, name}
 *    - `path` -> absolute path including filename,
 *    - `dir` -> without filename
 *    - `name` -> filename
 */
export function resolvePath ({filename = '', folder = '', dir = '', path = '', workDir = UPLOAD.PATH}) {
  if (!filename && !path) throw new Error(`${resolvePath.name}() requires either 'filename' or full absolute 'path'`)
  if (!path) {
    if (!dir) dir = `${workDir}${folder}`
    const _name = fileNameWithoutExt(filename)
    const slash = _name && '/' // turn directory into file when `filename` only has extension (ex. '.jpg')
    path = `${dir}${slash}${filename}`
    dir = _name ? dir : path.substring(0, path.lastIndexOf('/'))
  } else {
    dir = path.substring(0, path.lastIndexOf('/'))
  }
  const name = path.substring(path.lastIndexOf('/') + 1)
  return {dir, path, name}
}
