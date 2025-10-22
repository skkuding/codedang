import type {
  AssignmentProblem,
  Contest,
  ContestProblem,
  Problem,
  ProblemTag,
  Tag,
  User,
  Workbook,
  WorkbookProblem
} from '@generated'
import { Language, Level } from '@generated'
import { faker } from '@faker-js/faker'
import { Role } from '@prisma/client'
import { createReadStream } from 'fs'
import { MAX_DATE, MIN_DATE } from '@libs/constants'
import type { FileUploadDto } from '../dto/file-upload.dto'
import type { UploadFileInput } from '../model/problem.input'
import type { ProblemWithIsVisible } from '../model/problem.output'
import type { Template } from '../model/template.input'
import type { Testcase } from '../model/testcase.input'

const changeVisibleLockTimeToIsVisible = function (
  problems: Problem[]
): ProblemWithIsVisible[] {
  return problems.map((problem: Problem) => {
    const { visibleLockTime, ...data } = problem
    return {
      isVisible:
        visibleLockTime.getTime() === MIN_DATE.getTime()
          ? true
          : visibleLockTime < new Date() ||
              visibleLockTime.getTime() === MAX_DATE.getTime()
            ? false
            : null,
      ...data
    }
  })
}

export const problemId = 1
export const groupId = 1
export const template: Template = {
  language: Language.Cpp,
  code: [
    {
      id: 1,
      text: 'int main(void) {}',
      locked: false
    }
  ]
}
export const solution = [
  {
    language: Language.Cpp,
    code: 'int main(void) {}'
  }
]
export const user: Partial<User>[] = [
  {
    id: 1,
    role: Role.Admin
  },
  {
    id: 2,
    role: Role.User
  }
]
export const problems: Problem[] = [
  {
    id: 1,
    createdById: user[0].id!,
    title: 'group problem0',
    description: 'description1',
    inputDescription: 'inputDescription1',
    outputDescription: 'outputDescription1',
    hint: 'hit rather hint',
    template: [template],
    languages: [Language.Cpp],
    solution,
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: Level.Level2,
    source: 'mustard source',
    submissionCount: 10,
    acceptedCount: 5,
    acceptedRate: 0.5,
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    updateContentTime: faker.date.past(),
    visibleLockTime: MAX_DATE,
    engTitle: null,
    engDescription: null,
    engHint: null,
    engInputDescription: null,
    engOutputDescription: null,
    isHiddenUploadedByZip: false,
    isSampleUploadedByZip: false,
    updateHistory: []
  },
  {
    id: 2,
    createdById: user[0].id!,
    title: 'group problem1',
    description: 'description2',
    inputDescription: 'inputDescription2',
    outputDescription: 'outputDescription2',
    hint: 'hit rather hint',
    template: [template],
    languages: [Language.Cpp],
    solution,
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: Level.Level2,
    source: 'soy source',
    submissionCount: 10,
    acceptedCount: 5,
    acceptedRate: 0.5,
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    updateContentTime: faker.date.past(),
    visibleLockTime: faker.date.future(), //contest endTime
    engTitle: null,
    engDescription: null,
    engHint: null,
    engInputDescription: null,
    engOutputDescription: null,
    isHiddenUploadedByZip: false,
    isSampleUploadedByZip: false,
    updateHistory: []
  }
]

