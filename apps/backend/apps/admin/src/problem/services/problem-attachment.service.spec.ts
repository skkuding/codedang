import type { ConfigService } from '@nestjs/config'
import { FileStatus } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { AttachmentService } from '@libs/attachment'
import { UnprocessableDataException } from '@libs/exception'
import type { PrismaService } from '@libs/prisma'
import { ProblemAttachmentService } from './problem-attachment.service'

const PROBLEM_ID = 1
const USER_ID = 10

const createTx = (files: object[]) => ({
  file: {
    findMany: stub().resolves(files),
    updateMany: stub().callsFake(async ({ where }) => ({
      count: where.filename.in.length
    })),
    deleteMany: stub().resolves()
  }
})

const createService = () => {
  const attachmentService = {
    extractIds: stub().returns(['id-1']),
    extractStorageFilenames: stub().returns([]),
    diff: stub().returns({ added: ['b'], removed: ['a'] }),
    toUrl: stub().returns('https://media.codedang.com/id-1'),
    toAttachments: stub().returns([]),
    deleteFromStorage: stub().resolves(),
    findReferencedFilenames: stub().returns([]),
    findUuids: stub().returns([])
  }
  const service = new ProblemAttachmentService(
    {} as PrismaService,
    attachmentService as unknown as AttachmentService
  )
  return { service, attachmentService }
}

const file = (
  filename: string,
  status: FileStatus,
  createdById: number,
  problemId: number | null = null
) => ({ filename, status, createdById, problemId })

