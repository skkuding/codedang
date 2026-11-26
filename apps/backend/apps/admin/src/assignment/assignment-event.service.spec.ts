import { EventEmitter2 } from '@nestjs/event-emitter'
import { expect } from 'chai'
import { AssignmentEventService } from './assignment-event.service'

describe('AssignmentEventService', () => {
  it('publishes deleted assignments as numeric IDs', async () => {
    const emitter = new EventEmitter2()
    const received: unknown[] = []
    emitter.on('assignment.deleted', (payload) => received.push(payload))

    await new AssignmentEventService(emitter).publish([
      { name: 'assignment.deleted', assignmentId: 42 }
    ])

    expect(received).to.deep.equal([42])
  })

  it('omits absent dueTime and awaits each asynchronous listener', async () => {
    const emitter = new EventEmitter2()
    const received: unknown[] = []
    emitter.on('assignment.graded', async (payload) => {
      await Promise.resolve()
      received.push(payload)
    })
    const dueTime = new Date('2027-01-02')
    emitter.on('assignment.updated', (payload) => received.push(payload))

    await new AssignmentEventService(emitter).publish([
      { name: 'assignment.graded', assignmentId: 42 },
      { name: 'assignment.updated', assignmentId: 43, dueTime }
    ])

    expect(received).to.deep.equal([
      { assignmentId: 42 },
      { assignmentId: 43, dueTime }
    ])
  })
})
