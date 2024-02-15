import { Language, Level } from '@generated'
import type { Problem } from '@generated'
import { faker } from '@faker-js/faker'
import { createReadStream } from 'fs'
import type { FileUploadDto } from '../dto/file-upload.dto'
import type { UploadFileInput } from '../model/problem.input'
import type { Template } from '../model/template.input'
import type { Testcase } from '../model/testcase.input'

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
    template: [template],
    languages: [Language.Cpp],
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: Level.Level2,
    source: 'mustard source',
    submissionCount: 10,
    acceptedCount: 5,
    acceptedRate: 0.5,
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    exposeTime: faker.date.anytime(),
    samples: [],
    isVisible: true
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
    template: [template],
    languages: [Language.Cpp],
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: Level.Level2,
    source: 'soy source',
    submissionCount: 10,
    acceptedCount: 5,
    acceptedRate: 0.5,
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    exposeTime: faker.date.anytime(),
    samples: [],
    isVisible: true
  }
]

export const testcaseInput: Testcase = {
  input: "wake up, daddy's home",
  output: 'welcome home, sir'
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
export const importedProblems: Problem[] = [
  {
    id: 32,
    createdById: 2,
    groupId: 2,
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
    languages: ['C'],
    timeLimit: 2000,
    memoryLimit: 512,
    difficulty: 'Level3',
    source: '',
    submissionCount: 10,
    acceptedCount: 5,
    acceptedRate: 0.5,
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    exposeTime: faker.date.anytime(),
    samples: [],
    isVisible: true
  },
  {
    id: 33,
    createdById: 2,
    groupId: 2,
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
    languages: ['C', 'Java'],
    timeLimit: 2000,
    memoryLimit: 512,
    difficulty: 'Level4',
    source: '',
    submissionCount: 10,
    acceptedCount: 5,
    acceptedRate: 0.5,
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    exposeTime: faker.date.anytime(),
    samples: [],
    isVisible: true
  }
]
