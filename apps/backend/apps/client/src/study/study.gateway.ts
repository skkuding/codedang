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
    origin:
      process.env.APP_ENV === 'production' || process.env.APP_ENV === 'stage'
        ? true
        : [
            /^https:\/\/\d+\.preview\.codedang\.com$/, // preview
            /^http:\/\/localhost(:\d+)?$/ // local
          ],
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
    const groupId = this.parseGroupId(payload?.groupId)
    return this.studyRoomService.join(client, groupId)
  }

  @SubscribeMessage('room:leave')
  async handleLeave(@ConnectedSocket() client: Socket) {
    this.assertInRoom(client)
    return this.studyRoomService.leave(client)
  }

  private parseGroupId(rawGroupId: unknown): number {
    const groupId = Number(rawGroupId)

    if (!Number.isInteger(groupId) || groupId <= 0)
      throw new WsException('groupId must be a positive integer')

    return groupId
  }

  private assertInRoom(client: Socket): void {
    if (!client.data.room?.groupId)
      throw new WsException('룸에 참여 중이 아닙니다.')
  }
}
