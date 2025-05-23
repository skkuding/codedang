import { faker } from '@faker-js/faker'
import { type Problem, Language, Level } from '@prisma/client'
import { MIN_DATE } from '@libs/constants'

export const problems: Problem[] = [
  {
    id: 1,
    createdById: 1,
    title: 'public problem',
    description: '',
    inputDescription: '',
    outputDescription: '',
    hint: '',
    template: [
      {
        language: Language.C,
        code: [
          { id: 1, text: 'code', locked: false },
          { id: 2, text: 'unchanged', locked: true }
        ]
      }
    ],
    solution: [],
    languages: [Language.C],
    timeLimit: 1000,
    memoryLimit: 4096,
    difficulty: Level.Level1,
    source: '',
    submissionCount: 10,
    acceptedCount: 5,
    acceptedRate: 0.5,
    visibleLockTime: MIN_DATE,
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    engTitle: null,
    engDescription: null,
    engHint: null,
    engInputDescription: null,
    engOutputDescription: null
  }
]
