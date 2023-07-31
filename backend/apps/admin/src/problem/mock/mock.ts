import type { Problem } from '@prisma/client'

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
    createTime: undefined,
    updateTime: undefined,
    inputExamples: [],
    outputExamples: []
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
    createTime: undefined,
    updateTime: undefined,
    inputExamples: [],
    outputExamples: []
  }
]
