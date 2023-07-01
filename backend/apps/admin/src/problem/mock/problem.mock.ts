import { Language } from '@admin/@generated/prisma/language.enum'
import { Level } from '@admin/@generated/prisma/level.enum'
import type { Problem } from '@admin/@generated/problem/problem.model'

export const problems: Problem[] = [
  {
    id: 1,
    createdById: 1,
    groupId: 1,
    title: 'group problem0',
    description: 'description1',
    inputDescription: 'inputDescription1',
    outputDescription: 'outputDescription1',
    hint: 'hit rather hint',
    languages: [Language.Cpp],
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: Level.Level2,
    source: 'mustard source',
    createTime: undefined,
    updateTime: undefined,
    inputExamples: [],
    outputExamples: [],
    problemTestcase: [],
    problemTag: []
  },
  {
    id: 2,
    createdById: 1,
    groupId: 1,
    title: 'group problem1',
    description: 'description2',
    inputDescription: 'inputDescription2',
    outputDescription: 'outputDescription2',
    hint: 'hit rather hint',
    languages: [Language.Cpp],
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: Level.Level2,
    source: 'soy source',
    createTime: undefined,
    updateTime: undefined,
    inputExamples: [],
    outputExamples: [],
    problemTestcase: [],
    problemTag: []
  }
]
