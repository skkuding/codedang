import { ResultStatus } from '@prisma/client'

export const matchResultCode = (code: number) => {
  switch (code) {
    case 0:
      return ResultStatus.Accepted
    case 1:
      return ResultStatus.WrongAnswer
    case 2:
      return ResultStatus.TimeLimitExceeded
    case 3:
      return ResultStatus.TimeLimitExceeded
    case 4:
      return ResultStatus.MemoryLimitExceeded
    case 5:
      return ResultStatus.RuntimeError
    case 6:
      return ResultStatus.CompileError
    default:
      return ResultStatus.ServerError
  }
}
