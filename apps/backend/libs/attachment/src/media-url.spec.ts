import type { ConfigService } from '@nestjs/config'
import { expect } from 'chai'
import { buildMediaUrl } from './media-url'

const createConfig = (env: [string, string][]) => {
  const values = new Map(env)
  return { get: (key: string) => values.get(key) } as unknown as ConfigService
}

const FILENAME = '0f8fad5b-d9cb-469f-a165-70867728950e'

describe('buildMediaUrl', () => {
  it('should return a CDN URL when MEDIA_CDN_URL is set', () => {
    const config = createConfig([
      ['MEDIA_CDN_URL', 'https://media.codedang.com'],
      ['MINIO_ENDPOINT_URL', 'http://127.0.0.1:9000'],
      ['MEDIA_BUCKET_NAME', 'codedang-media']
    ])

    expect(buildMediaUrl(config, FILENAME)).to.equal(
      `https://media.codedang.com/${FILENAME}`
    )
  })

  it('should strip trailing slashes from MEDIA_CDN_URL', () => {
    const config = createConfig([
      ['MEDIA_CDN_URL', 'https://media.codedang.com//'],
      ['MEDIA_BUCKET_NAME', 'codedang-media']
    ])

    expect(buildMediaUrl(config, FILENAME)).to.equal(
      `https://media.codedang.com/${FILENAME}`
    )
  })

  it('should return a MinIO URL when only MINIO_ENDPOINT_URL is set', () => {
    const config = createConfig([
      ['MINIO_ENDPOINT_URL', 'http://127.0.0.1:9000'],
      ['MEDIA_BUCKET_NAME', 'codedang-media']
    ])

    expect(buildMediaUrl(config, FILENAME)).to.equal(
      `http://127.0.0.1:9000/codedang-media/${FILENAME}`
    )
  })

  it('should return an S3 URL when no endpoint is set', () => {
    const config = createConfig([['MEDIA_BUCKET_NAME', 'codedang-media']])

    expect(buildMediaUrl(config, FILENAME)).to.equal(
      `https://codedang-media.s3.ap-northeast-2.amazonaws.com/${FILENAME}`
    )
  })
})
