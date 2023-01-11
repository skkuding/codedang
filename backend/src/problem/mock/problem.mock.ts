import { Problem, ProblemDifficulty } from '@prisma/client'

export const Problems: Problem[] = [
  {
    id: 1,
    createdById: 1,
    isPublic: true,
    title: 'public problem',
    description: '',
    inputDescription: '',
    outputDescription: '',
    hint: '',
    languages: '',
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: ProblemDifficulty.Level1,
    source: '',
    shared: false,
    submissionNum: 1,
    acceptedNum: 1,
    score: 0,
    createTime: undefined,
    updateTime: undefined,
    groupId: 1
  },
  {
    id: 2,
    createdById: 1,
    isPublic: false,
    title: 'problem',
    description: '',
    inputDescription: '',
    outputDescription: '',
    hint: '',
    languages: '',
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: ProblemDifficulty.Level2,
    source: '',
    shared: false,
    submissionNum: 1,
    acceptedNum: 1,
    score: 0,
    createTime: undefined,
    updateTime: undefined,
    groupId: 1
  }
]

export const ContestProblems = [
  {
    id: 1,
    displayId: 'A',
    contestId: 1,
    problemId: 1,
    score: 0,
    createTime: undefined,
    updateTime: undefined
  },
  {
    id: 2,
    displayId: 'B',
    contestId: 1,
    problemId: 2,
    score: 0,
    createTime: undefined,
    updateTime: undefined
  }
]

export const WorkbookProblems = [
  {
    id: 1,
    displayId: 'A',
    workbookId: 1,
    problemId: 1,
    score: 0,
    createTime: undefined,
    updateTime: undefined
  },
  {
    id: 2,
    displayId: 'B',
    workbookId: 1,
    problemId: 2,
    score: 0,
    createTime: undefined,
    updateTime: undefined
  }
]
