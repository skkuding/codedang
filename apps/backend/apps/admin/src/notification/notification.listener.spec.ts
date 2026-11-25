import { expect } from 'chai'
import { stub } from 'sinon'
import { NotificationListener } from './notification.listener'
import type { NotificationScheduler } from './notification.scheduler'
import type { NotificationService } from './notification.service'

describe('Committed assignment grade notifications', () => {
  it('delivers grade publication without rescheduling due reminders', async () => {
    const notifications = { notifyAssignmentGraded: stub().resolves() }
    const scheduler = { cancelScheduledJob: stub(), scheduleJob: stub() }
    const listener = new NotificationListener(
      notifications as unknown as NotificationService,
      scheduler as unknown as NotificationScheduler
    )
    await listener.handleAssignmentGraded({ assignmentId: 42 })
    expect(
      notifications.notifyAssignmentGraded.calledOnceWithExactly(42)
    ).to.equal(true)
    expect(scheduler.cancelScheduledJob.called).to.equal(false)
    expect(scheduler.scheduleJob.called).to.equal(false)
  })

  it('propagates grade delivery failures to the event emitter', async () => {
    const notifications = {
      notifyAssignmentGraded: stub().rejects(new Error('delivery failed'))
    }
    const listener = new NotificationListener(
      notifications as unknown as NotificationService,
      {} as NotificationScheduler
    )
    await expect(
      listener.handleAssignmentGraded({ assignmentId: 42 })
    ).to.be.rejectedWith('delivery failed')
  })
})
