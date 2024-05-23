import { Language, ResultStatus } from '@prisma/client'
import { plainToInstance } from 'class-transformer'
import { type CreateSubmissionDto, Snippet } from '../dto/create-submission.dto'
import { submissionResults } from './submissionResult.mock'

export const submissions = [
  {
    id: 1,
    code: [
      { id: 1, text: 'code', locked: false },
      { id: 2, text: 'unchanged', locked: true }
    ],
    result: ResultStatus.Judging,
    createTime: new Date('2023-01-01'),
    updateTime: new Date('2023-01-01'),
    language: Language.C,
    userId: 1,
    problemId: 1,
    contestId: null,
    workbookId: null
  },
  {
    id: 2,
    code: [
      { id: 1, text: 'code', locked: false },
      { id: 2, text: 'changed', locked: true }
    ],
    result: ResultStatus.Judging,
    createTime: new Date('2023-01-01'),
    updateTime: new Date('2023-01-01'),
    language: Language.Python3,
    userId: 1,
    problemId: 1,
    contestId: null,
    workbookId: null
  },
  {
    id: 3,
    code: [
      { id: 1, text: 'code', locked: false },
      { id: 2, text: 'unchanged', locked: true }
    ],
    result: ResultStatus.Accepted,
    createTime: new Date('2023-01-01'),
    updateTime: new Date('2023-01-01'),
    language: Language.C,
    userId: 1,
    problemId: 1,
    contestId: null,
    workbookId: null
  }
]

export const submissionsWithResult = [
  {
    ...submissions[0],
    submissionResult: [
      submissionResults[0],
      submissionResults[2],
      submissionResults[3]
    ]
  },
  { ...submissions[1], submissionResult: [submissionResults[1]] },
  { ...submissions[2], submissionResult: [submissionResults[0]] }
]

export const submissionReturns = [
  { ...submissions[0], maxMemoryUsage: 0, maxCpuTime: '0' },
  { ...submissions[1], maxMemoryUsage: 0, maxCpuTime: '0' },
  { ...submissions[2], maxMemoryUsage: 12345, maxCpuTime: '12345' }
]

export const submissionDto: CreateSubmissionDto = {
  code: plainToInstance(Snippet, submissions[0].code),
  language: Language.C
}
