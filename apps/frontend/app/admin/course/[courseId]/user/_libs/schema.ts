import * as v from 'valibot'

export const inviteUserSchema = v.object({
  groupId: v.pipe(v.number(), v.minValue(0, 'Invalid group ID')),
  userId: v.pipe(v.number(), v.minValue(0, 'Invalid user ID')),
  isGroupLeader: v.boolean()
})

export const findUserSchema = v.object({
  email: v.pipe(v.string())
})
