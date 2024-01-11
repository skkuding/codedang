import { faker } from '@faker-js/faker'
import { Language, Level, Role } from '@prisma/client'
import type {
  Problem,
  Contest,
  ContestProblem,
  WorkbookProblem
} from '@prisma/client'
import type { CreateTemplateDto } from '../dto/create-code-draft.dto'

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

export const mockCodeDraft = {
  id: 2,
  userId: 4,
  problemId: 2,
  template: [
    {
      code: [
        {
          id: 1,
          text: '#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n',
          locked: true
        },
        {
          id: 2,
          text: '    cout << "hello, world" << endl;\n',
          locked: false
        },
        {
          id: 3,
          text: '    return 0;\n}\n',
          locked: true
        }
      ],
      language: 'Cpp'
    },
    {
      code: [
        {
          id: 1,
          text: 'print("hello, world")\n',
          locked: false
        }
      ],
      language: 'Python3'
    }
  ],
  createTime: '2023-12-27T16:17:11.260Z',
  updateTime: '2023-12-27T16:17:11.260Z'
}

export const mockTemplate: CreateTemplateDto = {
  template: [
    {
      language: Language.Cpp,
      code: [
        {
          id: 1,
          text: '#include <bits/stdc++.h>\n using namespace std;\n int main() { cout << "hello, world" << endl;\n return 0; }',
          locked: false
        }
      ]
    }
  ]
}
