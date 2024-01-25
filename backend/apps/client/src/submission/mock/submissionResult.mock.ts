import { ResultStatus, type SubmissionResult } from '@prisma/client'
import type { JudgerResponse } from '../dto/judger-response.dto'

export const submissionResults: SubmissionResult[] = [
  {
    id: 1,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 1,
    result: ResultStatus.Accepted,
    submissionId: 1,
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345
  },
  {
    id: 2,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 2,
    result: ResultStatus.Accepted,
    submissionId: 2,
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345
  },
  {
    id: 3,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 3,
    result: ResultStatus.WrongAnswer,
    submissionId: 1,
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345
  },
  {
    id: 4,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 4,
    result: ResultStatus.CompileError,
    submissionId: 1,
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345
  }
]

export const judgerResponse: JudgerResponse = {
  resultCode: 6,
  submissionId: 1,
  error: '',
  data: {
    acceptedNum: 2,
    totalTestcase: 4,
    judgeResult: {
      testcaseId: '1:1',
      resultCode: 0,
      cpuTime: 12345,
      realTime: 20000,
      memory: 12345,
      signal: 0,
      exitCode: 0,
      errorCode: 0
    }
  }
}
