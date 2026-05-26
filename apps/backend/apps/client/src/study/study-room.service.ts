import { InjectQueue } from '@nestjs/bullmq'
import { Inject, Injectable, Logger } from '@nestjs/common'
import type { Queue } from 'bullmq'
import type Redis from 'ioredis'
import type { Server, Socket } from 'socket.io'
import {
  roomKey,
  reconnectKey,
  membersKey,
  STUDY_ROOM_QUEUE,
  JOB_RECONNECT_EXPIRE,
  JOB_ROOM_REMINDER,
  JOB_ROOM_END,
  RECONNECT_GRACE_SEC,
  REMINDER_BEFORE_END_MS,
  BUFFER_SEC
} from '@libs/constants'
import { REDIS_CLIENT } from '@libs/redis'
import type {
  RoomState,
  RoomMember,
  JoinResponse,
  SocketResponse
} from './interface/study-socket.interface'
import { StudyService } from './study.service'

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

  // Room
  /**
   * 사용자 WebSocket을 스터디 룸에 입장시킵니다.
   *
   * 1. Redis 기준으로 사용자의 그룹 입장 가능 여부 확인
   * 2. 사용자의 스터디 그룹 참여 권한 검증
   * 3. Redis에서 룸 상태 생성 또는 기존 상태 조회하고 유효성 검증
   * 4. Socket.IO 룸 입장 및 Redis 멤버 정보 등록
   *    - 신규: HSETNX로 중복 입장 차단
   *    - 재연결: reconnectKey DEL 성공 여부로 중복 재연결 차단
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
    const userId: number = client.data.user.id

    const check = await this.checkJoinable(groupId, userId)
    if (!check.ok) {
      this.logger.warn(
        `입장 거부: userId=${userId}, groupId=${groupId}, reason=${check.message}`
      )
      return { success: false, message: check.message }
    }

    let membership
    try {
      membership = await this.studyService.validateJoinableStudyGroup(
        groupId,
        userId
      )
    } catch {
      return { success: false, message: '입장 권한이 없습니다.' }
    }

    const now = Date.now()

    if (membership.endTime.getTime() <= now) {
      return { success: false, message: '세션이 이미 종료되었습니다.' }
    }

    const { state, isFirst } = await this.initOrGetRoom(
      groupId,
      userId,
      membership.isLeader,
      now,
      membership.endTime
    )

    if (!state)
      return { success: false, message: '룸 상태 가져오지 못했습니다.' }

    const isRecovered = check.isRecovered ?? false
    const entered = await this.enterRoom(
      client,
      groupId,
      userId,
      membership.userName,
      now,
      isRecovered
    )
    if (!entered)
      return { success: false, message: '이미 이 룸에 참여 중입니다.' }

    if (isFirst)
      await this.redis.expireat(
        membersKey(groupId),
        Math.ceil((membership.endTime.getTime() + 60_000) / 1000)
      )

    const members = await this.getMembers(groupId)

    if (isFirst) await this.onFirstJoin(groupId, state, members)
    else if (isRecovered) this.onReconnectJoin(client, groupId, members)
    else this.onSubsequentJoin(client, groupId, members)

    return {
      success: true,
      data: {
        members,
        endAt: state.endAt,
        remainMs: Math.max(0, state.endAt - Date.now()),
        leaderId: state.leaderId
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
    const [memberExists, reconnectRaw] = await Promise.all([
      this.redis.hexists(membersKey(groupId), String(userId)),
      this.redis.get(reconnectKey(groupId, userId))
    ])

    const isRecovered = !!reconnectRaw

    if (memberExists && !isRecovered)
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
   *      - 리더 입장이고 leaderId가 미설정 상태이면 KEEPTTL로 업데이트
   *
   * @param {number} groupId 스터디 그룹 ID
   * @param {number} userId 현재 사용자 ID
   * @param {number} now 현재 시간
   * @returns 룸 상태값, 사용자의 입장이 첫번째인지
   */
  private async initOrGetRoom(
    groupId: number,
    userId: number,
    isLeader: boolean,
    now: number,
    endTime: Date
  ): Promise<{ state: RoomState | null; isFirst: boolean }> {
    const activeState: RoomState = {
      endAt: endTime.getTime(),
      leaderId: isLeader ? userId : null
    }

    const isFirst = !!(await this.redis.set(
      roomKey(groupId),
      JSON.stringify(activeState),
      'PX',
      endTime.getTime() - now + 60_000,
      'NX'
    ))

    if (isFirst) return { state: activeState, isFirst }

    const state = await this.getRoomState(groupId)

    if (isLeader && state && state.leaderId === null) {
      const updated = { ...state, leaderId: userId }
      await this.redis.set(roomKey(groupId), JSON.stringify(updated), 'KEEPTTL')
      return { state: updated, isFirst }
    }

    return { state, isFirst }
  }

  /**
   * 검증이 완료된 사용자를 실제 스터디 룸에 입장 처리합니다.
   *
   * 1. 재연결 입장인 경우 reconnectKey를 원자적으로 삭제
   *    - 삭제 실패(0)이면 다른 요청이 이미 재연결 처리 중으로 보고 false 반환
   *    - 삭제 성공(1)이면 예약된 재연결 만료 작업 취소
   * 2. socket.data에 사용자 메타데이터를 저장
   * 3. 신규 입장인 경우 HSETNX로 원자적으로 멤버 등록
   *    - 이미 존재하면(0) 중복 입장으로 판단 → false 반환
   *    - 재연결 입장인 경우 HSET으로 멤버 정보 갱신
   * 4. Redis 멤버 목록에 현재 소켓 정보 등록
   *
   * @param {Socket} client 연결된 Socket 인스턴스
   * @param {number} groupId 스터디 그룹 ID
   * @param {number} userId 사용자 ID
   * @param {string} userName 사용자 이름과 리더 여부
   * @param {number} now 입장 시각(ms)
   * @param {boolean} isRecovered 재연결 복구 여부
   * @returns 입장 성공 여부 (false면 중복 입장 또는 재연결 경쟁 패배)
   */
  private async enterRoom(
    client: Socket,
    groupId: number,
    userId: number,
    userName: string,
    now: number,
    isRecovered: boolean
  ): Promise<boolean> {
    if (isRecovered) {
      const deleted = await this.redis.del(reconnectKey(groupId, userId))
      if (!deleted) return false

      const job = await this.queue.getJob(
        `${JOB_RECONNECT_EXPIRE}:${groupId}:${userId}`
      )
      await job?.remove()
    }

    client.data.room = {
      userName,
      groupId
    }

    const member: RoomMember = {
      userId,
      userName,
      joinedAt: now
    }

    if (isRecovered) {
      const existing = await this.redis.hget(
        membersKey(groupId),
        String(userId)
      )

      if (!existing) return false

      const { joinedAt: originalJoinedAt } = JSON.parse(existing) as RoomMember

      await this.redis.hset(
        membersKey(groupId),
        String(userId),
        JSON.stringify({ ...member, joinedAt: originalJoinedAt })
      )
    } else {
      const added = await this.redis.hsetnx(
        membersKey(groupId),
        String(userId),
        JSON.stringify(member)
      )
      if (!added) return false
    }

    client.join(roomKey(groupId))
    return true
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
      userId: client.data.user.id,
      userName: client.data.room.userName,
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
   * 1. client.data.room을 초기화하여 룸 데이터 제거
   * 2. roomKey 존재 여부 확인 (없으면 이미 처리한 것으로 판단하고 중단)
   * 3. Redis Hash에서 해당 사용자의 멤버 정보 삭제
   * 4. Socket.io 룸에서 클라이언트를 제외(leave)
   * 5. 룸에 남아있는 참여자들에게 업데이트된 멤버 목록 브로드캐스트
   *
   * @param {Socket} client 연결된 Socket 인스턴스
   * @returns 퇴장 성공 여부
   */
  async leave(client: Socket): Promise<SocketResponse> {
    const userId = client.data.user.id
    const groupId = client.data.room.groupId

    client.data.room = undefined

    const roomExists = await this.redis.exists(roomKey(groupId))
    if (!roomExists) return { success: true }

    await this.removeMember(groupId, userId)
    client.leave(roomKey(groupId))

    const members = await this.getMembers(groupId)

    this.server
      .to(roomKey(groupId))
      .emit('room:participantsChanged', { members })

    return { success: true }
  }

  /**
   * 웹소켓 연결이 끊어졌을 때 호출되며, 재연결 유예 기간(Grace Period)을 부여합니다.
   *
   * 1. roomKey 존재 여부 확인 (없으면 이미 처리한 것으로 판단하고 중단)
   * 2. Redis에 재연결 대기 상태 키 저장
   * 3. BullMQ 큐에 예약된 기존 만료 작업(Job)이 있다면 제거 후, 새로운 만료 작업 예약
   * 4. 동일한 룸에 있는 다른 참여자들에게 해당 사용자가 재연결 중임을 알림
   *
   * @param {Socket} client 연결된 Socket 인스턴스
   */
  async handleDisconnect(client: Socket): Promise<void> {
    const userId = client.data.user?.id

    const groupId = client.data.room?.groupId
    if (!userId || !groupId) return

    const roomExists = await this.redis.exists(roomKey(groupId))
    if (!roomExists) return

    const userName = client.data.room.userName
    client.data.room = undefined

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
      { userId, groupId },
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
   * 2. 재연결 대기 중인 모든 멤버의 reconnectKey를 Redis에서 삭제
   * 3. Redis의 룸 상태(roomKey)와 멤버 목록(membersKey)을 삭제
   * 4. 룸에 남아 있는 모든 소켓의 WebSocket 연결을 끊음 (disconnectSockets)
   *    — 멀티 노드 환경에서도 각 노드가 자신의 소켓을 직접 disconnect 처리함
   *
   * @param {number} groupId 스터디 그룹 ID
   */
  async endRoom(groupId: number): Promise<void> {
    this.server.to(roomKey(groupId)).emit('room:ended', { groupId })

    const members = await this.getMembers(groupId)
    await Promise.all(
      members.map((m) => this.redis.del(reconnectKey(groupId, m.userId)))
    )

    await Promise.all([
      this.redis.del(roomKey(groupId)),
      this.redis.del(membersKey(groupId))
    ])

    await this.server.in(roomKey(groupId)).disconnectSockets()
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

    const members = await this.getMembers(groupId)

    this.server
      .to(roomKey(groupId))
      .emit('room:participantsChanged', { members })
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
    return Object.values(raw).flatMap((v) => {
      try {
        return [JSON.parse(v) as RoomMember]
      } catch {
        this.logger.error(`멤버 데이터 파싱 실패`)
        return []
      }
    })
  }
}
