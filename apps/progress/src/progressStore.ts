import {
  SandboxStatusCode,
  type ProgressEvent,
  type ProgressStatus,
  type ProgressUpdateMessage
} from './types'

interface SubmissionState {
  submissionId: number
  total: number
  /** 재전송 메시지 중복 집계 방지용 */
  seenCurrents: Set<number>
  lastStatusCode: SandboxStatusCode
  status: ProgressStatus
  updatedAt: number
}

// 끝난 직후 구독한 클라이언트도 최종 상태를 받을 수 있도록 잠시 보관
const FINISHED_TTL_MS = 60_000
// 메시지가 끊긴 제출(Iris 장애, 채점 중단 등) 정리용
const IDLE_TTL_MS = 5 * 60_000

export class ProgressStore {
  private readonly states = new Map<number, SubmissionState>()
  private readonly timers = new Map<number, NodeJS.Timeout>()

  /** 무시한 메시지(중복, 이미 끝난 제출)면 null을 반환한다. */
  handleProgress(event: ProgressEvent): ProgressUpdateMessage | null {
    const state = this.states.get(event.submissionId) ?? this.createState(event)

    if (state.status !== 'judging' || state.seenCurrents.has(event.current)) {
      return null
    }

    state.seenCurrents.add(event.current)
    state.total = event.total
    state.lastStatusCode = event.statusCode
    state.status = this.resolveStatus(state)
    state.updatedAt = Date.now()

    this.states.set(state.submissionId, state)
    this.scheduleCleanup(
      state.submissionId,
      state.status === 'judging' ? IDLE_TTL_MS : FINISHED_TTL_MS
    )

    return this.toMessage(state)
  }

  getSnapshot(submissionId: number): ProgressUpdateMessage | null {
    const state = this.states.get(submissionId)
    return state ? this.toMessage(state) : null
  }

  private resolveStatus(state: SubmissionState): ProgressStatus {
    // 컴파일 에러·서버 에러는 이후 테스트케이스가 실행되지 않는다.
    if (
      state.lastStatusCode === SandboxStatusCode.COMPILE_ERROR ||
      state.lastStatusCode === SandboxStatusCode.SERVER_ERROR
    ) {
      return 'error'
    }
    // current의 시작값(0 or 1)과 무관하도록 받은 개수로 판단
    if (state.seenCurrents.size >= state.total) {
      return 'done'
    }
    return 'judging'
  }

  private toMessage(state: SubmissionState): ProgressUpdateMessage {
    const completed = Math.min(state.seenCurrents.size, state.total)
    return {
      type: 'progress',
      submissionId: state.submissionId,
      status: state.status,
      completed,
      total: state.total,
      percentage: Math.floor((completed / state.total) * 100),
      lastStatusCode: state.lastStatusCode,
      updatedAt: state.updatedAt
    }
  }

  private createState(event: ProgressEvent): SubmissionState {
    return {
      submissionId: event.submissionId,
      total: event.total,
      seenCurrents: new Set(),
      lastStatusCode: event.statusCode,
      status: 'judging',
      updatedAt: Date.now()
    }
  }

  private scheduleCleanup(submissionId: number, delayMs: number) {
    clearTimeout(this.timers.get(submissionId))
    const timer = setTimeout(() => {
      this.states.delete(submissionId)
      this.timers.delete(submissionId)
    }, delayMs)
    timer.unref()
    this.timers.set(submissionId, timer)
  }
}
