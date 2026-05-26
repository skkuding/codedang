// Room
export interface RoomState {
  endAt: number
  leaderId: number | null
}

export interface RoomMember {
  userId: number
  userName: string
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
  leaderId: number | null
}

// PayLoad
export interface JoinPayload {
  groupId: number
}
