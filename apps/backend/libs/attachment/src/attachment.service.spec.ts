import type { ConfigService } from '@nestjs/config'
import { expect } from 'chai'
import type { StorageService } from '@libs/storage'
import { AttachmentService } from './attachment.service'
import { buildMediaUrl } from './media-url'

const createConfig = (env: [string, string][]) => {
  const values = new Map(env)
  return { get: (key: string) => values.get(key) } as unknown as ConfigService
}

const FILENAME = '0f8fad5b-d9cb-469f-a165-70867728950e'

describe('AttachmentService', () => {
  describe('toUrl', () => {
    it('should return the same URL as buildMediaUrl', () => {
      const config = createConfig([
        ['MEDIA_CDN_URL', 'https://media.codedang.com'],
        ['MEDIA_BUCKET_NAME', 'codedang-media']
      ])
      const service = new AttachmentService(config, {} as StorageService)

      expect(service.toUrl(FILENAME)).to.equal(buildMediaUrl(config, FILENAME))
      expect(service.toUrl(FILENAME)).to.equal(
        `https://media.codedang.com/${FILENAME}`
      )
    })
  })
})
