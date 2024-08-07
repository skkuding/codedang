import { Language, ResultStatus } from '@prisma/client'
import { plainToInstance } from 'class-transformer'
import {
  Snippet,
  type CreateSubmissionDto
} from '../class/create-submission.dto'

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
    workbookId: null,
    problem: {
      problemTestcase: [
        {
          id: 1
        }
      ]
    }
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
    workbookId: null,
    problem: {
      problemTestcase: [
        {
          id: 1
        }
      ]
    }
  }
]

export const submissionDto: CreateSubmissionDto = {
  code: plainToInstance(Snippet, submissions[0].code),
  language: Language.C
}
