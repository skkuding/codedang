import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UnprocessableDataException } from '@libs/exception'
import { StorageService } from '@libs/storage'
import { readHtmlAttributes } from './html-attributes'
import { type Attachment, buildAttachments, buildMediaUrl } from './media-url'
import {
  type StorageLocation,
  decodeCharacterReferences,
  findUrlCandidates,
  normalizeForFilenameSearch,
  toStorageKey,
  toStorageLocation
} from './storage-url'

const ATTACHMENT_ID_ATTRIBUTE = 'data-attachment-id'
const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g

// Endpoints that serve the media bucket, in virtual-hosted and path styles
const S3_HOSTS = [
  's3.ap-northeast-2.amazonaws.com',
  's3.dualstack.ap-northeast-2.amazonaws.com',
  's3-ap-northeast-2.amazonaws.com',
  's3.amazonaws.com'
]

@Injectable()
export class AttachmentService {
  private readonly logger = new Logger(AttachmentService.name)

  constructor(
    private readonly config: ConfigService,
    private readonly storageService: StorageService
  ) {}

  /**
   * Reads data-attachment-id only from attributes of start tags, so the same
   * text inside body content or another attribute's value is ignored.
   */
  extractIds(htmls: Array<string | null | undefined>): string[] {
    const ids = new Set<string>()
    for (const { name, value } of this.readAttributes(htmls)) {
      if (name === ATTACHMENT_ID_ATTRIBUTE && value) ids.add(value)
    }
    return [...ids]
  }

  /**
   * Returns filenames of our media storage referenced by URL in tag
   * attributes (e.g. img src/srcset, file node href, style url()).
   */
  extractStorageFilenames(htmls: Array<string | null | undefined>): string[] {
    const locations = this.getStorageLocations()
    const filenames = new Set<string>()
    for (const { name, value } of this.readAttributes(htmls)) {
      for (const candidate of findUrlCandidates(name, value)) {
        const filename = toStorageKey(candidate, locations)
        if (filename) filenames.add(filename)
      }
    }
    return [...filenames]
  }

  /**
   * Returns the filenames that still appear anywhere in the HTML. Used as a
   * last check before deleting files, so a reference the parsers miss keeps
   * its file instead of losing it.
   */
  findReferencedFilenames(
    htmls: Array<string | null | undefined>,
    filenames: string[]
  ): string[] {
    if (!filenames.length) return []
    const text = htmls
      .filter((html): html is string => !!html)
      .map(normalizeForFilenameSearch)
      .join('\n')
    return filenames.filter((filename) => text.includes(filename.toLowerCase()))
  }

  /**
   * Returns every UUID written anywhere in the HTML, in lower case, after the
   * same normalization as findReferencedFilenames.
   */
  findUuids(htmls: Array<string | null | undefined>): string[] {
    const uuids = new Set<string>()
    for (const html of htmls) {
      if (!html) continue
      for (const [uuid] of normalizeForFilenameSearch(html).matchAll(
        UUID_PATTERN
      )) {
        uuids.add(uuid)
      }
    }
    return [...uuids]
  }

  diff(
    prevIds: string[],
    nextIds: string[]
  ): { added: string[]; removed: string[] } {
    const prev = new Set(prevIds)
    const next = new Set(nextIds)
    return {
      added: [...next].filter((id) => !prev.has(id)),
      removed: [...prev].filter((id) => !next.has(id))
    }
  }

  toUrl(filename: string): string {
    return buildMediaUrl(this.config, filename)
  }

  toAttachments(files: Array<{ filename: string }> = []): Attachment[] {
    return buildAttachments(this.config, files)
  }

  async deleteFromStorage(filenames: string[]): Promise<void> {
    const results = await Promise.allSettled(
      filenames.map((filename) => this.storageService.deleteFile(filename))
    )
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `Failed to delete attachment ${filenames[index]} from storage`,
          result.reason
        )
      }
    })
  }

  /**
   * Throws when ATTACHMENT_REJECT_STORAGE_URL is "true" and any HTML
   * contains a public media URL instead of a data-attachment-id.
   */
  assertNoStorageUrl(htmls: Array<string | null | undefined>): void {
    if (this.config.get<string>('ATTACHMENT_REJECT_STORAGE_URL') !== 'true') {
      return
    }

    if (this.extractStorageFilenames(htmls).length) {
      throw new UnprocessableDataException(
        'Attachments must be referenced by data-attachment-id, not by URL'
      )
    }
  }

  private *readAttributes(
    htmls: Array<string | null | undefined>
  ): Generator<{ name: string; value: string }> {
    for (const html of htmls) {
      if (!html) continue
      for (const { name, value } of readHtmlAttributes(html)) {
        yield { name, value: decodeCharacterReferences(value).trim() }
      }
    }
  }

  private getStorageLocations(): StorageLocation[] {
    const bucket = this.config.get<string>('MEDIA_BUCKET_NAME')
    const cdnUrl = this.config.get<string>('MEDIA_CDN_URL')
    const endpoint = this.config.get<string>('MINIO_ENDPOINT_URL')

    return [
      cdnUrl ? toStorageLocation(cdnUrl) : null,
      endpoint && bucket ? toStorageLocation(endpoint, `/${bucket}/`) : null,
      ...(bucket
        ? S3_HOSTS.flatMap((host) => [
            { host: `${bucket}.${host}`, pathPrefix: '/' },
            { host, pathPrefix: `/${bucket}/` }
          ])
        : [])
    ].filter((location): location is StorageLocation => !!location)
  }
}
