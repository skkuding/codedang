import { InjectQueue } from '@nestjs/bullmq'
import { Inject, Injectable, Logger } from '@nestjs/common'
import type { Queue } from 'bullmq'
import type Redis from 'ioredis'
import type { Server, Socket } from 'socket.io'
import { REDIS_CLIENT } from '@libs/redis'
import {
  roomKey,
  reconnectKey,
  membersKey,
  SESSION_DURATION_MS,
  RECONNECT_GRACE_SEC,
  REMINDER_BEFORE_END_MS,
  BUFFER_SEC,
  type RoomState,
  type RoomMember,
  type JoinResponse,
  type SocketResponse
} from './interface/study-socket.interface'
import { StudyService } from './study.service'

export const STUDY_ROOM_QUEUE = 'study-room'
export const JOB_RECONNECT_EXPIRE = 'reconnect-expire'
export const JOB_ROOM_REMINDER = 'room-reminder'
export const JOB_ROOM_END = 'room-end'

@Injectable()
export class StudyRoomService {
  private readonly logger = new Logger(StudyRoomService.name)
  private server!: Server

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @InjectQueue(STUDY_ROOM_QUEUE) private readonly queue: Queue,
    private readonly studyService: StudyService
  ) {}

  setServer(server: Server): void {
    this.server = server
  }

  /**
   * 사용자 WebSocket을 스터디 룸에 입장시킵니다.
   *
   * 1. Redis 기준으로 사용자의 그룹 입장 가능 여부 확인
   * 2. 사용자의 스터디 그룹 참여 권한 검증
   * 3. Redis에서 룸 상태 생성 또는 기존 상태 조회하고 유효성 검증
   * 4. Socket.IO 룸 입장 및 Redis 멤버 정보 등록
   * 5. 입장 케이스에 따라 이벤트 emit
   *    - 첫 번째 입장이면 room:started 이벤트 브로드캐스트
   *    - 재연결 입장이면 room:participantReconnected 이벤트 emit
   *    - 그 외 입장이면 room:participantsChanged 이벤트 emit
   * 6. 클라이언트에 현재 룸 상태 반환
   *
   * @param {Socket} client 연결된 Socket 인스턴스
   * @param {number} groupId 스터디 그룹 ID
   * @returns 입장 처리 결과와 현재 룸 상태
   */
  async join(
    client: Socket,
    groupId: number
  ): Promise<SocketResponse<JoinResponse>> {
    const userId: number = client.data.userId

    const check = await this.checkJoinable(groupId, userId)
    if (!check.ok) {
      this.logger.warn(
        `입장 거부: userId=${userId}, groupId=${groupId}, reason=${check.message}`
      )
      return { success: false, code: check.code, message: check.message }
    }

    const membership = await this.studyService.validateJoinableStudyGroup(
      groupId,
      userId
    )

    const now = Date.now()
    const { state, isFirst } = await this.initOrGetRoom(groupId, userId, now)

    if (!state)
      return { success: false, message: '룸 상태 가져오지 못했습니다.' }
    if (state && now >= state.endAt)
      return { success: false, message: '세션이 이미 종료되었습니다.' }

    const isRecovered = check.isRecovered ?? false
    await this.enterRoom(client, groupId, userId, membership, now, isRecovered)

    const members = await this.getMembers(groupId)

    if (isFirst) await this.onFirstJoin(groupId, state, members)
    else if (isRecovered) this.onReconnectJoin(client, groupId, members)
    else this.onSubsequentJoin(client, groupId, members)

    return {
      success: true,
      data: {
        members,
        startedAt: state.startedAt,
        endAt: state.endAt,
        remainMs: Math.max(0, state.endAt - now),
        hostUserId: state.hostUserId
      }
    }
  }

  /**
   * 사용자가 해당 스터디 그룹 룸에 입장 가능한지 확인합니다.
   *
   * Redis의 멤버 목록과 reconnectKey 존재 여부를 조회하여
   * 이미 멤버로 등록되어 있으면서 재연결 대기 상태가 아니면 중복 입장으로 판단합니다.
   *
   * @param {number} groupId 스터디 그룹 ID
   * @param {number} userId 사용자 ID
   * @returns 입장 가능 여부와 재연결 여부
   */
  private async checkJoinable(
    groupId: number,
    userId: number
  ): Promise<{
    ok: boolean
    isRecovered?: boolean
    code?: string
    message?: string
  }> {
    const [existingMember, reconnectRaw] = await Promise.all([
      this.redis.hget(membersKey(groupId), String(userId)),
      this.redis.get(reconnectKey(groupId, userId))
    ])

    const isRecovered = !!reconnectRaw

    if (existingMember && !isRecovered)
      return { ok: false, message: '이미 이 룸에 참여 중입니다.' }

    return { ok: true, isRecovered }
  }

  /**
   * 스터디 룸을 생성하거나 기존 상태를 조회합니다.
   *
   * 1. 현재 시간을 기준으로 RoomState 상태를 생성
   * 2. Redis에 SET NX로 roomKey 저장 시도
   * 3. 2의 결과 여부에 따라 State를 설정하여 isFirst와 함께 반환
   *    - 성공이면, 첫 번째 입장자로 -> 생성한 activeState 사용
   *    - 실패이면, 이후 입장자로 -> Redis에서 기존 상태를 조회하여 사용
   *
   * @param {number} groupId 스터디 그룹 ID
   * @param {number} userId 현재 사용자 ID
   * @param {number} now 현재 시간
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
      'PX',
      SESSION_DURATION_MS + 60_000,
      'NX'
    ))

    const state = isFirst ? activeState : await this.getRoomState(groupId)
    return { state, isFirst }
  }

  /**
   * 검증이 완료된 사용자를 실제 스터디 룸에 입장 처리합니다.
   *
   * 1. 재연결 입장인 경우 reconnectKey 삭제를 시도하고, 예약되어 있던 재연결 만료 작업 취소
   * 2. socket.data에 사용자 메타데이터를 저장
   * 3. Socket.IO 룸에 참여
   * 4. Redis 멤버 목록에 현재 소켓 정보 등록
   *
   * @param {Socket} client 연결된 Socket 인스턴스
   * @param {number} groupId 스터디 그룹 ID
   * @param {number} userId 사용자 ID
   * @param { userName: string; isLeader: boolean } membership 사용자 이름과 리더 여부
   * @param {number} now 입장 시각(ms)
   * @param {boolean} isRecovered 재연결 복구 여부
   */
  private async enterRoom(
    client: Socket,
    groupId: number,
    userId: number,
    membership: { userName: string; isLeader: boolean },
    now: number,
    isRecovered: boolean
  ): Promise<void> {
    if (isRecovered) {
      const deleted = await this.redis.del(reconnectKey(groupId, userId))
      if (deleted) {
        const job = await this.queue.getJob(
          `${JOB_RECONNECT_EXPIRE}:${groupId}:${userId}`
        )
        await job?.remove()
      }
    }

    client.data = {
      ...client.data,
      userName: membership.userName,
      isLeader: membership.isLeader,
      groupId
    }
    client.join(roomKey(groupId))

    await this.addMember(groupId, userId, {
      userId,
      socketId: client.id,
      userName: membership.userName,
      isLeader: membership.isLeader,
      joinedAt: now
    })
  }

  /**
   * 첫 번째 사용자가 룸을 생성했을 때 타이머를 시작하고 룸 전체에 room:started 브로드캐스트합니다.
   *
   * @param {number} groupId 스터디 그룹 ID
   * @param {RoomState} state 룸 상태
   * @param {RoomMember[]} members 현재 참여자 목록
   */
  private async onFirstJoin(
    groupId: number,
    state: RoomState,
    members: RoomMember[]
  ): Promise<void> {
    await this.scheduleJobs(groupId, state.endAt)

    this.logger.log(
      `룸 시작: groupId=${groupId}, endAt=${new Date(state.endAt).toISOString()}`
    )

    this.server.to(roomKey(groupId)).emit('room:started', {
      startedAt: state.startedAt,
      endAt: state.endAt,
      members
    })
  }

  /**
   * 두 번째 이후 사용자가 들어왔을 때 기존 참여자에게 새로운 참여자 입장을 알립니다.
   *
   * @param {Socket} client 연결된 Socket 인스턴스
   * @param {number} groupId 스터디 그룹 ID
   * @param {RoomMember[]} members 최신 참여자 목록
   */
  private onSubsequentJoin(
    client: Socket,
    groupId: number,
    members: RoomMember[]
  ): void {
    client.to(roomKey(groupId)).emit('room:participantsChanged', { members })
  }

  /**
   * 재연결된 사용자가 들어왔을 때, 기존 참여자들에게 재연결 완료 사실을 알립니다.
   *
   * @param {Socket} client 연결된 Socket 인스턴스
   * @param {number} groupId 스터디 그룹 ID
   * @param {RoomMember[]} members 최신 참여자 목록
   */
  private onReconnectJoin(
    client: Socket,
    groupId: number,
    members: RoomMember[]
  ): void {
    this.server.to(roomKey(groupId)).emit('room:participantReconnected', {
      userId: client.data.userId,
      userName: client.data.userName,
      members
    })
  }

  /**
   * 세션 시작 시 종료 리마인드 작업과 종료 작업을 BullMQ에 예약합니다.
   *
   * - delayToEnd <= 0이면 즉시 endRoom 호출 (이미 종료됐어야 하는 룸 처리)
   * - room-reminder:{groupId}: 세션 종료 REMINDER_BEFORE_END_MS 전 실행
   * - room-end:{groupId}: 세션 종료 시점에 실행
   *
   * @param {number} groupId 스터디 그룹 ID
   * @param {number} endAt
   */
  private async scheduleJobs(groupId: number, endAt: number): Promise<void> {
    const now = Date.now()
    const delayToEnd = endAt - now
    const delayToReminder = delayToEnd - REMINDER_BEFORE_END_MS

    const reminderJobId = `${JOB_ROOM_REMINDER}:${groupId}`
    const endJobId = `${JOB_ROOM_END}:${groupId}`

    const [existingReminder, existingEnd] = await Promise.all([
      this.queue.getJob(reminderJobId),
      this.queue.getJob(endJobId)
    ])
    await Promise.all([existingReminder?.remove(), existingEnd?.remove()])

    if (delayToEnd <= 0) {
      await this.endRoom(groupId)
      return
    }

    if (delayToReminder > 0) {
      await this.queue.add(
        JOB_ROOM_REMINDER,
        { groupId },
        {
          jobId: reminderJobId,
          delay: delayToReminder,
          removeOnComplete: true,
          removeOnFail: true
        }
      )
    }

    await this.queue.add(
      JOB_ROOM_END,
      { groupId },
      {
        jobId: endJobId,
        delay: delayToEnd,
        removeOnComplete: true,
        removeOnFail: true
      }
    )
  }

  /**
   * 사용자가 스터디 룸을 정상적으로 퇴장합니다.
   *
   * 1. client.data에서 groupId를 초기화
   * 2. Redis Hash에서 해당 사용자의 멤버 정보 삭제
   * 3. Socket.io 룸에서 클라이언트를 제외(leave)
   * 4. 룸에 남아있는 참여자들에게 업데이트된 멤버 목록 브로드캐스트
   *
   * @param {Socket} client 연결된 Socket 인스턴스
   * @param {number} groupId 스터디 그룹 ID
   * @returns 퇴장 성공 여부
   */
  async leave(client: Socket, groupId: number): Promise<SocketResponse> {
    const { userId } = client.data

    client.data.groupId = undefined

    await this.removeMember(groupId, userId)
    client.leave(roomKey(groupId))

    this.server.to(roomKey(groupId)).emit('room:participantsChanged', {
      members: await this.getMembers(groupId)
    })

    return { success: true }
  }

  /**
   * 웹소켓 연결이 끊어졌을 때 호출되며, 재연결 유예 기간(Grace Period)을 부여합니다.
   *
   * 1. Redis에 재연결 대기 상태 키 저장
   * 2. BullMQ 큐에 예약된 기존 만료 작업(Job)이 있다면 제거 후, 새로운 만료 작업 예약
   * 3. 동일한 룸에 있는 다른 참여자들에게 해당 사용자가 재연결 중임을 알림
   *
   * @param {Socket} client 연결된 Socket 인스턴스
   */
  async handleDisconnect(client: Socket): Promise<void> {
    const { userId, groupId, userName } = client.data ?? {}
    if (!userId || !groupId) return
    client.data.groupId = undefined

    await this.redis.set(
      reconnectKey(groupId, userId),
      '1',
      'EX',
      RECONNECT_GRACE_SEC + BUFFER_SEC
    )

    const jobId = `${JOB_RECONNECT_EXPIRE}:${groupId}:${userId}`
    const existingJob = await this.queue.getJob(jobId)
    await existingJob?.remove()

    await this.queue.add(
      JOB_RECONNECT_EXPIRE,
      { userId, groupId, userName },
      {
        jobId,
        delay: RECONNECT_GRACE_SEC * 1000,
        removeOnComplete: true,
        removeOnFail: true
      }
    )

    this.server
      .to(roomKey(groupId))
      .emit('room:participantReconnecting', { userId, userName })
  }

  // BullMQ Processor 호출
  /**
   * 세션 종료 전 리마인드 이벤트를 룸 전체에 전송합니다.
   * BullMQ Processor에서 예약된 room-reminder 작업이 실행될 때 호출됩니다.
   *
   * @param {number} groupId 스터디 그룹 ID
   */
  async reminderRoom(groupId: number): Promise<void> {
    const state = await this.getRoomState(groupId)
    if (!state) return

    this.server.to(roomKey(groupId)).emit('room:reminder', {
      groupId,
      endAt: state.endAt,
      remainMs: Math.max(0, state.endAt - Date.now())
    })
  }

  /**
   * 세션 종료 시 룸을 종료하고 서버 상태를 정리합니다.
   *
   * 1. 룸 전체에 room:ended 이벤트를 전송
   * 2. 연결 중인 유저 Key 삭제 후 룸에 남아 있는 소켓을 Socket.IO 룸에서 강제 퇴장
   * 3. Redis의 룸 상태와 멤버 목록을 삭제하여 다음 입장 시 새 세션을 시작할 수 있게 처리
   *
   * @param {number} groupId 스터디 그룹 ID
   */
  async endRoom(groupId: number): Promise<void> {
    this.server.to(roomKey(groupId)).emit('room:ended', { groupId })

    const members = await this.getMembers(groupId)
    await Promise.all(
      members.map((m) => this.redis.del(reconnectKey(groupId, m.userId)))
    )

    const sockets = await this.server.in(roomKey(groupId)).fetchSockets()
    await Promise.all(
      sockets.map((s) => {
        Object.assign(s.data, {
          groupId: undefined,
          userId: undefined,
          userName: undefined
        })
        return s.leave(roomKey(groupId))
      })
    )

    await Promise.all([
      this.redis.del(roomKey(groupId)),
      this.redis.del(membersKey(groupId))
    ])
  }

  /**
   * 재연결 유예 시간이 만료되었을 때 사용자를 완전히 퇴장 처리합니다.
   * BullMQ Processor에서 호출됩니다.
   *
   * 1. reconnectKey를 원자적으로 삭제 (DEL 반환값으로 복구 여부 판단)
   *    - 반환값이 0이면 이미 재연결로 복구된 것 → 중단
   *    - 반환값이 1이면 유예 시간 만료 → 완전 퇴장 처리
   * 2. Redis 멤버 목록에서 해당 사용자 삭제
   * 3. 룸에 남아있는 참여자들에게 최신 멤버 목록 브로드캐스트
   *
   * @param payload
   * @param {number} payload.userId 사용자 ID
   * @param {number} payload.groupId 스터디 그룹 ID
   */
  async handleReconnectExpiry(payload: {
    userId: number
    groupId: number
  }): Promise<void> {
    const { userId, groupId } = payload

    const deleted = await this.redis.del(reconnectKey(groupId, userId))
    if (!deleted) return

    await this.removeMember(groupId, userId)

    this.server.to(roomKey(groupId)).emit('room:participantsChanged', {
      members: await this.getMembers(groupId)
    })
  }

  // Redis
  /**
   * Redis에서 룸 상태를 조회합니다.
   *
   * @param {number} groupId 스터디 그룹 ID
   * @returns 룸 상태값 | null
   */
  private async getRoomState(groupId: number): Promise<RoomState | null> {
    const raw = await this.redis.get(roomKey(groupId))
    return raw ? (JSON.parse(raw) as RoomState) : null
  }

  /**
   * Redis Hash에 멤버 정보를 사용자 ID를 키로 하여 추가합니다.
   *
   * @param {number} groupId 스터디 그룹 ID
   * @param {number} userId 사용자 ID
   * @param {RoomMember} member 저장할 멤버 정보
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
   * Redis Hash에서 특정 사용자의 멤버 정보를 삭제합니다.
   *
   * @param {number} groupId 스터디 그룹 ID
   * @param {number} userId 사용자 ID
   */
  private async removeMember(groupId: number, userId: number): Promise<void> {
    await this.redis.hdel(membersKey(groupId), String(userId))
  }

  /**
   * Redis Hash에 저장된 해당 스터디 룸의 모든 멤버를 조회합니다.
   *
   * @param {number} groupId 스터디 그룹 ID
   * @returns 스터디 룸에 있는 모든 멤버들
   */
  async getMembers(groupId: number): Promise<RoomMember[]> {
    const raw = await this.redis.hgetall(membersKey(groupId))
    if (!raw) return []
    return Object.values(raw).map((v) => JSON.parse(v) as RoomMember)
  }
}
