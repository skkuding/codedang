import {
  SandboxStatusCode,
  type ProgressEvent,
  type ProgressStatus,
  type ProgressUpdateMessage
} from './types'

interface SubmissionState {
  submissionId: number
  total: number
  /** Prevents double counting of redelivered messages */
  seenCurrents: Set<number>
  lastStatusCode: SandboxStatusCode
  status: ProgressStatus
  updatedAt: number
}

// Keep finished submissions briefly so late subscribers still get the final state
export const DEFAULT_FINISHED_TTL_MS = 60_000
// Evict submissions whose messages stopped arriving (Iris failure, aborted judging)
export const DEFAULT_IDLE_TTL_MS = 5 * 60_000

export interface ProgressStoreOptions {
  finishedTtlMs?: number
  idleTtlMs?: number
}

type ExpireListener = (submissionId: number) => void

export class ProgressStore {
  private readonly states = new Map<number, SubmissionState>()
  private readonly timers = new Map<number, NodeJS.Timeout>()
  private readonly finishedTtlMs: number
  private readonly idleTtlMs: number
  private expireListener: ExpireListener | null = null

  constructor(options: ProgressStoreOptions = {}) {
    this.finishedTtlMs = options.finishedTtlMs ?? DEFAULT_FINISHED_TTL_MS
    this.idleTtlMs = options.idleTtlMs ?? DEFAULT_IDLE_TTL_MS
  }

  /** Called when a submission is evicted by TTL, to clean up state kept outside the store */
  onExpire(listener: ExpireListener) {
    this.expireListener = listener
  }

  /** Returns null when the message is ignored (duplicate or already finished). */
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
      state.status === 'judging' ? this.idleTtlMs : this.finishedTtlMs
    )

    return this.toMessage(state)
  }

  getSnapshot(submissionId: number): ProgressUpdateMessage | null {
    const state = this.states.get(submissionId)
    return state ? this.toMessage(state) : null
  }

  private resolveStatus(state: SubmissionState): ProgressStatus {
    // No test case runs after a compile error or server error.
    if (
      state.lastStatusCode === SandboxStatusCode.COMPILE_ERROR ||
      state.lastStatusCode === SandboxStatusCode.SERVER_ERROR
    ) {
      return 'error'
    }
    // Count received messages, so it works whether current starts at 0 or 1
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
      this.expireListener?.(submissionId)
    }, delayMs)
    timer.unref()
    this.timers.set(submissionId, timer)
  }
}
