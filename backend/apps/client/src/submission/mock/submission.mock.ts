import { Language, ResultStatus, type Submission } from '@prisma/client'
import { plainToInstance } from 'class-transformer'
import { type CreateSubmissionDto, Snippet } from '../dto/create-submission.dto'

export const submissions: Submission[] = [
  {
    id: 'test01',
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
    id: 'test02',
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
  }
]

export const submissionDto: CreateSubmissionDto = {
  code: plainToInstance(Snippet, submissions[0].code),
  language: Language.C
}
