import type { ResultStatus } from '@prisma/client'

export class UpdateSubmissionResultData {
  // required
  resultStatus: ResultStatus

  // compile error of server error
  errorMessage?: string

  // else
  acceptedNum?: number
  totalTestcase?: number
  judgeResult?: string

  constructor(resultStatus: ResultStatus) {
    this.resultStatus = resultStatus
  }
}
