/**
 * Named character references that resolve to ASCII characters usable in a
 * URL. Hex digits and "-" of a filename can only be written as numeric
 * references, so this list plus numeric decoding covers every way a browser
 * could resolve an encoded storage URL.
 */
const NAMED_REFERENCES: Record<string, string> = {
  amp: '&',
  apos: "'",
  ast: '*',
  bsol: '\\',
  colon: ':',
  comma: ',',
  commat: '@',
  dollar: '$',
  equals: '=',
  excl: '!',
  grave: '`',
  gt: '>',
  hat: '^',
  lbrace: '{',
  lbrack: '[',
  lcub: '{',
  lowbar: '_',
  lpar: '(',
  lsqb: '[',
  lt: '<',
  midast: '*',
  newline: '\n',
  num: '#',
  percnt: '%',
  period: '.',
  plus: '+',
  quest: '?',
  quot: '"',
  rbrace: '}',
  rbrack: ']',
  rcub: '}',
  rpar: ')',
  rsqb: ']',
  semi: ';',
  sol: '/',
  tab: '\t',
  verbar: '|',
  vert: '|'
}

// Browsers also accept these legacy references without a trailing semicolon
const LEGACY_REFERENCES = new Set(['amp', 'gt', 'lt', 'quot'])

const CHARACTER_REFERENCE = /&(?:#x([0-9a-f]+);?|#(\d+);?|([a-z]+)(;?))/gi

export const decodeCharacterReferences = (value: string): string =>
  value.replace(CHARACTER_REFERENCE, (match, hex, decimal, name, semicolon) => {
    if (hex || decimal) {
      const codePoint = parseInt(hex ?? decimal, hex ? 16 : 10)
      return codePoint > 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match
    }
    const key = name.toLowerCase()
    const char = NAMED_REFERENCES[key]
    if (!char) return match
    return semicolon || LEGACY_REFERENCES.has(key) ? char : match
  })

const SRCSET_ATTRIBUTES = new Set(['srcset', 'imagesrcset'])
// The lookbehind keeps each scheme start O(1), so long values stay linear
const URL_CANDIDATE = /(?<![a-z\d+.-])(?:[a-z][a-z\d+.-]*:)?\/\/[^\s"'<>(),]+/gi
// The URL parser strips ASCII tabs and newlines anywhere in a URL
const URL_IGNORED_CHARS = /[\t\n\r]/g

/**
 * Returns absolute or protocol-relative URL candidates in an attribute value,
 * splitting srcset candidates from their descriptors.
 */
export const findUrlCandidates = (name: string, value: string): string[] => {
  if (SRCSET_ATTRIBUTES.has(name)) {
    return value
      .split(/[\s,]+/)
      .filter((token) => /^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(token))
  }
  return value.replace(URL_IGNORED_CHARS, '').match(URL_CANDIDATE) ?? []
}

export interface StorageLocation {
  host: string
  pathPrefix: string
}

/**
 * Returns the object key when `candidate` resolves to one of `locations`.
 * Host matching is case-insensitive and the path is percent-decoded,
 * matching how the browser and the storage resolve the URL.
 */
export const toStorageKey = (
  candidate: string,
  locations: StorageLocation[]
): string | null => {
  let url: URL
  try {
    url = new URL(candidate, 'https://base.invalid/')
  } catch {
    return null
  }

  for (const { host, pathPrefix } of locations) {
    if (url.hostname !== host || !url.pathname.startsWith(pathPrefix)) continue
    const rest = url.pathname.slice(pathPrefix.length)
    try {
      return decodeURIComponent(rest) || null
    } catch {
      return null
    }
  }
  return null
}

export const toStorageLocation = (
  baseUrl: string,
  pathPrefix = '/'
): StorageLocation | null => {
  try {
    const url = new URL(baseUrl)
    const basePath = url.pathname.replace(/\/+$/, '')
    return { host: url.hostname, pathPrefix: `${basePath}${pathPrefix}` }
  } catch {
    return null
  }
}

const PERCENT_ENCODED = /%([0-9a-f]{2})/gi

/**
 * Normalizes HTML for a plain text search of filenames: decodes character
 * references and percent-encoding and drops the characters a URL parser
 * strips, so any spelling that resolves to a filename contains it verbatim.
 */
export const normalizeForFilenameSearch = (html: string): string =>
  decodeCharacterReferences(html)
    .replace(URL_IGNORED_CHARS, '')
    .replace(PERCENT_ENCODED, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .toLowerCase()
