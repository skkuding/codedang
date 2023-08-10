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
    exposeTime: undefined,
    createTime: undefined,
    updateTime: undefined,
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
    exposeTime: undefined,
    createTime: undefined,
    updateTime: undefined,
    inputExamples: [],
    outputExamples: [],
    template: []
  }
]

export const contestProblems = [
  {
    id: 'A',
    contestId: 1,
    problemId: 1,
    score: 0,
    createTime: undefined,
    updateTime: undefined,
    contest: {
      startTime: new Date()
    }
  },
  {
    id: 'B',
    contestId: 1,
    problemId: 2,
    score: 0,
    createTime: undefined,
    updateTime: undefined,
    contest: {
      startTime: new Date()
    }
  }
]

export const workbookProblems = [
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

export const problemTag = {
  tag: {
    id: 1,
    name: 'Tag'
  }
}
