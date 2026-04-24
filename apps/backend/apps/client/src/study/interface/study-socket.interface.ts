// Redis Key
export const ROOM_PREFIX = 'study-room'
export const RECONNECT_PREFIX = 'study-reconnect'

export const roomKey = (groupId: number) => `${ROOM_PREFIX}:${groupId}`
export const membersKey = (groupId: number) =>
  `${ROOM_PREFIX}:${groupId}:members`

// 상수
export const SESSION_DURATION_MS = 2 * 60 * 60 * 1000 // 2시간

// Room
export interface RoomState {
  startedAt: number // Unix ms
  endAt: number // Unix ms
  hostUserId: number
}

// Member
export interface RoomMember {
  userId: number
  userName: string
  isLeader: boolean
  joinedAt: number
}

// Socket Response
export interface SocketResponse<T = undefined> {
  success: boolean
  message?: string
  data?: T
  code?: string
}

export interface JoinResponse {
  members: RoomMember[]
  startedAt: number
  endAt: number
  remainMs: number
  hostUserId: number
}

// PayLoad
export interface JoinPayload {
  groupId: number
}
