import type { Prisma } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import {
  assertAssignmentsHaveNoLearningRecords,
  getAssignmentLearningRecords
} from './assignment-learning-records'

describe('Shared assignment learning record guard', () => {
  it('returns zero counts without queries for an empty scope', async () => {
    const tx = {
      $queryRaw: stub(),
      submission: { count: stub() },
      assignmentProblemRecord: { groupBy: stub() }
    }
    expect(
      await getAssignmentLearningRecords(
        tx as unknown as Prisma.TransactionClient,
        []
      )
    ).to.deep.equal({ submissionCount: 0, recordedStudentCount: 0 })
    await assertAssignmentsHaveNoLearningRecords(
      tx as unknown as Prisma.TransactionClient,
      []
    )
    expect(tx.$queryRaw.called).to.equal(false)
    expect(tx.submission.count.called).to.equal(false)
  })
})