export const updateHistories = [
  {
    id: 1,
    problemId: 1,
    updatedAt: new Date(),
    updatedFields: ['title', 'description'],
    updatedInfo: [
      {
        current: 'New Title',
        previous: 'Old Title',
        updatedField: 'Title'
      },
      {
        current: 'New Description',
        previous: 'Old Description',
        updatedField: 'Description'
      }
    ]
  },
  {
    id: 2,
    problemId: 1,
    updatedAt: new Date('2024-01-15T15:30:00Z'),
    updatedFields: ['TimeLimit', 'Testcase*'],
    updatedInfo: [
      {
        current: 'New Title',
        previous: 'Old Title',
        updatedField: 'Title'
      },
      {
        current: 'New Description',
        previous: 'Old Description',
        updatedField: 'Description'
      }
    ]
  },
  {
    id: 3,
    problemId: 2,
    updatedAt: new Date('2024-01-20T08:45:00Z'),
    updatedFields: ['Language'],
    updatedInfo: [
      {
        current: 'New Title',
        previous: 'Old Title',
        updatedField: 'Title'
      },
      {
        current: 'New Description',
        previous: 'Old Description',
        updatedField: 'Description'
      }
    ]
  }
]

export const problemsWithIsVisible: ProblemWithIsVisible[] =
  changeVisibleLockTimeToIsVisible(problems)

export const testcaseInput: Testcase = {
  input: "wake up, daddy's home",
  output: 'welcome home, sir',
  scoreWeight: 1,
  isHidden: false
}

export const testcaseData: Testcase = {
  input:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  output: 'true',
  scoreWeight: 1,
  isHidden: false
}

const file: Promise<FileUploadDto> = new Promise((resolve) => {
  const data = {
    createReadStream: () =>
      createReadStream('apps/admin/src/problem/mock/testdata.xlsx'),
    filename: 'testdata.xlsx',
    mimetype:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    encoding: '7bit'
  }
  resolve(data)
})
export const fileUploadInput: UploadFileInput = { file }

const testcaseFile: Promise<FileUploadDto> = new Promise((resolve) => {
  const data = {
    createReadStream: () =>
      createReadStream('apps/admin/src/problem/mock/testcaseData.xlsx'),
    filename: 'testcaseData.xlsx',
    mimetype:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    encoding: '7bit'
  }
  resolve(data)
})
export const testcaseUploadInput: UploadFileInput = { file: testcaseFile }

export const importedProblems: Problem[] = [
  {
    id: 32,
    createdById: user[1].id!,
    title: '정수 더하기',
    description:
      '<p>두 정수 A와 B를 입력받은 다음, A+B를 출력하는 프로그램을 작성하시오. 첫째 줄에 A와 B가 주어진다. (0 < A, B < 10) 첫째 줄에 A+B를 출력한다. </p>',
    inputDescription: '',
    outputDescription: '',
    hint: '',
    template: [
      {
        code: {
          text: '#include <stdio.h>\n\nint main()\n{\n        int num;\n        scanf("%d", &num);\n\n        printf("%d", num);\n  return 0;\n}',
          readonly: false
        },
        language: 'C'
      }
    ],
    languages: ['C', 'Cpp'],
    solution,
    timeLimit: 2000,
    memoryLimit: 512,
    difficulty: 'Level3',
    source: '',
    submissionCount: 10,
    acceptedCount: 5,
    acceptedRate: 0.5,
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    updateContentTime: faker.date.past(),
    visibleLockTime: MIN_DATE,
    engTitle: null,
    engDescription: null,
    engHint: null,
    engInputDescription: null,
    engOutputDescription: null,
    isHiddenUploadedByZip: false,
    isSampleUploadedByZip: false
  },
  {
    id: 33,
    createdById: user[1].id!,
    title: '정수 빼기',
    description:
      '<p>두 정수 A와 B를 입력받은 다음, A-B를 출력하는 프로그램을 작성하시오. 첫째 줄에 A와 B가 주어진다. (0 < A, B < 10) 첫째 줄에 A-B를 출력한다. </p>',
    inputDescription: '',
    outputDescription: '',
    hint: '',
    template: [
      {
        code: {
          text: '#include <stdio.h>\n\nint main()\n{\n        int num;\n        scanf("%d", &num);\n\n        printf("%d", num);\n  return 0;\n}',
          readonly: false
        },
        language: 'C'
      },
      {
        code: {
          text: "import java.util.Scanner;\n \npublic class Main {\n \n\tpublic static void main(String[] args) {\n\n\t\tScanner in = new Scanner(System.in);\n\t\t\n\t\tSystem.out.println('answer');\n \n\t\tin.close();\n\t}\n}",
          readonly: false
        },
        language: 'Java'
      }
    ],
    languages: ['C', 'Java', 'Cpp'],
    solution,
    timeLimit: 2000,
    memoryLimit: 512,
    difficulty: 'Level4',
    source: '',
    submissionCount: 10,
    acceptedCount: 5,
    acceptedRate: 0.5,
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    updateContentTime: faker.date.past(),
    visibleLockTime: MIN_DATE,
    engTitle: null,
    engDescription: null,
    engHint: null,
    engInputDescription: null,
    isHiddenUploadedByZip: false,
    isSampleUploadedByZip: false,
    engOutputDescription: null
  }
]

