import { ResultStatus, type SubmissionResult } from '@prisma/client'

export const submissionResults: SubmissionResult[] = [
  {
    id: 1,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 1,
    result: ResultStatus.Accepted,
    submissionId: 'test01',
    updateTime: new Date('2023-01-01')
  },
  {
    id: 2,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 2,
    result: ResultStatus.Accepted,
    submissionId: 'test01',
    updateTime: new Date('2023-01-01')
  },
  {
    id: 3,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 3,
    result: ResultStatus.Accepted,
    submissionId: 'test01',
    updateTime: new Date('2023-01-01')
  },
  {
    id: 4,
    createTime: new Date('2023-01-01'),
    problemTestcaseId: 4,
    result: ResultStatus.Accepted,
    submissionId: 'test01',
    updateTime: new Date('2023-01-01')
  }
]
