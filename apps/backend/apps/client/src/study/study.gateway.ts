import { Logger } from '@nestjs/common'
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets'
import type { Server, Socket } from 'socket.io'

// TODO 실제 서버 환경에 맞는 'cors' RedisIoAdapter 내부에 설정
@WebSocketGateway({
  namespace: 'study',
  cors: { origin: true, credentials: true }
})
export class StudyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(StudyGateway.name)

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
  }
}