describe('ProblemAttachmentService', () => {
  describe('extractIds', () => {
    it('should pass only the attachment fields of a problem in a fixed order', () => {
      const { service, attachmentService } = createService()

      const ids = service.extractIds({
        outputDescription: '<p>output</p>',
        description: '<p>description</p>'
      })

      expect(ids).to.deep.equal(['id-1'])
      expect(attachmentService.extractIds.firstCall.args[0]).to.deep.equal([
        '<p>description</p>',
        undefined,
        '<p>output</p>'
      ])
    })
  })

  describe('attach', () => {
    it('should attach own temporary files and keep files of the same problem', async () => {
      const { service } = createService()
      const tx = createTx([
        file('temp', FileStatus.Temporary, USER_ID),
        file('kept', FileStatus.Attached, 99, PROBLEM_ID)
      ])

      await service.attach(tx as never, {
        problemId: PROBLEM_ID,
        userId: USER_ID,
        ids: ['temp', 'kept']
      })

      expect(tx.file.updateMany.calledOnce).to.be.true
      expect(tx.file.updateMany.firstCall.args[0]).to.deep.equal({
        where: {
          filename: { in: ['temp'] },
          status: FileStatus.Temporary,
          createdById: USER_ID
        },
        data: { status: FileStatus.Attached, problemId: PROBLEM_ID }
      })
    })

    const rejectedCases: [string, object[]][] = [
      ['a missing file', []],
      ["another user's temporary file", [file('id', FileStatus.Temporary, 99)]],
      [
        'a file attached to another problem',
        [file('id', FileStatus.Attached, USER_ID, 2)]
      ],
      ['an unmanaged file', [file('id', FileStatus.Unmanaged, USER_ID)]]
    ]

    rejectedCases.forEach(([name, files]) => {
      it(`should reject ${name}`, async () => {
        const { service } = createService()
        const tx = createTx(files)

        await expect(
          service.attach(tx as never, {
            problemId: PROBLEM_ID,
            userId: USER_ID,
            ids: ['id']
          })
        ).to.be.rejectedWith(UnprocessableDataException)
        expect(tx.file.updateMany.called).to.be.false
      })
    })

    it('should reject when a file was changed concurrently', async () => {
      const { service } = createService()
      const tx = createTx([file('temp', FileStatus.Temporary, USER_ID)])
      tx.file.updateMany = stub().resolves({ count: 0 })

      await expect(
        service.attach(tx as never, {
          problemId: PROBLEM_ID,
          userId: USER_ID,
          ids: ['temp']
        })
      ).to.be.rejectedWith(UnprocessableDataException)
    })

    it('should do nothing when there is no id', async () => {
      const { service } = createService()
      const tx = createTx([])

      await service.attach(tx as never, {
        problemId: PROBLEM_ID,
        userId: USER_ID,
        ids: []
      })

      expect(tx.file.findMany.called).to.be.false
    })
  })

  describe('assertAttachmentsReferencedById with the real extractor', () => {
    const MANAGED = '0f8fad5b-d9cb-469f-a165-70867728950e'
    const values = new Map([
      ['MEDIA_CDN_URL', 'https://media.codedang.com'],
      ['MEDIA_BUCKET_NAME', 'codedang-media'],
      ['MINIO_ENDPOINT_URL', 'https://minio.stage.codedang.com']
    ])
    const config = {
      get: (key: string) => values.get(key)
    } as unknown as ConfigService
    const service = new ProblemAttachmentService(
      {} as PrismaService,
      new AttachmentService(config, {} as never)
    )
    const managedTx = () => ({
      file: {
        findMany: stub().callsFake(async ({ where }) =>
          where.filename.in.includes(MANAGED) ? [{ filename: MANAGED }] : []
        )
      }
    })

    const bypassAttempts: [string, string][] = [
      [
        'srcset with a descriptor',
        `<img srcset="https://media.codedang.com/${MANAGED} 1x">`
      ],
      [
        'a later srcset candidate',
        `<img srcset="https://example.com/a.png 1x, https://media.codedang.com/${MANAGED} 2x">`
      ],
      [
        'a numeric character reference',
        `<img src="https://media.codedang.com/&#48;${MANAGED.slice(1)}">`
      ],
      [
        'named references in the scheme',
        `<img src="https&colon;&sol;&sol;media.codedang.com/${MANAGED}">`
      ],
      [
        'an upper-case host',
        `<img src="https://MEDIA.CODEDANG.COM/${MANAGED}">`
      ],
      [
        'a protocol-relative URL',
        `<img src="//media.codedang.com/${MANAGED}">`
      ],
      [
        'a percent-encoded path',
        `<img src="https://media.codedang.com/%30${MANAGED.slice(1)}">`
      ],
      [
        'a newline inside the URL',
        `<img src="https://media.codedang.com/${MANAGED.slice(0, 8)}&#10;${MANAGED.slice(8)}">`
      ],
      [
        'a style url()',
        `<div style="background:url('https://media.codedang.com/${MANAGED}')"></div>`
      ],
      [
        'an S3 path-style URL',
        `<img src="https://s3.ap-northeast-2.amazonaws.com/codedang-media/${MANAGED}">`
      ],
      [
        'an S3 dual-stack virtual-hosted URL',
        `<img src="https://codedang-media.s3.dualstack.ap-northeast-2.amazonaws.com/${MANAGED}">`
      ],
      [
        'an S3 dual-stack path-style URL',
        `<img src="https://s3.dualstack.ap-northeast-2.amazonaws.com/codedang-media/${MANAGED}">`
      ],
      [
        'a MinIO URL',
        `<a href="https://minio.stage.codedang.com/codedang-media/${MANAGED}">pdf</a>`
      ]
    ]

    bypassAttempts.forEach(([name, description]) => {
      it(`should reject a managed file referenced by ${name}`, async () => {
        await expect(
          service.assertAttachmentsReferencedById(managedTx() as never, {
            description
          })
        ).to.be.rejectedWith(UnprocessableDataException)
      })
    })

    it('should reject a managed file whose id is not in a rendered tag', async () => {
      for (const description of [
        `<!-- <img data-attachment-id="${MANAGED}"> -->`,
        `<p>${MANAGED}</p>`,
        `<img data-attachment-id="${MANAGED}"`
      ]) {
        await expect(
          service.assertAttachmentsReferencedById(managedTx() as never, {
            description
          })
        ).to.be.rejectedWith(UnprocessableDataException)
      }
    })

    it('should read ids the way a browser does, including unquoted quotes and encoding', async () => {
      const tx = managedTx()

      await service.assertAttachmentsReferencedById(tx as never, {
        description: `<img alt=don't data-attachment-id="${MANAGED}">`,
        inputDescription: `<img data-attachment-id="&#48;${MANAGED.slice(1)}" alt=x'>`
      })
      expect(tx.file.findMany.called).to.be.false
    })

    it('should allow UUIDs of unmanaged files in legacy bodies', async () => {
      const legacy = '7c9e6679-7425-40de-944b-e07fc1f90ae7'

      await service.assertAttachmentsReferencedById(managedTx() as never, {
        description: `<img alt=don't src="https://example.com/${legacy}">`
      })
    })

    it('should allow the same file referenced only by data-attachment-id', async () => {
      const tx = managedTx()

      await service.assertAttachmentsReferencedById(tx as never, {
        description: `<img data-attachment-id="${MANAGED}">`
      })
      expect(tx.file.findMany.called).to.be.false
    })
  })

  describe('assertAttachmentsReferencedById', () => {
    it('should reject URLs of temporary or attached files', async () => {
      const { service, attachmentService } = createService()
      attachmentService.extractStorageFilenames.returns(['managed', 'legacy'])
      const tx = createTx([{ filename: 'managed' }])

      await expect(
        service.assertAttachmentsReferencedById(tx as never, {
          description: '<img>'
        })
      ).to.be.rejectedWith(UnprocessableDataException)
      expect(tx.file.findMany.firstCall.args[0].where).to.deep.equal({
        filename: { in: ['managed', 'legacy'] },
        status: { in: [FileStatus.Temporary, FileStatus.Attached] }
      })
    })

    it('should allow URLs of unmanaged files', async () => {
      const { service, attachmentService } = createService()
      attachmentService.extractStorageFilenames.returns(['legacy'])
      const tx = createTx([])

      await service.assertAttachmentsReferencedById(tx as never, {
        description: '<img>'
      })
    })

    it('should not query when there is no storage URL', async () => {
      const { service } = createService()
      const tx = createTx([])

      await service.assertAttachmentsReferencedById(tx as never, {
        description: '<p>text</p>'
      })
      expect(tx.file.findMany.called).to.be.false
    })
  })

  describe('findDeletable', () => {
    it('should return attached files of the problem among the given ids', async () => {
      const { service } = createService()
      const tx = createTx([{ filename: 'removed' }])

      const result = await service.findDeletable(tx as never, PROBLEM_ID, [
        'removed',
        'unknown'
      ])

      expect(result).to.deep.equal(['removed'])
      expect(tx.file.findMany.firstCall.args[0].where).to.deep.equal({
        problemId: PROBLEM_ID,
        status: FileStatus.Attached,
        filename: { in: ['removed', 'unknown'] }
      })
      expect(tx.file.deleteMany.called).to.be.false
    })

    it('should return every attached file when ids are omitted', async () => {
      const { service } = createService()
      const tx = createTx([{ filename: 'a' }, { filename: 'b' }])

      const result = await service.findDeletable(tx as never, PROBLEM_ID)

      expect(result).to.deep.equal(['a', 'b'])
      expect(tx.file.findMany.firstCall.args[0].where).to.deep.equal({
        problemId: PROBLEM_ID,
        status: FileStatus.Attached
      })
    })

    it('should not query when the given ids are empty', async () => {
      const { service } = createService()
      const tx = createTx([])

      expect(
        await service.findDeletable(tx as never, PROBLEM_ID, [])
      ).to.deep.equal([])
      expect(tx.file.findMany.called).to.be.false
    })
  })

  describe('excludeReferenced', () => {
    it('should keep only filenames the fields no longer reference', () => {
      const { service, attachmentService } = createService()
      attachmentService.findReferencedFilenames.returns(['kept'])

      expect(
        service.excludeReferenced({ description: '<p></p>' }, [
          'kept',
          'removed'
        ])
      ).to.deep.equal(['removed'])
    })
  })

  describe('deleteRecords', () => {
    it('should delete only attached rows of the problem', async () => {
      const { service } = createService()
      const tx = createTx([])

      await service.deleteRecords(tx as never, PROBLEM_ID, ['removed'])

      expect(
        tx.file.deleteMany.calledOnceWithExactly({
          where: {
            problemId: PROBLEM_ID,
            status: FileStatus.Attached,
            filename: { in: ['removed'] }
          }
        })
      ).to.be.true
    })

    it('should skip when there is nothing to delete', async () => {
      const { service } = createService()
      const tx = createTx([])

      await service.deleteRecords(tx as never, PROBLEM_ID, [])

      expect(tx.file.deleteMany.called).to.be.false
    })
  })

  describe('diff / toUrl', () => {
    it('should delegate to AttachmentService', () => {
      const { service, attachmentService } = createService()

      expect(service.diff(['a'], ['b'])).to.deep.equal({
        added: ['b'],
        removed: ['a']
      })
      expect(service.toUrl('id-1')).to.equal('https://media.codedang.com/id-1')
      expect(attachmentService.diff.calledOnceWithExactly(['a'], ['b'])).to.be
        .true
      expect(attachmentService.toUrl.calledOnceWithExactly('id-1')).to.be.true
    })
  })

  describe('deleteFromStorage', () => {
    it('should skip storage when there is nothing to delete', async () => {
      const { service, attachmentService } = createService()

      await service.deleteFromStorage([])

      expect(attachmentService.deleteFromStorage.called).to.be.false
    })
  })
})
