import { expect } from 'chai'
import { stub } from 'sinon'
import type { AttachmentService } from '@libs/attachment'
import { ProblemAttachmentService } from './problem-attachment.service'

const createService = () => {
  const attachmentService = {
    extractIds: stub().returns(['id-1']),
    toUrl: stub().returns('https://media.codedang.com/id-1')
  }
  const service = new ProblemAttachmentService(
    attachmentService as unknown as AttachmentService
  )
  return { service, attachmentService }
}

describe('ProblemAttachmentService', () => {
  describe('toUrl', () => {
    it('should delegate to AttachmentService', () => {
      const { service, attachmentService } = createService()

      expect(service.toUrl('id-1')).to.equal('https://media.codedang.com/id-1')
      expect(attachmentService.toUrl.calledOnceWithExactly('id-1')).to.be.true
    })
  })

  describe('extractIds', () => {
    it('should pass only the attachment fields of a problem in a fixed order', () => {
      const { service, attachmentService } = createService()

      const ids = service.extractIds({
        outputDescription: '<p>output</p>',
        description: '<p>description</p>'
      })

      expect(ids).to.deep.equal(['id-1'])
      expect(attachmentService.extractIds.calledOnce).to.be.true
      expect(attachmentService.extractIds.firstCall.args[0]).to.deep.equal([
        '<p>description</p>',
        undefined,
        '<p>output</p>'
      ])
    })
  })
})
