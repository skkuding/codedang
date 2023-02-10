import { Problem, Language, Level } from '@prisma/client'

export const Problems: Problem[] = [
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
    createTime: undefined,
    updateTime: undefined,
    inputExamples: [],
    outputExamples: []
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
    createTime: undefined,
    updateTime: undefined,
    inputExamples: [],
    outputExamples: []
  }
]

export const ContestProblems = [
  {
    id: 'A',
    contestId: 1,
    problemId: 1,
    score: 0,
    createTime: undefined,
    updateTime: undefined
  },
  {
    id: 'B',
    contestId: 1,
    problemId: 2,
    score: 0,
    createTime: undefined,
    updateTime: undefined
  }
]

export const WorkbookProblems = [
  {
    id: 'A',
    workbookId: 1,
    problemId: 1,
    score: 0,
    createTime: undefined,
    updateTime: undefined
  },
  {
    id: 'B',
    workbookId: 1,
    problemId: 2,
    score: 0,
    createTime: undefined,
    updateTime: undefined
  }
]
