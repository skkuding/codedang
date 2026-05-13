// Redis Key
export const STUDY_KEY_PREFIX = 'study'
export const STUDY_ROOM_PREFIX = `${STUDY_KEY_PREFIX}:room`
export const STUDY_CHAT_PREFIX = `${STUDY_KEY_PREFIX}:chat`

export const roomKey = (groupId: number) => `${STUDY_ROOM_PREFIX}:${groupId}`
export const membersKey = (groupId: number) =>
  `${STUDY_ROOM_PREFIX}:${groupId}:members`
export const reconnectKey = (groupId: number, userId: number) =>
  `${STUDY_ROOM_PREFIX}:${groupId}:reconnect:${userId}`

export const chatKey = (groupId: number) => `${STUDY_CHAT_PREFIX}:${groupId}`

// 상수
export const RECONNECT_GRACE_SEC = 30 // 30초
export const REMINDER_BEFORE_END_MS = 10 * 60 * 1000 // 10분
export const BUFFER_SEC = 10 // 10초

// Room
export interface RoomState {
  endAt: number
  hostUserId: number
}

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
  endAt: number
  remainMs: number
  hostUserId: number
}

// PayLoad
export interface JoinPayload {
  groupId: number
}
