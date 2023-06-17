import type { ResultStatus } from '@prisma/client'

export class UpdateSubmissionResultData {
  // required
  result: ResultStatus

  constructor(result: ResultStatus) {
    this.result = result
  }
}