export const importedProblemsWithIsVisible: ProblemWithIsVisible[] =
  changeVisibleLockTimeToIsVisible(importedProblems)

export const exampleWorkbook: Workbook = {
  id: 1,
  title: 'example',
  description: 'example',
  groupId: 1,
  createdById: user[0].id!,
  isVisible: true,
  createTime: new Date(),
  updateTime: new Date()
}

export const exampleWorkbookProblems: WorkbookProblem[] = [
  {
    order: 1,
    workbookId: 1,
    problemId: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 2,
    workbookId: 1,
    problemId: 2,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 3,
    workbookId: 1,
    problemId: 3,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 4,
    workbookId: 1,
    problemId: 4,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 5,
    workbookId: 1,
    problemId: 5,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 6,
    workbookId: 1,
    problemId: 6,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 7,
    workbookId: 1,
    problemId: 7,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 8,
    workbookId: 1,
    problemId: 8,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 9,
    workbookId: 1,
    problemId: 9,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 10,
    workbookId: 1,
    problemId: 10,
    createTime: new Date(),
    updateTime: new Date()
  }
]

export const exampleOrderUpdatedWorkbookProblems: WorkbookProblem[] = [
  {
    order: 1,
    workbookId: 1,
    problemId: 2,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 2,
    workbookId: 1,
    problemId: 3,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 3,
    workbookId: 1,
    problemId: 4,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 4,
    workbookId: 1,
    problemId: 5,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 5,
    workbookId: 1,
    problemId: 6,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 6,
    workbookId: 1,
    problemId: 7,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 7,
    workbookId: 1,
    problemId: 8,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 8,
    workbookId: 1,
    problemId: 9,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 9,
    workbookId: 1,
    problemId: 10,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 10,
    workbookId: 1,
    problemId: 1,
    createTime: new Date(),
    updateTime: new Date()
  }
]

export const exampleContest: Contest = {
  id: 1,
  title: 'example',
  description: 'example',
  penalty: 20,
  lastPenalty: false,
  createdById: user[0].id!,
  enableCopyPaste: true,
  evaluateWithSampleTestcase: false,
  isJudgeResultVisible: true,
  startTime: new Date(),
  endTime: new Date(),
  registerDueTime: new Date(),
  unfreeze: false,
  freezeTime: null,
  createTime: new Date(),
  updateTime: new Date(),
  invitationCode: '123456',
  posterUrl: 'posterUrl',
  summary: {
    참여대상: 'participationTarget',
    진행방식: 'competitionMethod',
    순위산정: 'rankingMethod',
    문제형태: 'problemFormat',
    참여혜택: 'benefits'
  }
}
export const exampleContestProblems: ContestProblem[] = [
  {
    id: 1,
    order: 1,
    contestId: 1,
    problemId: 1,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    id: 2,
    order: 2,
    contestId: 1,
    problemId: 2,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    id: 3,
    order: 3,
    contestId: 1,
    problemId: 3,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    id: 4,
    order: 4,
    contestId: 1,
    problemId: 4,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    id: 5,
    order: 5,
    contestId: 1,
    problemId: 5,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    id: 6,
    order: 6,
    contestId: 1,
    problemId: 6,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    id: 7,
    order: 7,
    contestId: 1,
    problemId: 7,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    id: 8,
    order: 8,
    contestId: 1,
    problemId: 8,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    id: 9,
    order: 9,
    contestId: 1,
    problemId: 9,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    id: 10,
    order: 10,
    contestId: 1,
    problemId: 10,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  }
]

