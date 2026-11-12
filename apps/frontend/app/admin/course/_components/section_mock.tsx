export interface CourseTableRow {
  id: number
  type: 'master' | 'section'
  title: string
  code: string
  classNum: number | null
  semester: string
  studentCount: number | null
  subRows?: CourseTableRow[]
}

export const coursesMockData: CourseTableRow[] = [
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
  },
  {
    id: 74,
    type: 'section',
    title: '권수린개론',
    code: 'KSR2026',
    classNum: 1,
    semester: '2026 Fall',
    studentCount: 1
  }
]
