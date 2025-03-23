import { ResultStatus, type SubmissionResult } from '@prisma/client'
import type { JudgerResponse } from '../class/judger-response.dto'

export const submissionResults: SubmissionResult[] = [
  {
    id: 1,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 1,
    result: ResultStatus.Accepted,
    submissionId: 1,
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345,
    output: '2\n'
  },
  {
    id: 2,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 2,
    result: ResultStatus.Accepted,
    submissionId: 2,
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345,
    output: '3\n'
  },
  {
    id: 3,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 3,
    result: ResultStatus.WrongAnswer,
    submissionId: 1,
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345,
    output: null
  },
  {
    id: 4,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 4,
    result: ResultStatus.CompileError,
    submissionId: 1,
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345,
    output: null
  }
]

export const judgerResponse: JudgerResponse = {
  resultCode: 6,
  submissionId: 1,
  error: '',
  judgeResult: {
    testcaseId: 1,
    cpuTime: 12345,
    realTime: 20000,
    memory: 12345,
    signal: 0,
    exitCode: 0,
    errorCode: 0
  }
}
