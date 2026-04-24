import { Logger, UseGuards } from '@nestjs/common'
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  WsException
} from '@nestjs/websockets'
import type { Server, Socket } from 'socket.io'
import { JwtAuthGuard } from '@libs/auth'
import type {
  JoinPayload,
  LeavePayload
} from './interface/study-socket.interface'
import { StudyRoomService } from './study-room.service'

@UseGuards(JwtAuthGuard)
@WebSocketGateway({
  namespace: 'study',
  cors: {
    // TODO 실제 서버 환경에 맞는 'cors' RedisIoAdapter 내부에 설정
    // origin: ['ws://localhost:3002/api/room']
    origin: true,
    credentials: true
  }
})
export class StudyGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(StudyGateway.name)

  constructor(private readonly studyRoomService: StudyRoomService) {}

  afterInit(server: Server) {
    this.studyRoomService.setServer(server)
    this.logger.log('✅ StudyGateway initialized')
  }

  // 클라이언트 연결
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: socketId=${client.id}`)
  }

  // 클라이언트 연결 해제
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: socketId=${client.id}`)
  }

  // Room
  @SubscribeMessage('room:join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinPayload
  ) {
    const userId = client.data.user?.id ?? client.data.userId
    if (!userId) throw new WsException('Unauthorized')

    console.log(`🔥 room:join 시작: userId=${userId}`)

    const groupId = this.parsePositiveInt(payload?.groupId)
    if (!groupId) throw new WsException('groupId must be a positive integer')

    return this.studyRoomService.join(client, groupId)
  }

  @SubscribeMessage('room:leave')
  async handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: LeavePayload
  ) {
    const userId = client.data.user?.id ?? client.data.userId
    if (!userId) throw new WsException('Unauthorized')

    const groupId = this.parsePositiveInt(payload?.groupId)
    if (!groupId) throw new WsException('groupId must be a positive integer')
    console.log(`🔥 room:leave 시작: userId=${client.data.userId}`)
    return this.studyRoomService.leave(client, groupId)
  }

  // ✅ 연결 확인용 ping
  // @SubscribeMessage('ping')
  // handlePing(@ConnectedSocket() client: Socket, @MessageBody() data: unknown) {
  //   this.logger.log(`Ping from ${client.id}`)
  //   return { event: 'pong', data: '✅ Gateway connected!' }
  // }

  private parsePositiveInt(value: unknown): number | null {
    const num = Number(value)
    if (!Number.isInteger(num) || num <= 0) return null
    return num
  }
}
