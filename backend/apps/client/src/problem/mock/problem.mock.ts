import { faker } from '@faker-js/faker'
import type { Contest, ContestProblem, WorkbookProblem } from '@prisma/client'
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
    languages: [Language.C],
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: Level.Level1,
    source: '',
    submissionCount: 10,
    acceptedCount: 5,
    acceptedRate: 0.5,
    exposeTime: new Date('2000-01-01'),
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    inputExamples: [],
    outputExamples: [],
    template: []
  },
  {
    id: 2,
    createdById: 1,
    groupId: 1,
    title: 'problem',
    description: '',
    inputDescription: '',
    outputDescription: '',
    hint: '',
    languages: [Language.Cpp],
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: Level.Level2,
    source: '',
    submissionCount: 10,
    acceptedCount: 5,
    acceptedRate: 0.5,
    exposeTime: new Date('2000-01-01'),
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    inputExamples: [],
    outputExamples: [],
    template: []
  }
]

export const contestProblems = [
  {
    order: 1,
    contestId: 1,
    problemId: 1,
    score: 0,
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    contest: {
      startTime: new Date()
    }
  },
  {
    order: 2,
    contestId: 1,
    problemId: 2,
    score: 0,
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    contest: {
      startTime: new Date()
    }
  }
] satisfies Array<ContestProblem & { contest: Partial<Contest> }>

export const workbookProblems = [
  {
    order: 1,
    workbookId: 1,
    problemId: 1,
    createTime: faker.date.past(),
    updateTime: faker.date.past()
  },
  {
    order: 2,
    workbookId: 1,
    problemId: 2,
    createTime: faker.date.past(),
    updateTime: faker.date.past()
  }
] satisfies WorkbookProblem[]

export const problemTag = {
  tag: {
    id: 1,
    name: 'Tag'
  }
}

export const tag = {
  id: 1,
  name: 'Tag'
}
