import { faker } from '@faker-js/faker'
import { Language, Level, Role } from '@prisma/client'
import type {
  Contest,
  ContestProblem,
  Assignment,
  AssignmentProblem,
  WorkbookProblem
} from '@prisma/client'
import { MIN_DATE } from '@libs/constants'
import type { Problem } from '@admin/@generated'

export const problems: Problem[] = [
  {
    id: 1,
    createdById: 1,
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
    visibleLockTime: MIN_DATE,
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    updateContentTime: faker.date.past(),
    template: [],
    solution: [],
    engTitle: null,
    engDescription: null,
    engHint: null,
    engInputDescription: null,
    engOutputDescription: null,
    problemTestcase: []
  },
  {
    id: 2,
    createdById: 1,
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
    visibleLockTime: MIN_DATE,
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    updateContentTime: faker.date.past(),
    template: [],
    solution: [],
    engTitle: null,
    engDescription: null,
    engHint: null,
    engInputDescription: null,
    engOutputDescription: null,
    problemTestcase: []
  }
]

export const contestProblems = [
  {
    id: 1,
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
    id: 2,
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

export const assignmentProblems = [
  {
    order: 1,
    assignmentId: 1,
    problemId: 1,
    score: 0,
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    solutionReleaseTime: null,
    assignment: {
      startTime: new Date()
    }
  },
  {
    order: 2,
    assignmentId: 1,
    problemId: 2,
    score: 0,
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    solutionReleaseTime: null,
    assignment: {
      startTime: new Date()
    }
  }
] satisfies Array<AssignmentProblem & { assignment: Partial<Assignment> }>

export const contestProblemsWithScore = [
  {
    id: 1,
    order: 1,
    contestId: 1,
    problemId: 1,
    score: null,
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    contest: {
      startTime: new Date()
    },
    maxScore: 0,
    submissionTime: null
  },
  {
    id: 2,
    order: 2,
    contestId: 1,
    problemId: 2,
    score: null,
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    contest: {
      startTime: new Date()
    },
    maxScore: 0,
    submissionTime: null
  }
] satisfies Array<
  Omit<ContestProblem, 'score'> & { contest: Partial<Contest> } & {
    maxScore: number
    submissionTime: Date | null
    score: number | null
  }
>

export const assignmentProblemsWithScore = [
  {
    order: 1,
    assignmentId: 1,
    problemId: 1,
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    solutionReleaseTime: null,
    assignment: {
      startTime: new Date()
    },
    maxScore: 0
  },
  {
    order: 2,
    assignmentId: 1,
    problemId: 2,
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    solutionReleaseTime: null,
    assignment: {
      startTime: new Date()
    },
    maxScore: 0
  }
] satisfies Array<
  Omit<AssignmentProblem, 'score'> & { assignment: Partial<Assignment> } & {
    maxScore: number
  }
>

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

export const mockUser = {
  id: 4,
  username: 'user01',
  password: 'Useruser',
  role: Role.User,
  email: 'user01@example.com',
  lastLogin: undefined,
  createTime: undefined,
  updateTime: undefined
}

export const mockUpdateHistory = {
  id: 1,
  updatedFields: 'title',
  updatedAt: faker.date.past(),
  updatedByid: 1,
  updatedInfo: '{}'
}