export const exampleOrderUpdatedContestProblems: ContestProblem[] = [
  {
    id: 1,
    order: 1,
    contestId: 1,
    problemId: 2,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    id: 2,
    order: 2,
    contestId: 1,
    problemId: 3,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    id: 3,
    order: 3,
    contestId: 1,
    problemId: 4,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    id: 4,
    order: 4,
    contestId: 1,
    problemId: 5,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    id: 5,
    order: 5,
    contestId: 1,
    problemId: 6,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    id: 6,
    order: 6,
    contestId: 1,
    problemId: 7,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    id: 7,
    order: 7,
    contestId: 1,
    problemId: 8,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    id: 8,
    order: 8,
    contestId: 1,
    problemId: 9,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    id: 9,
    order: 9,
    contestId: 1,
    problemId: 10,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    id: 10,
    order: 10,
    contestId: 1,
    problemId: 1,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  }
]

export const exampleAssignment = {
  id: 1,
  title: 'example',
  description: 'example',
  groupId: 1,
  createdById: user[0].id!,
  isVisible: true,
  isRankVisible: true,
  enableCopyPaste: true,
  isJudgeResultVisible: true,
  startTime: new Date(),
  endTime: new Date(),
  createTime: new Date(),
  updateTime: new Date(),
  week: 1,
  autoFinalizeScore: false,
  isFinalScoreVisible: false
}
export const exampleAssignmentProblems: AssignmentProblem[] = [
  {
    order: 1,
    assignmentId: 1,
    problemId: 1,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 2,
    assignmentId: 1,
    problemId: 2,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 3,
    assignmentId: 1,
    problemId: 3,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 4,
    assignmentId: 1,
    problemId: 4,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 5,
    assignmentId: 1,
    problemId: 5,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 6,
    assignmentId: 1,
    problemId: 6,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 7,
    assignmentId: 1,
    problemId: 7,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 8,
    assignmentId: 1,
    problemId: 8,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 9,
    assignmentId: 1,
    problemId: 9,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 10,
    assignmentId: 1,
    problemId: 10,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  }
]

export const exampleOrderUpdatedAssignmentProblems: AssignmentProblem[] = [
  {
    order: 1,
    assignmentId: 1,
    problemId: 2,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 2,
    assignmentId: 1,
    problemId: 3,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 3,
    assignmentId: 1,
    problemId: 4,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 4,
    assignmentId: 1,
    problemId: 5,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 5,
    assignmentId: 1,
    problemId: 6,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 6,
    assignmentId: 1,
    problemId: 7,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 7,
    assignmentId: 1,
    problemId: 8,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 8,
    assignmentId: 1,
    problemId: 9,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 9,
    assignmentId: 1,
    problemId: 10,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 10,
    assignmentId: 1,
    problemId: 1,
    score: 1,
    solutionReleaseTime: null,
    createTime: new Date(),
    updateTime: new Date()
  }
]

export const exampleProblemTestcases = [
  {
    id: '1',
    order: '1',
    input: '1',
    output: '1',
    isHidden: false,
    scoreWeightNumerator: 1,
    scoreWeightDenominator: 1
  }
]

export const exampleProblemTags: ProblemTag[] = [
  {
    id: 1,
    problemId: 1,
    tagId: 1
  }
]

export const exampleTag: Tag = {
  id: 1,
  name: 'Brute Force',
  createTime: new Date(),
  updateTime: new Date()
}
