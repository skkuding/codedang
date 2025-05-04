import * as v from 'valibot'

export const updateAssignmentProblemRecordSchema = v.object({
  assignmentId: v.number(),
  problemId: v.number(),
  userId: v.number(),
  comment: v.string(),
  finalScore: v.number()
})
