// Redis Key
export const STUDY_KEY_PREFIX = 'study'
export const STUDY_ROOM_PREFIX = `${STUDY_KEY_PREFIX}:room`

export const roomKey = (groupId: number) => `${STUDY_ROOM_PREFIX}:${groupId}`
export const membersKey = (groupId: number) =>
  `${STUDY_ROOM_PREFIX}:${groupId}:members`
export const reconnectKey = (groupId: number, userId: number) =>
  `${STUDY_ROOM_PREFIX}:${groupId}:reconnect:${userId}`

// BullMQ Queue Job Names
export const STUDY_ROOM_QUEUE = 'study-room'
export const JOB_RECONNECT_EXPIRE = 'reconnect-expire'
export const JOB_ROOM_REMINDER = 'room-reminder'
export const JOB_ROOM_END = 'room-end'

// 상수
export const RECONNECT_GRACE_SEC = 30 // 30초
export const REMINDER_BEFORE_END_MS = 10 * 60 * 1000 // 10분
export const BUFFER_SEC = 10 // 10초
