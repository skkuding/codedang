import type { DataTableCourse } from './Columns'

export const coursesMockData: DataTableCourse[] = [
  {
    id: 1,
    type: 'master',
    title: '전자회로1',
    code: 'CHS1330',
    classNum: null,
    semester: '2026 Winter',
    studentCount: null,
    subRows: [
      {
        id: 11,
        type: 'section',
        title: '전자회로1',
        code: 'CHS1330',
        classNum: 43,
        semester: '2026 Winter',
        studentCount: 12
      },
      {
        id: 12,
        type: 'section',
        title: '전자회로1',
        code: 'CHS1330',
        classNum: 42,
        semester: '2026 Winter',
        studentCount: 41
      }
    ]
  },
  {
    id: 2,
    type: 'master',
    title: '김민규개론',
    code: 'SWE1234',
    classNum: null,
    semester: '2026 Winter',
    studentCount: null,
    subRows: [
      {
        id: 21,
        type: 'section',
        title: '김민규개론',
        code: 'SWE1234',
        classNum: 15,
        semester: '2026 Winter',
        studentCount: 15
      },
      {
        id: 22,
        type: 'section',
        title: '김민규개론',
        code: 'SWE1234',
        classNum: 16,
        semester: '2026 Winter',
        studentCount: 33
      }
    ]
  }
]
