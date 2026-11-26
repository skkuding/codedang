import { Injectable, Logger } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'

export type AssignmentLifecycleEvent = {
  name:
    | 'assignment.created'
    | 'assignment.updated'
    | 'assignment.graded'
    | 'assignment.deleted'
  assignmentId: number
  dueTime?: Date
}

/** Publish only after commit. Delivery failures are logged, without durable retries. */
@Injectable()
export class AssignmentEventService {
  private readonly logger = new Logger(AssignmentEventService.name)

  constructor(private readonly emitter: EventEmitter2) {}

  async publish(events: AssignmentLifecycleEvent[]) {
    for (const event of events) {
      const payload =
        event.name === 'assignment.deleted'
          ? event.assignmentId
          : {
              assignmentId: event.assignmentId,
              ...(event.dueTime ? { dueTime: event.dueTime } : {})
            }
      try {
        await this.emitter.emitAsync(event.name, payload)
      } catch (error) {
        this.logger.error(
          'Assignment event delivery failed after commit',
          error
        )
      }
    }
  }
}
