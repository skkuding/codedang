import type { ConfigService } from '@nestjs/config'

/**
 * Returns the public URL of a media object.
 *
 * MEDIA_CDN_URL (e.g. https://media.codedang.com) takes precedence when set.
 * MINIO_ENDPOINT_URL is required only when accessing MINIO (stage, local).
 * Otherwise the default S3 endpoint is used.
 */
export const buildMediaUrl = (config: ConfigService, filename: string) => {
  const cdnUrl = config.get<string>('MEDIA_CDN_URL')
  if (cdnUrl) {
    return `${cdnUrl.replace(/\/+$/, '')}/${filename}`
  }

  const endpoint = config.get<string>('MINIO_ENDPOINT_URL')
  const bucket = config.get<string>('MEDIA_BUCKET_NAME')
  return endpoint
    ? `${endpoint}/${bucket}/${filename}`
    : `https://${bucket}.s3.ap-northeast-2.amazonaws.com/${filename}`
}
