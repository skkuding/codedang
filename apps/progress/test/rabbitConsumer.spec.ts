import type amqp from 'amqplib'
import { expect } from 'chai'
import * as sinon from 'sinon'
import { handleMessage, toProgressEvent } from '../src/rabbitConsumer'

const message = (
  content: unknown,
  properties: Partial<amqp.MessageProperties> = {}
) =>
  ({
    content: Buffer.from(
      typeof content === 'string' ? content : JSON.stringify(content)
    ),
    properties: { type: 'progress', messageId: '42', ...properties },
    fields: {}
  }) as unknown as amqp.ConsumeMessage

const fakeChannel = () => {
  const ack = sinon.stub()
  const nack = sinon.stub()
  const channel = { ack, nack } as unknown as amqp.Channel
  return { channel, ack, nack }
}

const validPayload = { total: 3, current: 1, statusCode: 0 }

describe('rabbitConsumer', () => {
  describe('toProgressEvent', () => {
    it('should read the submission id from messageId', () => {
      expect(toProgressEvent(message(validPayload))).to.deep.equal({
        submissionId: 42,
        ...validPayload
      })
    })

    for (const messageId of ['abc', '0', '-1', undefined]) {
      it(`should reject messageId ${messageId}`, () => {
        expect(toProgressEvent(message(validPayload, { messageId }))).to.be.null
      })
    }

    it('should reject an invalid payload', () => {
      expect(toProgressEvent(message({ total: 3 }))).to.be.null
    })
  })

  describe('handleMessage', () => {
    it('should ack and forward a valid progress message', () => {
      const { channel, ack, nack } = fakeChannel()
      const onProgress = sinon.spy()
      const raw = message(validPayload)

      handleMessage(channel, raw, onProgress)

      expect(onProgress.calledOnceWith({ submissionId: 42, ...validPayload }))
        .to.be.true
      expect(ack.calledOnceWith(raw)).to.be.true
      expect(nack.called).to.be.false
    })

    it('should ack and skip messages of other types', () => {
      const { channel, ack } = fakeChannel()
      const onProgress = sinon.spy()

      handleMessage(
        channel,
        message(validPayload, { type: 'result' }),
        onProgress
      )

      expect(onProgress.called).to.be.false
      expect(ack.calledOnce).to.be.true
    })

    const invalidMessages: [string, amqp.ConsumeMessage][] = [
      ['an invalid payload', message({ total: 3 })],
      ['malformed JSON', message('{not json')]
    ]

    for (const [name, raw] of invalidMessages) {
      it(`should nack without requeue on ${name}`, () => {
        const { channel, nack } = fakeChannel()
        const onProgress = sinon.spy()

        handleMessage(channel, raw, onProgress)

        expect(onProgress.called).to.be.false
        expect(nack.calledOnceWith(raw, false, false)).to.be.true
      })
    }

    it('should nack when the handler throws', () => {
      const { channel, ack, nack } = fakeChannel()
      const raw = message(validPayload)

      handleMessage(channel, raw, () => {
        throw new Error('boom')
      })

      expect(nack.calledOnceWith(raw, false, false)).to.be.true
      expect(ack.called).to.be.false
    })

    it('should not throw when the channel is already closed', () => {
      const { channel, ack } = fakeChannel()
      ack.throws(new Error('channel closed'))

      expect(() =>
        handleMessage(channel, message(validPayload), sinon.spy())
      ).to.not.throw()
    })
  })
})
