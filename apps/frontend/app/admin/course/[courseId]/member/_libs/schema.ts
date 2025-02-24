import * as v from 'valibot'

export const inviteUserSchema = v.object({
  groupId: v.pipe(v.number(), v.minValue(1, 'Invalid group ID')),
  userId: v.pipe(v.number(), v.minValue(1, 'Invalid user ID')),
  isGroupLeader: v.boolean()
})

export const findUserSchema = v.object({
  email: v.pipe(v.string())
})
