import { expect } from 'chai'
import { stub } from 'sinon'
import { MAX_DATE, MILLISECONDS_PER_DAY } from '@libs/constants'
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

describe('Independent assignment creation notifications and reminders', () => {
  for (const failure of ['none', 'notification', 'reminder', 'both']) {
    it(`attempts all deliveries and reports their failures: ${failure}`, async () => {
      const notificationError = new Error('notification failed')
      const reminderError = new Error('reminder failed')
      const notifications = { notifyAssignmentCreated: stub().resolves() }
      const scheduler = { scheduleJob: stub().resolves() }
      const errors: Error[] = []
      if (failure === 'notification' || failure === 'both') {
        notifications.notifyAssignmentCreated.rejects(notificationError)
        errors.push(notificationError)
      }
      if (failure === 'reminder' || failure === 'both') {
        scheduler.scheduleJob.onFirstCall().rejects(reminderError)
        errors.push(reminderError)
      }
      const listener = new NotificationListener(
        notifications as unknown as NotificationService,
        scheduler as unknown as NotificationScheduler
      )
      const delivery = listener.handleAssignmentCreated({
        assignmentId: 42,
        dueTime: new Date(Date.now() + 3 * MILLISECONDS_PER_DAY)
      })
      if (errors.length) {
        const error = await delivery.then(
          () => {
            throw new Error('Expected delivery to fail')
          },
          (error: AggregateError) => error
        )
        expect(error).to.be.instanceOf(AggregateError)
        expect(error.errors).to.deep.equal(errors)
      } else await delivery
      expect(
        notifications.notifyAssignmentCreated.calledOnceWithExactly(42)
      ).to.equal(true)
      expect(scheduler.scheduleJob.callCount).to.equal(2)
      expect(scheduler.scheduleJob.firstCall.args[2]).to.equal(
        'assignment:42:due-reminder:1d'
      )
      expect(scheduler.scheduleJob.secondCall.args[2]).to.equal(
        'assignment:42:due-reminder:3h'
      )
    })
  }

  for (const dueTime of [MAX_DATE, new Date('2000-01-01')]) {
    it(`delivers the notification without reminders for deadline ${dueTime.toISOString()}`, async () => {
      const notifications = { notifyAssignmentCreated: stub().resolves() }
      const scheduler = { scheduleJob: stub().resolves() }
      const listener = new NotificationListener(
        notifications as unknown as NotificationService,
        scheduler as unknown as NotificationScheduler
      )
      await listener.handleAssignmentCreated({ assignmentId: 42, dueTime })
      expect(
        notifications.notifyAssignmentCreated.calledOnceWithExactly(42)
      ).to.equal(true)
      expect(scheduler.scheduleJob.called).to.equal(false)
    })
  }
})
