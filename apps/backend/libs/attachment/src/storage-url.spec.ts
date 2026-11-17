import { expect } from 'chai'
import {
  decodeCharacterReferences,
  findUrlCandidates,
  normalizeForFilenameSearch,
  toStorageKey,
  toStorageLocation
} from './storage-url'

const FILENAME = '0f8fad5b-d9cb-469f-a165-70867728950e'
const LOCATIONS = [
  { host: 'media.codedang.com', pathPrefix: '/' },
  { host: 'minio.stage.codedang.com', pathPrefix: '/codedang-media/' }
]

describe('storage-url', () => {
  describe('decodeCharacterReferences', () => {
    it('should decode numeric references with or without a semicolon', () => {
      expect(decodeCharacterReferences('&#48;f&#x38;f&#45x')).to.equal('0f8f-x')
    })

    it('should decode named references that resolve to URL characters', () => {
      expect(
        decodeCharacterReferences('https&colon;&sol;&sol;media&period;com')
      ).to.equal('https://media.com')
    })

    it('should keep unknown or unterminated named references', () => {
      expect(decodeCharacterReferences('&foo; &colon &ampx &amp')).to.equal(
        '&foo; &colon &ampx &'
      )
    })
  })

  describe('findUrlCandidates', () => {
    it('should split srcset candidates from their descriptors', () => {
      expect(
        findUrlCandidates(
          'srcset',
          'https://media.codedang.com/a 1x, https://media.codedang.com/b 2x'
        )
      ).to.deep.equal([
        'https://media.codedang.com/a',
        'https://media.codedang.com/b'
      ])
    })

    it('should find URLs inside style url() and ignore tabs and newlines', () => {
      expect(
        findUrlCandidates(
          'style',
          'background:url("https://media.codedang.com/a\n b")'
        )
      ).to.deep.equal(['https://media.codedang.com/a'])
      expect(
        findUrlCandidates('src', 'https://media.codedang.com/0f8f\n\tad5b')
      ).to.deep.equal(['https://media.codedang.com/0f8fad5b'])
    })
  })

  describe('toStorageKey', () => {
    it('should resolve case-insensitive, protocol-relative and percent-encoded URLs', () => {
      for (const candidate of [
        `https://MEDIA.codedang.com/${FILENAME}`,
        `//media.codedang.com/${FILENAME}?v=1#x`,
        `https://media.codedang.com/%30${FILENAME.slice(1)}`,
        `https://minio.stage.codedang.com/codedang-media/${FILENAME}`
      ]) {
        expect(toStorageKey(candidate, LOCATIONS)).to.equal(FILENAME)
      }
    })

    it('should return null for other hosts, buckets or invalid URLs', () => {
      expect(toStorageKey(`https://example.com/${FILENAME}`, LOCATIONS)).to.be
        .null
      expect(
        toStorageKey(
          `https://minio.stage.codedang.com/other/${FILENAME}`,
          LOCATIONS
        )
      ).to.be.null
      expect(toStorageKey('https://media.codedang.com/%E0%A4%A', LOCATIONS)).to
        .be.null
    })
  })

  describe('normalizeForFilenameSearch', () => {
    it('should undo character references, percent-encoding, URL whitespace and case', () => {
      expect(normalizeForFilenameSearch('&#48;F8F%61D\n5B&colon;')).to.equal(
        '0f8fad5b:'
      )
    })
  })

  describe('toStorageLocation', () => {
    it('should build a host and path prefix from a base URL', () => {
      expect(toStorageLocation('https://media.codedang.com//')).to.deep.equal({
        host: 'media.codedang.com',
        pathPrefix: '/'
      })
      expect(
        toStorageLocation('http://127.0.0.1:9000', '/codedang-media/')
      ).to.deep.equal({ host: '127.0.0.1', pathPrefix: '/codedang-media/' })
    })
  })
})
