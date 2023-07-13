import { Language, ResultStatus, type Submission } from '@prisma/client'

export const submissions: Submission[] = [
  {
    id: 'test01',
    code: [{ id: 1, text: 'code', readonly: false }],
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
    code: [{ id: 1, text: 'code', readonly: false }],
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
