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

// ref: https://github.com/skkuding/codedang/blob/033c3bb5fd7c75cf40de6adea6f05e403f55518f/iris/src/router/response.go#L19-L29
export const Status = (code: number) => {
  switch (code) {
    case 0:
      return ResultStatus.Accepted
    case 1:
      return ResultStatus.WrongAnswer
    case 2: // CPU_TIME_LIMIT_EXCEEDED
      return ResultStatus.TimeLimitExceeded
    case 3: // REAL_TIME_LIMIT_EXCEEDED
      return ResultStatus.TimeLimitExceeded
    case 4:
      return ResultStatus.MemoryLimitExceeded
    case 5:
      return ResultStatus.RuntimeError
    case 6:
      return ResultStatus.CompileError
    case 7: // TESTCASE_ERROR
      return ResultStatus.ServerError
    case 8: // Segmentation Fault
      return ResultStatus.SegmentationFaultError
    default:
      return ResultStatus.ServerError
  }
}

const SUBMISSION_TESTCASE_EVENT = 'submission.submission'
const TEST_TESTCASE_EVENT = 'submission.test'
const USERTEST_TESTCASE_EVENT = 'submission.usertest'

export const submissionTestcaseEvent = (submissionId: number) =>
  `${SUBMISSION_TESTCASE_EVENT}:${submissionId}`

export const testTestcaseEvent = (userId: number) =>
  `${TEST_TESTCASE_EVENT}:${userId}`

export const userTestTestcaseEvent = (userId: number) =>
  `${USERTEST_TESTCASE_EVENT}:${userId}`
