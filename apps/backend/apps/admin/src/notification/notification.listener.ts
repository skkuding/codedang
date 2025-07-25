import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

@Injectable()
export class NotificationListener {
  @OnEvent('problem.created', { async: true })
  handleNotificationCreated(payload) {
    console.log(payload)
  }
}
