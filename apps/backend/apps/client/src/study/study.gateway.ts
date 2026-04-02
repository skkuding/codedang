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

  // ✅ Gateway 초기화 완료 확인용
  // afterInit() {
  //   this.logger.log('✅ StudyGateway initialized')
  // }

  // 클라이언트 연결
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
  }

  // 클라이언트 연결 해제
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
  }

  // ✅ 연결 확인용 ping
  // @SubscribeMessage('ping')
  // handlePing(@ConnectedSocket() client: Socket, @MessageBody() data: unknown) {
  //   this.logger.log(`Ping from ${client.id}`)
  //   return { event: 'pong', data: '✅ Gateway connected!' }
  // }
}
