import { Inject, Injectable, Logger } from '@nestjs/common'
import type Redis from 'ioredis'
import type { Server, Socket } from 'socket.io'
import { REDIS_CLIENT } from '@libs/redis'
import {
  roomKey,
  membersKey,
  SESSION_DURATION_MS,
  type RoomState,
  type RoomMember,
  type JoinResponse,
  type SocketResponse
} from './interface/study-socket.interface'
import { StudyService } from './study.service'

@Injectable()
export class StudyRoomService {
  private readonly logger = new Logger(StudyRoomService.name)
  private server: Server

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly studyService: StudyService
  ) {}

  setServer(server: Server): void {
    this.server = server
  }

  /**
   * 사용자 WebSocket을 스터디 룸에 입장시킨다.
   *
   * 1. 사용자의 그룹 참여 권한 검증
   * 2. 재연결 복구 확인
   * 3. socket.data에 사용자 메타데이터 저장하고 room에 join()
   * 4. Redis에서 룸 상태 생성 또는 조회
   * 5. 세션 종료 여부 검증
   * 6. Redis에 멤버 등록하고 전체 멤버 조회
   * 7. 첫번째 입장이면 room:started 이벤트 브로드케스트
   *    그외 입장이면 room:participantsChanged 이벤트 emit
   * 8. 클라이언트에 현재 룸 상태 반환
   *
   * @param client 연결된 Socket 인스턴스
   * @param groupId 스터디 그룹 ID
   * @returns 현재 룸 상태
   */
  async join(
    client: Socket,
    groupId: number
  ): Promise<SocketResponse<JoinResponse>> {
    const userId: number = client.data.userId
    const membership = await this.studyService.validateJoinableStudyGroup(
      groupId,
      userId
    )

    // TODO: reconnect 확인

    client.data = {
      ...client.data,
      userName: membership.userName,
      isLeader: membership.isLeader,
      groupId
    }
    client.join(roomKey(groupId))

    const now = Date.now()
    const { state, isFirst } = await this.initOrGetRoom(groupId, userId, now)

    if (!state || now >= state.endAt) {
      client.leave(roomKey(groupId))
      return { success: false, message: '세션이 이미 종료되었습니다.' }
    }

    await this.addMember(groupId, userId, {
      userId,
      userName: membership.userName,
      isLeader: membership.isLeader,
      joinedAt: now
    })

    const members = await this.getMembers(groupId)

    if (isFirst) this.onFirstJoin(groupId, state, members)
    else this.onSubsequentJoin(client, groupId, members)

    return {
      success: true,
      data: {
        members,
        startedAt: state.startedAt,
        endAt: state.endAt,
        remainMs: state.endAt - now,
        hostUserId: state.hostUserId
      }
    }
  }

  /**
   * 스터디 룸을 생성하거나 기존 상태를 조회한다.
   *
   * 1. 현재 시간을 기준으로 RoomState 상태를 생성
   * 2. Redis에 SET NX로 roomKey 저장 시도
   * 3. 2의 결과 여부에 따라 State를 설정하여 isFirst와 함께 반환
   *    - 성공이면, 첫번째 입장자로 -> 생성한 activeState 사용
   *    - 실패이면, 이후 입장자로 -> Redis에서 기존 상태를 조회하여 사용
   *
   * @param groupId 스터디 그룹 ID
   * @param userId 현재 사용자 ID
   * @param now 현재 시간
   * @returns 룸 상태값, 사용자의 입장이 첫번째인지
   */
  private async initOrGetRoom(
    groupId: number,
    userId: number,
    now: number
  ): Promise<{ state: RoomState | null; isFirst: boolean }> {
    const activeState: RoomState = {
      startedAt: now,
      endAt: now + SESSION_DURATION_MS,
      hostUserId: userId
    }

    const isFirst = !!(await this.redis.set(
      roomKey(groupId),
      JSON.stringify(activeState),
      'NX'
    ))

    // isFirst가 ok이면 첫번째 / null이면 이미 룸 존재
    const state = isFirst ? activeState : await this.getRoomState(groupId)
    return { state, isFirst }
  }

  /**
   * 첫 번째 사용자가 룸을 생성했을 때 타이머를 시작하고 룸 전체에 room:started 브로드캐스트합니다.
   *
   * @param groupId 스터디 그룹 ID
   * @param state 룸 상태
   * @param members 현재 참여자 목록
   */
  private async onFirstJoin(
    groupId: number,
    state: RoomState,
    members: RoomMember[]
  ): Promise<void> {
    // 첫 번째: 타이머 시작 + 룸 전체(본인 포함)에 started emit

    // TODO: await this.scheduleJobs()

    this.server.to(roomKey(groupId)).emit('room:started', {
      startedAt: state.startedAt,
      endAt: state.endAt,
      members
    })

    this.logger.log(
      `room start🚀 : groupId=${groupId}, endAt=${new Date(state.endAt).toISOString()}`
    )
  }

  /**
   * 두 번째 이후 사용자가 들어왔을 때 기존 참여자에게 새로운 참여자 입장을 알립니다.
   *
   * @param client 현재 소켓
   * @param groupId 스터디 그룹 ID
   * @param members 최신 참여자 목록
   */
  private onSubsequentJoin(
    client: Socket,
    groupId: number,
    members: RoomMember[]
  ): void {
    client.to(roomKey(groupId)).emit('room:participantsChanged', { members })
  }

  // Redis
  /**
   * Redis에서 룸 상태를 조회합니다.
   *
   * @param groupId 스터디 그룹 ID
   * @returns 룸 상태값 | null
   */
  private async getRoomState(groupId: number): Promise<RoomState | null> {
    const raw = await this.redis.get(roomKey(groupId))
    return raw ? (JSON.parse(raw) as RoomState) : null
  }

  /**
   * Redis Hash에 소켓 기준으로 멤버를 추가합니다.
   *
   * @param groupId 스터디 그룹 ID
   * @param userId 사용자 ID
   * @param member 저장할 멤버 정보
   */
  private async addMember(
    groupId: number,
    userId: number,
    member: RoomMember
  ): Promise<void> {
    await this.redis.hset(
      membersKey(groupId),
      String(userId),
      JSON.stringify(member)
    )
  }

  /**
   * Redis Hash에 저장된 모든 멤버를 조회합니다.
   *
   * @param groupId 스터디 그룹 ID
   * @returns 스터디 룸에 있는 모든 멤버들
   */
  async getMembers(groupId: number): Promise<RoomMember[]> {
    const raw = await this.redis.hgetall(membersKey(groupId))
    if (!raw) return []
    return Object.values(raw).map((v) => JSON.parse(v) as RoomMember)
  }
}
