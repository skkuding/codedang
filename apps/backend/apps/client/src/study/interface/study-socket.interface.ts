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
