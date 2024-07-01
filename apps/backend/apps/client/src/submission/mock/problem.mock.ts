import { faker } from '@faker-js/faker'
import { type Problem, Language, Level } from '@prisma/client'

export const problems: Problem[] = [
  {
    id: 1,
    createdById: 1,
    groupId: 1,
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
    languages: [Language.C],
    timeLimit: 1000,
    memoryLimit: 4096,
    difficulty: Level.Level1,
    source: '',
    submissionCount: 10,
    acceptedCount: 5,
    acceptedRate: 0.5,
    exposeTime: new Date(),
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    engTitle: null,
    engDescription: null,
    engHint: null,
    engInputDescription: null,
    engOutputDescription: null
  }
]
