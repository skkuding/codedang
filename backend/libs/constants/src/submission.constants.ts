import { Language, ResultStatus } from '@prisma/client'

const cpuLimitTable = {
  [Language.C]: (t: number) => t,
  [Language.Cpp]: (t: number) => t,
  [Language.Java]: (t: number) => t * 2 + 1000,
  [Language.Python3]: (t: number) => t * 3 + 200
}

export const calculateTimeLimit = (language: Language, time: number) =>
  cpuLimitTable[language](time)

const memoryLimitTable = {
  [Language.C]: (m: number) => 1024 * 1024 * m,
  [Language.Cpp]: (m: number) => 1024 * 1024 * m,
  [Language.Java]: (m: number) => 1024 * 1024 * (m * 2 + 16),
  [Language.Python3]: (m: number) => 1024 * 1024 * (m * 2 + 32)
}

export const calculateMemoryLimit = (language: Language, memory: number) =>
  memoryLimitTable[language](memory)

export const Status = (code: number) => {
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
