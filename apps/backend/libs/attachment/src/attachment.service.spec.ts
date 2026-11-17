import type { ConfigService } from '@nestjs/config'
import { expect } from 'chai'
import { stub } from 'sinon'
import { UnprocessableDataException } from '@libs/exception'
import type { StorageService } from '@libs/storage'
import { AttachmentService } from './attachment.service'
import { buildMediaUrl } from './media-url'

const createConfig = (env: [string, string][]) => {
  const values = new Map(env)
  return { get: (key: string) => values.get(key) } as unknown as ConfigService
}

const FILENAME = '0f8fad5b-d9cb-469f-a165-70867728950e'
const OTHER_FILENAME = '7c9e6679-7425-40de-944b-e07fc1f90ae7'

const CDN_ENV: [string, string][] = [
  ['MEDIA_CDN_URL', 'https://media.codedang.com'],
  ['MEDIA_BUCKET_NAME', 'codedang-media']
]

describe('AttachmentService', () => {
  describe('extractIds', () => {
    const service = new AttachmentService(
      createConfig([]),
      {} as StorageService
    )

    it('should extract unique ids from img and file nodes', () => {
      const ids = service.extractIds([
        `<p>a</p><img data-attachment-id="${FILENAME}" alt="x">`,
        null,
        `<div data-file-download data-attachment-id='${OTHER_FILENAME}'>guide.pdf</div>`,
        `<img data-attachment-id="${FILENAME}">`
      ])

      expect(ids).to.deep.equal([FILENAME, OTHER_FILENAME])
    })

    it('should ignore the attribute text written in body content', () => {
      const ids = service.extractIds([
        `<p>Use data-attachment-id="${FILENAME}" in the tag.</p>`,
        `<pre><code>&lt;img data-attachment-id="${FILENAME}"&gt;</code></pre>`
      ])

      expect(ids).to.deep.equal([])
    })

    it('should ignore the attribute text inside another attribute value', () => {
      const ids = service.extractIds([
        `<img alt="a > b data-attachment-id='${FILENAME}'" data-attachment-id="${OTHER_FILENAME}">`
      ])

      expect(ids).to.deep.equal([OTHER_FILENAME])
    })

    it('should return an empty array when there is no attachment', () => {
      expect(service.extractIds(['<p>text</p>', undefined, ''])).to.deep.equal(
        []
      )
    })
  })

  describe('extractStorageFilenames', () => {
    const service = new AttachmentService(
      createConfig([
        ...CDN_ENV,
        ['MINIO_ENDPOINT_URL', 'https://minio.stage.codedang.com']
      ]),
      {} as StorageService
    )

    it('should extract filenames from CDN, MinIO and S3 URLs in attributes', () => {
      const filenames = service.extractStorageFilenames([
        `<img src="https://media.codedang.com/${FILENAME}?v=1">`,
        `<div data-file-download href="https://minio.stage.codedang.com/codedang-media/${OTHER_FILENAME}"></div>`,
        `<a href="https://codedang-media.s3.ap-northeast-2.amazonaws.com/${FILENAME}">pdf</a>`
      ])

      expect(filenames).to.deep.equal([FILENAME, OTHER_FILENAME])
    })

    it('should ignore external URLs and URLs written in body text', () => {
      expect(
        service.extractStorageFilenames([
          '<img src="https://example.com/image.png">',
          `<p>https://media.codedang.com/${FILENAME}</p>`,
          `<img data-attachment-id="${FILENAME}">`
        ])
      ).to.deep.equal([])
    })
  })

  describe('findUuids', () => {
    const service = new AttachmentService(
      createConfig([]),
      {} as StorageService
    )

    it('should find UUIDs in any attribute or text after normalization', () => {
      expect(
        service.findUuids([
          `<img alt=don't data-attachment-id="${FILENAME}">`,
          null,
          `<p>&#55;${OTHER_FILENAME.slice(1).toUpperCase()}</p>`
        ])
      ).to.deep.equal([FILENAME, OTHER_FILENAME])
    })
  })

  describe('findReferencedFilenames', () => {
    const service = new AttachmentService(
      createConfig([]),
      {} as StorageService
    )

    it('should find filenames however they are written in the HTML', () => {
      for (const html of [
        `<img alt=it's data-attachment-id="${FILENAME}">`,
        `<img src="https://media.codedang.com/&#48;${FILENAME.slice(1)}">`,
        `<img src="https://media.codedang.com/%30${FILENAME.slice(1)}">`,
        `<img src="https://media.codedang.com/${FILENAME.slice(0, 8)}\n${FILENAME.slice(8)}">`,
        `<img src="https://unknown.example/${FILENAME.toUpperCase()}">`
      ]) {
        expect(
          service.findReferencedFilenames([null, html], [FILENAME])
        ).to.deep.equal([FILENAME])
      }
    })

    it('should not return filenames missing from the HTML', () => {
      expect(
        service.findReferencedFilenames(
          [`<img data-attachment-id="${OTHER_FILENAME}">`],
          [FILENAME]
        )
      ).to.deep.equal([])
    })
  })

  describe('diff', () => {
    const service = new AttachmentService(
      createConfig([]),
      {} as StorageService
    )

    it('should return added and removed ids', () => {
      expect(service.diff(['a', 'b'], ['b', 'c'])).to.deep.equal({
        added: ['c'],
        removed: ['a']
      })
    })

    it('should return empty lists when nothing changed', () => {
      expect(service.diff(['a'], ['a'])).to.deep.equal({
        added: [],
        removed: []
      })
    })
  })

  describe('toUrl / toAttachments', () => {
    const config = createConfig(CDN_ENV)
    const service = new AttachmentService(config, {} as StorageService)

    it('should return the same URL as buildMediaUrl', () => {
      expect(service.toUrl(FILENAME)).to.equal(buildMediaUrl(config, FILENAME))
    })

    it('should map files to id and url pairs', () => {
      expect(service.toAttachments([{ filename: FILENAME }])).to.deep.equal([
        { id: FILENAME, url: `https://media.codedang.com/${FILENAME}` }
      ])
    })
  })

  describe('deleteFromStorage', () => {
    it('should not throw when some deletions fail', async () => {
      const deleteFile = stub()
      deleteFile.withArgs(FILENAME).rejects(new Error('fail'))
      deleteFile.withArgs(OTHER_FILENAME).resolves()
      const service = new AttachmentService(createConfig([]), {
        deleteFile
      } as unknown as StorageService)

      await service.deleteFromStorage([FILENAME, OTHER_FILENAME])

      expect(deleteFile.calledTwice).to.be.true
    })
  })

  describe('assertNoStorageUrl', () => {
    const html = `<img src="https://media.codedang.com/${FILENAME}">`

    it('should allow storage URLs when the flag is off', () => {
      const service = new AttachmentService(
        createConfig(CDN_ENV),
        {} as StorageService
      )

      expect(() => service.assertNoStorageUrl([html])).not.to.throw()
    })

    it('should reject CDN and S3 URLs when the flag is on', () => {
      const service = new AttachmentService(
        createConfig([...CDN_ENV, ['ATTACHMENT_REJECT_STORAGE_URL', 'true']]),
        {} as StorageService
      )

      expect(() => service.assertNoStorageUrl([html])).to.throw(
        UnprocessableDataException
      )
      expect(() =>
        service.assertNoStorageUrl([
          `<img src="https://codedang-media.s3.ap-northeast-2.amazonaws.com/${FILENAME}">`
        ])
      ).to.throw(UnprocessableDataException)
      expect(() =>
        service.assertNoStorageUrl([`<img data-attachment-id="${FILENAME}">`])
      ).not.to.throw()
    })
  })
})
