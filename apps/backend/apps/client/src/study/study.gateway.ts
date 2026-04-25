import { Logger, UseGuards } from '@nestjs/common'
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  WsException
} from '@nestjs/websockets'
import type { Server, Socket } from 'socket.io'
import { JwtAuthGuard } from '@libs/auth'
import type { JoinPayload } from './interface/study-socket.interface'
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
export class StudyGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(StudyGateway.name)

  constructor(private readonly studyRoomService: StudyRoomService) {}

  afterInit(server: Server) {
    this.studyRoomService.setServer(server)
    this.logger.log('StudyGateway initialized')
  }

  async handleDisconnect(client: Socket) {
    await this.studyRoomService.handleDisconnect(client)
  }

  // Room
  @SubscribeMessage('room:join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinPayload
  ) {
    const { groupId } = this.parsePayload(client, payload?.groupId)
    return this.studyRoomService.join(client, groupId)
  }

  @SubscribeMessage('room:leave')
  async handleLeave(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId
    if (!userId) throw new WsException('Unauthorized')
    const groupId = client.data.groupId
    if (!groupId) throw new WsException('룸에 참여 중이 아닙니다.')

    return this.studyRoomService.leave(client, groupId)
  }

  private parsePayload(
    client: Socket,
    rawGroupId: unknown
  ): { userId: number; groupId: number } {
    const userId = client.data.userId
    if (!userId) throw new WsException('Unauthorized')

    const groupId = this.parsePositiveInt(rawGroupId)
    if (!groupId) throw new WsException('groupId must be a positive integer')

    return { userId, groupId }
  }

  private parsePositiveInt(value: unknown): number | null {
    const num = Number(value)
    if (!Number.isInteger(num) || num <= 0) return null
    return num
  }
}
