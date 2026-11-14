import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { CopyObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { expect } from 'chai'
import { stub, type SinonStub } from 'sinon'
import { S3Provider } from './s3.provider'
import { StorageService } from './storage.service'

describe('StorageService', () => {
  let service: StorageService
  let client: S3Client
  let config: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService, S3Provider, ConfigService]
    }).compile()

    service = module.get<StorageService>(StorageService)
    client = module.get<S3Client>(S3Client)
    config = module.get<ConfigService>(ConfigService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('copyFile', () => {
    beforeEach(() => {
      ;(stub(config, 'get') as SinonStub)
        .withArgs('MEDIA_BUCKET_NAME')
        .returns('media-bucket')
    })

    it('should copy the object within the media bucket', async () => {
      const send = stub(client, 'send').resolves({})

      await service.copyFile('source-uuid', 'target-uuid')

      expect(send.calledOnce).to.be.true
      const command = send.firstCall.args[0] as CopyObjectCommand
      expect(command).to.be.instanceOf(CopyObjectCommand)
      expect(command.input).to.deep.equal({
        Bucket: 'media-bucket',
        Key: 'target-uuid',
        CopySource: 'media-bucket/source-uuid'
      })
    })

    it('should URL-encode the source key', async () => {
      const send = stub(client, 'send').resolves({})

      await service.copyFile('a b?c', 'target-uuid')

      const command = send.firstCall.args[0] as CopyObjectCommand
      expect(command.input.CopySource).to.equal('media-bucket/a%20b%3Fc')
    })

    it('should propagate errors from S3', async () => {
      stub(client, 'send').rejects(new Error('NoSuchKey'))

      await expect(
        service.copyFile('missing-uuid', 'target-uuid')
      ).to.be.rejectedWith('NoSuchKey')
    })
  })
})
