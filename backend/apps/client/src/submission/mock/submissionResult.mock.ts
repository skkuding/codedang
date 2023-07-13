import { ResultStatus, type SubmissionResult } from '@prisma/client'

export const submissionResults: SubmissionResult[] = [
  {
    id: 1,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 1,
    result: ResultStatus.Accepted,
    submissionId: 'test01',
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345
  },
  {
    id: 2,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 2,
    result: ResultStatus.Accepted,
    submissionId: 'test01',
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345
  },
  {
    id: 3,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 3,
    result: ResultStatus.Accepted,
    submissionId: 'test01',
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345
  },
  {
    id: 4,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 4,
    result: ResultStatus.Accepted,
    submissionId: 'test01',
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345
  },
  {
    id: 5,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 1,
    result: ResultStatus.Accepted,
    submissionId: 'test02',
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345
  },
  {
    id: 6,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 2,
    result: ResultStatus.Accepted,
    submissionId: 'test02',
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345
  },
  {
    id: 7,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 3,
    result: ResultStatus.Accepted,
    submissionId: 'test02',
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345
  },
  {
    id: 8,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 4,
    result: ResultStatus.Judging,
    submissionId: 'test02',
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345
  },
  {
    id: 9,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 1,
    result: ResultStatus.Accepted,
    submissionId: 'test03',
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345
  },
  {
    id: 10,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 2,
    result: ResultStatus.Accepted,
    submissionId: 'test03',
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345
  },
  {
    id: 11,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 3,
    result: ResultStatus.RuntimeError,
    submissionId: 'test03',
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345
  },
  {
    id: 12,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 4,
    result: ResultStatus.MemoryLimitExceeded,
    submissionId: 'test03',
    updateTime: new Date('2023-01-01'),
    cpuTime: BigInt(12345),
    memoryUsage: 12345
  }
]
